const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const httpError = require('../utils/httpError');

function normalizeSmokeLevel(level) {
  const value = String(level || 'none').toLowerCase();
  if (['low', 'medium', 'heavy', 'none'].includes(value)) return value;
  return 'none';
}

function normalizeBox(box = {}) {
  return {
    x1: Number(box.x1 ?? box.x_1 ?? 0),
    y1: Number(box.y1 ?? box.y_1 ?? 0),
    x2: Number(box.x2 ?? box.x_2 ?? 0),
    y2: Number(box.y2 ?? box.y_2 ?? 0)
  };
}

function normalizeLicensePlates(plates) {
  if (!Array.isArray(plates)) return [];

  return plates.map((plate) => ({
    plateTextOriginal: plate.plateTextOriginal || plate.plate_text_original || '',
    plateTextNormalized: plate.plateTextNormalized || plate.plate_text_normalized || '',
    yoloConfidence: Math.max(0, Math.min(1, Number(plate.yoloConfidence ?? plate.yolo_confidence ?? 0))),
    ocrConfidence: Math.max(0, Math.min(1, Number(plate.ocrConfidence ?? plate.ocr_confidence ?? 0))),
    box: normalizeBox(plate.box)
  }));
}

function normalizeResult(result) {
  const confidence = Number(result.confidenceScore ?? result.confidence ?? 0);
  const smokeLevel = normalizeSmokeLevel(result.smokeLevel ?? result.smoke_level);
  const smokeDetected = Boolean(result.smokeDetected ?? result.smoke_detected ?? smokeLevel !== 'none');
  const licensePlateDetection = result.licensePlateDetection || result.license_plate_detection || {};

  return {
    vehicleType: result.vehicleType || result.vehicle_type || 'unknown',
    smokeDetected,
    smokeLevel: smokeDetected ? smokeLevel : 'none',
    confidenceScore: Math.max(0, Math.min(1, confidence)),
    processedImageUrl: result.processedImageUrl || result.processed_image_url || null,
    detections: Array.isArray(result.detections) ? result.detections : [],
    licensePlateDetection: {
      status: licensePlateDetection.status || '',
      totalPlates: Number(
        licensePlateDetection.totalPlates ?? licensePlateDetection.total_plates ?? 0
      ),
      plates: normalizeLicensePlates(licensePlateDetection.plates)
    }
  };
}

function mockVehicleSmokeResult(req) {
  const demoLevel = String(req.body.demoSmokeLevel || '').toLowerCase();
  const allowedLevels = ['none', 'low', 'medium', 'heavy'];
  const level = allowedLevels.includes(demoLevel) ? demoLevel : 'medium';
  const confidenceByLevel = {
    none: 0.12,
    low: 0.45,
    medium: 0.72,
    heavy: 0.91
  };

  const vehicleType = req.body.demoVehicleType || 'bus';
  const smokeDetected = level !== 'none';

  return {
    vehicleType,
    smokeDetected,
    smokeLevel: level,
    confidenceScore: confidenceByLevel[level],
    processedImageUrl: null,
    detections: smokeDetected
      ? [
          {
            className: 'vehicle',
            confidence: 0.86,
            box: { x1: 80, y1: 120, x2: 530, y2: 420 }
          },
          {
            className: 'smoke',
            confidence: confidenceByLevel[level],
            box: { x1: 420, y1: 80, x2: 680, y2: 260 }
          }
        ]
      : [
          {
            className: 'vehicle',
            confidence: 0.82,
            box: { x1: 80, y1: 120, x2: 530, y2: 420 }
          }
        ],
    licensePlateDetection: {
      status: smokeDetected
        ? 'Mock license plate detection was performed because smoke was detected.'
        : 'Mock license plate detection skipped because no smoke was detected.',
      totalPlates: smokeDetected ? 1 : 0,
      plates: smokeDetected
        ? [
            {
              plateTextOriginal: 'बा २ च १२३४',
              plateTextNormalized: 'बा 2 च 1234',
              yoloConfidence: 0.88,
              ocrConfidence: 0.76,
              box: { x1: 260, y1: 340, x2: 420, y2: 385 }
            }
          ]
        : []
    }
  };
}

async function analyzeVehicleSmoke(filePath, req) {
  if (String(process.env.MOCK_AI).toLowerCase() === 'true') {
    return mockVehicleSmokeResult(req);
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl) {
    throw httpError(500, 'AI_SERVICE_URL is missing');
  }

  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));

  try {
    const response = await axios.post(aiServiceUrl, form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    return normalizeResult(response.data);
  } catch (error) {
    if (error.response) {
      throw httpError(
        502,
        `AI service failed with status ${error.response.status}`
      );
    }

    if (error.code === 'ECONNABORTED') {
      throw httpError(504, 'AI service timed out. Please try again.');
    }

    throw httpError(503, 'AI service is unavailable. Please try again later.');
  }
}

module.exports = { analyzeVehicleSmoke };
