const Detection = require('../models/Detection');
const { formatResponse } = require('../utils/responseFormatter');

// GET /api/admin/detections
const getAdminDetections = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.reviewStatus) {
      filters.reviewStatus = req.query.reviewStatus;
    }

    if (req.query.smokeDetected) {
      filters['smokeDetection.smokeDetected'] = req.query.smokeDetected === 'true';
    }

    if (req.query.plateDetected) {
      if (req.query.plateDetected === 'true') {
        filters['licensePlateDetection.totalPlates'] = { $gt: 0 };
      } else {
        // Can be either perform was false or performed but 0 plates
        filters['licensePlateDetection.totalPlates'] = 0;
      }
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const detections = await Detection.find(filters)
      .sort({ createdAt: -1 })
      .populate('adminReview.reviewedBy', 'name email');

    return res.status(200).json(
      formatResponse(true, 'Admin detections retrieved successfully', detections)
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/detections/:id
const getAdminDetectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detection = await Detection.findById(id).populate('adminReview.reviewedBy', 'name email');
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }
    return res.status(200).json(
      formatResponse(true, 'Detection details retrieved successfully', detection)
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/detections/:id/verify
const verifyDetection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, correctedPlateText } = req.body;

    const detection = await Detection.findById(id);
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }

    detection.reviewStatus = 'VERIFIED';
    detection.adminReview = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      note: note || '',
      correctedPlateText: correctedPlateText || ''
    };

    await detection.save();

    return res.status(200).json(
      formatResponse(true, 'Detection verified successfully', detection)
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/detections/:id/reject
const rejectDetection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const detection = await Detection.findById(id);
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }

    detection.reviewStatus = 'REJECTED';
    detection.adminReview = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      note: note || '',
      correctedPlateText: ''
    };

    await detection.save();

    return res.status(200).json(
      formatResponse(true, 'Detection rejected successfully', detection)
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/detections/:id
const deleteAdminDetection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detection = await Detection.findByIdAndDelete(id);
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }
    return res.status(200).json(
      formatResponse(true, 'Detection record deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDetections,
  getAdminDetectionById,
  verifyDetection,
  rejectDetection,
  deleteAdminDetection
};
