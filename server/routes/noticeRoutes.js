const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  processNotice,
  getHistory,
  getNoticeById,
  toggleChecklistItem,
  deleteNotice,
  createShareLink,
  getSharedNotice,
  getNoticeCalendar,
} = require('../controllers/noticeController');

const router = express.Router();

// Multer: keep files in memory, then stream straight to Cloudinary. 10MB cap.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Public route (no auth) — must come before /:id routes
router.get('/share/:shareId', getSharedNotice);

router.use(protect);

router.post('/process', upload.single('file'), processNotice);
router.get('/', getHistory);
router.get('/:id', getNoticeById);
router.patch('/:id/checklist/:itemIndex', toggleChecklistItem);
router.delete('/:id', deleteNotice);
router.post('/:id/share', createShareLink);
router.get('/:id/calendar.ics', getNoticeCalendar);

module.exports = router;
