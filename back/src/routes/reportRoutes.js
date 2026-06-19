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

router.post('/', protect, upload.single('photo'), createReport);
router.get('/mine', protect, getMyReports);
router.get('/stats', protect, requireAdmin, getStats);
router.get('/', protect, requireAdmin, getAllReports);
router.get('/:id', protect, getReportById);
router.patch('/:id/status', protect, requireAdmin, updateReportStatus);

module.exports = router;
