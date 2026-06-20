const express = require('express');
const {
  analyzeImage,
  getDetections,
  getDetectionById,
  deleteDetection
} = require('../controllers/detectionController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public detection routes
router.post('/analyze', upload.single('image'), analyzeImage);
router.get('/', getDetections);
router.get('/:id', getDetectionById);
router.delete('/:id', deleteDetection);

module.exports = router;
