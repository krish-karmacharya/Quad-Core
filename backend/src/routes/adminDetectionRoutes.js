const express = require('express');
const {
  getAdminDetections,
  getAdminDetectionById,
  verifyDetection,
  rejectDetection,
  deleteAdminDetection
} = require('../controllers/adminDetectionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Apply authMiddleware and adminMiddleware to all routes below
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAdminDetections);
router.get('/:id', getAdminDetectionById);
router.patch('/:id/verify', verifyDetection);
router.patch('/:id/reject', rejectDetection);
router.delete('/:id', deleteAdminDetection);

module.exports = router;
