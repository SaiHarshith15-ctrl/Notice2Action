const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');
const { extractNoticeData } = require('../services/geminiService');
const { uploadBuffer } = require('../services/cloudinaryService');
const { extractTextFromPdf } = require('../services/pdfService');
const { buildIcsForNotice } = require('../services/icsService');

/**
 * Computes upcoming / due_soon / passed for a single deadline date (YYYY-MM-DD).
 */
function getDeadlineStatus(dateStr) {
  if (!dateStr) return 'unknown';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  if (Number.isNaN(deadline.getTime())) return 'unknown';
  deadline.setHours(0, 0, 0, 0);

  const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'passed';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
}

function decorateWithStatus(noticeDoc) {
  const notice = noticeDoc.toObject ? noticeDoc.toObject() : noticeDoc;
  notice.deadlines = (notice.deadlines || []).map((d) => ({
    ...d,
    status: getDeadlineStatus(d.date),
  }));
  notice.progress = noticeDoc.getProgress ? noticeDoc.getProgress() : null;
  return notice;
}

// POST /api/notices/process  { text }  OR  multipart file upload
const processNotice = asyncHandler(async (req, res) => {
  let sourceText = req.body.text;
  let sourceType = 'text';
  let sourceFileUrl = null;

  if (req.file) {
    sourceType = 'file';
    const isPdf = req.file.mimetype === 'application/pdf';

    const uploadResult = await uploadBuffer(req.file.buffer, req.file.originalname);
    sourceFileUrl = uploadResult.secure_url;

    if (isPdf) {
      sourceText = await extractTextFromPdf(req.file.buffer);
    } else {
      // Image upload: we can't OCR here for free without another API, so require
      // the user to also paste text if they only have an image. We still store the image.
      if (!sourceText || !sourceText.trim()) {
        res.status(400);
        throw new Error(
          'Image uploads need the notice text pasted in alongside the image (no free OCR configured). Please paste the text or upload a text-based PDF instead.'
        );
      }
    }
  }

  if (!sourceText || !sourceText.trim()) {
    res.status(400);
    throw new Error('Please paste notice text or upload a PDF.');
  }

  const extracted = await extractNoticeData(sourceText);

  const notice = await Notice.create({
    user: req.user._id,
    title: extracted.title,
    noticeType: extracted.noticeType,
    sourceType,
    sourceText,
    sourceFileUrl,
    summary: extracted.summary,
    deadlines: extracted.deadlines,
    eligibility: extracted.eligibility,
    requiredDocuments: extracted.requiredDocuments,
    importantInstructions: extracted.importantInstructions,
    actionChecklist: extracted.actionChecklist,
    dontMiss: extracted.dontMiss,
    itemName: extracted.itemName,
    itemStatus: extracted.itemStatus,
    location: extracted.location,
    handedToLocation: extracted.handedToLocation,
    reportedDate: extracted.reportedDate,
  });

  res.status(201).json(decorateWithStatus(notice));
});

// GET /api/notices  (history, newest first, optional ?search=)
const getHistory = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { user: req.user._id };
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  const notices = await Notice.find(filter).sort({ createdAt: -1 });
  res.json(
    notices.map((n) => ({
      id: n._id,
      title: n.title,
      noticeType: n.noticeType,
      createdAt: n.createdAt,
      earliestDeadline: (n.deadlines || []).map((d) => d.date).filter(Boolean).sort()[0] || null,
      progress: n.getProgress(),
      itemStatus: n.itemStatus,
    }))
  );
});

// GET /api/notices/:id
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, user: req.user._id });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  res.json(decorateWithStatus(notice));
});

// PATCH /api/notices/:id/checklist/:itemIndex   { done: true|false }
const toggleChecklistItem = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, user: req.user._id });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  const idx = Number(req.params.itemIndex);
  if (!notice.actionChecklist[idx]) {
    res.status(400);
    throw new Error('Checklist item not found');
  }
  notice.actionChecklist[idx].done = Boolean(req.body.done);
  await notice.save();
  res.json(decorateWithStatus(notice));
});

// DELETE /api/notices/:id
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  res.json({ message: 'Notice deleted' });
});

// POST /api/notices/:id/share  -> creates/returns a public share link id
const createShareLink = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, user: req.user._id });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  if (!notice.shareId) {
    notice.generateShareId();
    await notice.save();
  }
  res.json({ shareId: notice.shareId, url: `${process.env.CLIENT_URL || ''}/share/${notice.shareId}` });
});

// GET /api/notices/share/:shareId  (public, no auth)
const getSharedNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ shareId: req.params.shareId, isPublic: true });
  if (!notice) {
    res.status(404);
    throw new Error('Shared plan not found or no longer public');
  }
  res.json(decorateWithStatus(notice));
});

// GET /api/notices/:id/calendar.ics  -> FREE FEATURE: downloadable calendar file for deadlines
const getNoticeCalendar = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, user: req.user._id });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  const ics = buildIcsForNotice(notice);
  res.set('Content-Type', 'text/calendar');
  res.set('Content-Disposition', `attachment; filename="${notice.title.replace(/[^a-z0-9]/gi, '_')}.ics"`);
  res.send(ics);
});

module.exports = {
  processNotice,
  getHistory,
  getNoticeById,
  toggleChecklistItem,
  deleteNotice,
  createShareLink,
  getSharedNotice,
  getNoticeCalendar,
};
