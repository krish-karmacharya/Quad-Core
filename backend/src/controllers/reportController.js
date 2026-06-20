const path = require('path');
const Report = require('../models/Report');
const httpError = require('../utils/httpError');
const { analyzeVehicleSmoke } = require('../services/aiService');

function publicFileUrl(relativePath) {
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
}

function parseCoordinate(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function createReport(req, res, next) {
  try {
    if (!req.file) {
      throw httpError(400, 'Vehicle smoke photo is required');
    }

    const relativeImagePath = path.join('uploads', 'reports', req.file.filename);
    const imageUrl = publicFileUrl(relativeImagePath);

    const aiResult = await analyzeVehicleSmoke(req.file.path, req);

    const report = await Report.create({
      user: req.user._id,
      imagePath: relativeImagePath,
      imageUrl,
      processedImageUrl: aiResult.processedImageUrl,
      locationName: req.body.locationName || '',
      latitude: parseCoordinate(req.body.latitude),
      longitude: parseCoordinate(req.body.longitude),
      vehicleType: aiResult.vehicleType,
      smokeDetected: aiResult.smokeDetected,
      smokeLevel: aiResult.smokeLevel,
      confidenceScore: aiResult.confidenceScore,
      detections: aiResult.detections,
      licensePlateDetection: aiResult.licensePlateDetection,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    next(error);
  }
}

async function getMyReports(req, res, next) {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
}

async function getAllReports(req, res, next) {
  try {
    const { status, smokeLevel, vehicleType, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (smokeLevel) filter.smokeLevel = smokeLevel;
    if (vehicleType) filter.vehicleType = vehicleType;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Report.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: reports.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      reports
    });
  } catch (error) {
    next(error);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'name email');

    if (!report) {
      throw httpError(404, 'Report not found');
    }

    const ownsReport = report.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!ownsReport && !isAdmin) {
      throw httpError(403, 'You do not have permission to view this report');
    }

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function updateReportStatus(req, res, next) {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['pending', 'verified', 'rejected', 'action_taken'];

    if (!allowedStatuses.includes(status)) {
      throw httpError(400, 'Invalid report status');
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || ''
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!report) {
      throw httpError(404, 'Report not found');
    }

    res.json({
      success: true,
      message: 'Report status updated',
      report
    });
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const [statusStats, smokeStats, vehicleStats, recentHighRisk] = await Promise.all([
      Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Report.aggregate([{ $group: { _id: '$smokeLevel', count: { $sum: 1 } } }]),
      Report.aggregate([{ $group: { _id: '$vehicleType', count: { $sum: 1 } } }]),
      Report.find({ smokeLevel: { $in: ['medium', 'heavy'] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('locationName latitude longitude smokeLevel confidenceScore vehicleType createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: statusStats,
        bySmokeLevel: smokeStats,
        byVehicleType: vehicleStats,
        recentHighRisk
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  updateReportStatus,
  getStats
};
