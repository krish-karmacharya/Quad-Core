const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function detectLicensePlate(imagePath) {
  const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';
  
  if (!fs.existsSync(imagePath)) {
    console.error(`Image file not found at ${imagePath}`);
    return {
      performed: false,
      reason: "Smoke detected, but license plate service is unavailable.",
      totalPlates: 0,
      plates: []
    };
  }

  // Attempt 1: Call /detect-plate with field name 'file' (Standalone Service structure)
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const response = await axios.post(`${pythonServiceUrl}/detect-plate`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    console.log('License Plate Service: Attempt 1 (/detect-plate) succeeded.');
    return mapPythonResponse(response.data);
  } catch (error) {
    console.warn('Attempt 1 (/detect-plate with file field) failed. Error:', error.message);
  }

  // Attempt 2: Call /detect with field name 'image' (Stub Service / Colab structure)
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(`${pythonServiceUrl}/detect`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    console.log('License Plate Service: Attempt 2 (/detect) succeeded.');
    return mapPythonResponse(response.data);
  } catch (error) {
    console.error('License Plate Service: All integration attempts failed. Error:', error.message);
    return {
      performed: false,
      reason: `Smoke detected, but license plate service is unavailable: ${error.message}`,
      totalPlates: 0,
      plates: []
    };
  }
}

function mapPythonResponse(data) {
  if (!data) {
    throw new Error('Empty response received from AI service.');
  }

  // Check if response is nested under license_plate_detection (like stub does)
  const source = data.license_plate_detection || data;
  
  const plates = (source.plates || []).map(plate => {
    // Map bounding box keys from different models
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    if (plate.box) {
      x1 = plate.box.x1 ?? plate.box.x ?? 0;
      y1 = plate.box.y1 ?? plate.box.y ?? 0;
      x2 = plate.box.x2 ?? (plate.box.x + (plate.box.width ?? 0)) ?? 0;
      y2 = plate.box.y2 ?? (plate.box.y + (plate.box.height ?? 0)) ?? 0;
    }

    return {
      plateTextOriginal: plate.plateTextOriginal || plate.plate_text_original || '',
      plateTextNormalized: plate.plateTextNormalized || plate.plate_text_normalized || '',
      yoloConfidence: plate.yoloConfidence || plate.yolo_confidence || 0,
      ocrConfidence: plate.ocrConfidence || plate.ocr_confidence || 0,
      box: { x1, y1, x2, y2 }
    };
  });

  return {
    performed: true,
    reason: source.status || "Smoke detected, license plate detection performed.",
    totalPlates: source.total_plates ?? source.totalPlates ?? plates.length,
    plates
  };
}

module.exports = { detectLicensePlate };
