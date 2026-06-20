const express = require('express');
const upload = require('../config/upload');
const {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  updateReportStatus,
  getStats
} = require('../controllers/reportController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function normalizeReportUpload(req, res, next) {
  const files = req.files || {};
  req.file = files.photo?.[0] || files.image?.[0] || null;
  next();
}

router.post(
  '/',
  protect,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  normalizeReportUpload,
  createReport
);
router.get('/mine', protect, getMyReports);
router.get('/stats', protect, requireAdmin, getStats);
router.get('/', protect, requireAdmin, getAllReports);
router.get('/:id', protect, getReportById);
router.patch('/:id/status', protect, requireAdmin, updateReportStatus);

module.exports = router;
