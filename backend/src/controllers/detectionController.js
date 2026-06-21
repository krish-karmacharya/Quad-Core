const Detection = require('../models/Detection');
const { detectSmoke } = require('../services/roboflowService');
const { detectLicensePlate } = require('../services/pythonAIService');
const { formatResponse } = require('../utils/responseFormatter');

// POST /api/detections/analyze
const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const imagePath = `uploads/${req.file.filename}`; // relative path stored in database
    const absolutePath = req.file.path;
    const originalFileName = req.file.originalname;

    // 1. Run Roboflow smoke detection
    let smokeResult;
    try {
      smokeResult = await detectSmoke(absolutePath);
    } catch (err) {
      console.error('Roboflow failure:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Roboflow API error: ' + err.message 
      });
    }

    let plateResult = {
      performed: false,
      reason: 'No smoke detected, license plate detection skipped.',
      totalPlates: 0,
      plates: []
    };

    let status = 'NO_SMOKE';

    // 2. If smoke detected, run Python plate detection & OCR
    if (smokeResult.smokeDetected) {
      plateResult = await detectLicensePlate(absolutePath);
      
      if (plateResult.performed) {
        if (plateResult.totalPlates > 0) {
          status = 'PLATE_DETECTED';
        } else {
          status = 'PLATE_NOT_FOUND';
        }
      } else {
        // Python service failed/offline
        status = 'SMOKE_DETECTED';
      }
    }

    // 3. Save to MongoDB
    const newDetection = new Detection({
      imagePath,
      originalFileName,
      smokeDetection: {
        smokeDetected: smokeResult.smokeDetected,
        totalSmokeDetections: smokeResult.totalSmokeDetections,
        detections: smokeResult.detections
      },
      licensePlateDetection: plateResult,
      status,
      reviewStatus: 'PENDING'
    });

    await newDetection.save();

    return res.status(201).json(
      formatResponse(true, 'Analysis completed and sent for admin review', newDetection)
    );

  } catch (error) {
    next(error);
  }
};

// GET /api/detections
const getDetections = async (req, res, next) => {
  try {
    const detections = await Detection.find().sort({ createdAt: -1 });
    return res.status(200).json(
      formatResponse(true, 'Detections retrieved successfully', detections)
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/detections/:id
const getDetectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detection = await Detection.findById(id);
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }
    return res.status(200).json(
      formatResponse(true, 'Detection retrieved successfully', detection)
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/detections/:id
const deleteDetection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detection = await Detection.findByIdAndDelete(id);
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }
    return res.status(200).json(
      formatResponse(true, 'Detection deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeImage,
  getDetections,
  getDetectionById,
  deleteDetection
};
