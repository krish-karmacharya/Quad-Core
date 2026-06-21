const express = require('express');
const {
  analyzeImage,
  getDetections,
  getDetectionById,
  deleteDetection
} = require('../controllers/detectionController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected detection routes
router.post('/analyze', authMiddleware, upload.single('image'), analyzeImage);
router.get('/', authMiddleware, getDetections);
router.get('/:id', authMiddleware, getDetectionById);
router.delete('/:id', authMiddleware, deleteDetection);

module.exports = router;
