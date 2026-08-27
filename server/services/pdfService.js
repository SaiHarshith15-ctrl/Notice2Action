const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from a PDF buffer.
 * Throws a friendly error if the PDF has no extractable text (e.g. a pure scanned image with no OCR layer).
 */
async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  const text = (data.text || '').trim();
  if (!text) {
    throw new Error(
      'No text could be extracted from this PDF. It may be a scanned image — try uploading a text-based PDF or pasting the text directly.'
    );
  }
  return text;
}

module.exports = { extractTextFromPdf };
