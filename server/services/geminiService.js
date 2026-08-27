/**
 * geminiService.js
 * Talks to the Google Gemini API (free tier) and forces a strict JSON response
 * matching our fixed schema. Validates + retries once on parse failure.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

const SCHEMA_INSTRUCTIONS = `
You are an assistant that converts long, formal notices (from colleges, universities, or government offices)
into a structured action plan for the reader.

Return ONLY valid JSON — no markdown fences, no commentary, no preamble — matching EXACTLY this shape:

{
  "noticeType": "general" | "lost_found",
  "title": "short descriptive title for this notice, max 8 words",
  "summary": "2-4 sentence plain-language summary of what this notice is about",
  "deadlines": [ { "label": "what the deadline is for", "date": "YYYY-MM-DD or null if not determinable", "rawText": "the exact phrase from the notice describing this deadline" } ],
  "eligibility": ["short eligibility criteria as bullet strings"],
  "requiredDocuments": ["each required document as its own bullet string"],
  "importantInstructions": ["each important instruction as its own bullet string"],
  "actionChecklist": ["ordered, concrete action items the reader must do, each as its own short imperative string"],
  "dontMiss": "the single most critical warning or consequence of missing a deadline, or null if none",
  "itemName": "only if noticeType is lost_found: name of the item, else null",
  "itemStatus": "only if noticeType is lost_found: 'lost' or 'found_handed_over', else null",
  "location": "only if noticeType is lost_found: where it was lost/found, else null",
  "handedToLocation": "only if noticeType is lost_found: office/department it was handed to, else null",
  "reportedDate": "only if noticeType is lost_found: YYYY-MM-DD or null, else null"
}

Rules:
- If the notice is a "Lost & Found" style notice (an item lost or found and handed over), set noticeType to "lost_found" and fill the lost_found fields. Otherwise set those fields to null.
- If a date cannot be confidently converted to YYYY-MM-DD, set "date" to null but still keep "rawText" and "label".
- Never invent facts that are not implied by the notice text.
- Keep arrays empty ([]) rather than omitting them if there is nothing to report.
- Output must be parseable by JSON.parse with no modification.
`;

async function callGemini(noticeText) {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${SCHEMA_INSTRUCTIONS}\n\nNOTICE TEXT:\n"""${noticeText}"""` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(GEMINI_URL(GEMINI_MODEL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }
  return text;
}

function stripFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```$/, '')
    .trim();
}

function validateAndNormalize(parsed) {
  return {
    noticeType: parsed.noticeType === 'lost_found' ? 'lost_found' : 'general',
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : 'Untitled Notice',
    summary: parsed.summary || '',
    deadlines: Array.isArray(parsed.deadlines)
      ? parsed.deadlines.map((d) => ({
          label: d.label || 'Deadline',
          date: d.date || null,
          rawText: d.rawText || '',
        }))
      : [],
    eligibility: Array.isArray(parsed.eligibility) ? parsed.eligibility : [],
    requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments : [],
    importantInstructions: Array.isArray(parsed.importantInstructions) ? parsed.importantInstructions : [],
    actionChecklist: Array.isArray(parsed.actionChecklist)
      ? parsed.actionChecklist.map((text) => ({ text: String(text), done: false }))
      : [],
    dontMiss: parsed.dontMiss || null,
    itemName: parsed.itemName || null,
    itemStatus: parsed.itemStatus === 'lost' || parsed.itemStatus === 'found_handed_over' ? parsed.itemStatus : null,
    location: parsed.location || null,
    handedToLocation: parsed.handedToLocation || null,
    reportedDate: parsed.reportedDate || null,
  };
}

/**
 * Extracts structured data from raw notice text. Retries once if JSON parsing fails.
 */
async function extractNoticeData(noticeText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callGemini(noticeText);
      const cleaned = stripFences(raw);
      const parsed = JSON.parse(cleaned);
      return validateAndNormalize(parsed);
    } catch (err) {
      lastError = err;
      console.warn(`Gemini extraction attempt ${attempt + 1} failed:`, err.message);
    }
  }

  throw new Error(
    `Could not extract structured data from this notice after 2 attempts. Last error: ${lastError.message}`
  );
}

module.exports = { extractNoticeData };
