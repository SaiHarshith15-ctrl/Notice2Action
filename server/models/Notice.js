const mongoose = require('mongoose');
const crypto = require('crypto');

const deadlineSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    date: { type: String }, // ISO date string, e.g. "2026-09-15" (may be null if AI couldn't parse a real date)
    rawText: { type: String }, // original phrase from the notice, e.g. "within 10 days of publication"
  },
  { _id: false }
);

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const noticeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true },
    noticeType: { type: String, enum: ['general', 'lost_found'], default: 'general' },

    sourceType: { type: String, enum: ['text', 'file'], default: 'text' },
    sourceText: { type: String }, // raw extracted text, always kept for "View Source Notice"
    sourceFileUrl: { type: String }, // Cloudinary URL if uploaded as PDF/image

    summary: { type: String },
    deadlines: [deadlineSchema],
    eligibility: [{ type: String }],
    requiredDocuments: [{ type: String }],
    importantInstructions: [{ type: String }],
    actionChecklist: [checklistItemSchema],
    dontMiss: { type: String, default: null },

    // Lost & Found specific fields
    itemName: { type: String },
    itemStatus: { type: String, enum: ['lost', 'found_handed_over', null], default: null },
    location: { type: String },
    handedToLocation: { type: String },
    reportedDate: { type: String },

    // Sharing
    shareId: { type: String, unique: true, sparse: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: checklist completion %
noticeSchema.methods.getProgress = function getProgress() {
  const total = this.actionChecklist.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const done = this.actionChecklist.filter((i) => i.done).length;
  return { done, total, percent: Math.round((done / total) * 100) };
};

noticeSchema.methods.generateShareId = function generateShareId() {
  this.shareId = crypto.randomBytes(6).toString('hex');
  this.isPublic = true;
  return this.shareId;
};

module.exports = mongoose.model('Notice', noticeSchema);
