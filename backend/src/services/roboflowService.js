const axios = require('axios');
const fs = require('fs');

async function detectSmoke(imagePath) {
  try {
    const apiKey = process.env.ROBOFLOW_API_KEY;
    const apiUrl = process.env.ROBOFLOW_API_URL || 'https://serverless.roboflow.com';
    const workspace = process.env.ROBOFLOW_WORKSPACE_NAME;
    const workflowId = process.env.ROBOFLOW_WORKFLOW_ID;
    const targetClass = process.env.ROBOFLOW_TARGET_CLASS || 'smoke';

    if (process.env.MOCK_AI === 'true') {
      console.log('Roboflow Service (MOCK): Returning mock smoke detection.');
      return {
        smokeDetected: true,
        totalSmokeDetections: 1,
        detections: [
          {
            class: targetClass,
            confidence: 0.89,
            box: {
              x: 100,
              y: 150,
              width: 200,
              height: 120
            },
            segmentationPointsCount: 42
          }
        ]
      };
    }

    if (!apiKey || !workspace || !workflowId) {
      throw new Error('Roboflow configuration (API key, workspace name, or workflow ID) is missing');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at ${imagePath}`);
    }

    // Read image and convert to base64
    const imageBytes = fs.readFileSync(imagePath);
    const base64Image = imageBytes.toString('base64');

    const url = `${apiUrl}/infer/workflows/${workspace}/${workflowId}`;
    
    const payload = {
      api_key: apiKey,
      inputs: {
        image: {
          type: "base64",
          value: base64Image
        }
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });

    // Navigate the nested Roboflow response
    const outputs = response.data && response.data.outputs;
    let rawPredictions = [];

    if (Array.isArray(outputs) && outputs.length > 0) {
      const firstOutput = outputs[0];
      if (firstOutput.predictions && Array.isArray(firstOutput.predictions)) {
        rawPredictions = firstOutput.predictions;
      } else if (firstOutput.output && firstOutput.output.predictions && Array.isArray(firstOutput.output.predictions)) {
        rawPredictions = firstOutput.output.predictions;
      } else if (firstOutput.output && Array.isArray(firstOutput.output)) {
        rawPredictions = firstOutput.output;
      } else {
        // Try searching for any predictions array in the output keys
        for (const key of Object.keys(firstOutput)) {
          if (firstOutput[key] && firstOutput[key].predictions && Array.isArray(firstOutput[key].predictions)) {
            rawPredictions = firstOutput[key].predictions;
            break;
          }
        }
      }
    } else if (response.data && response.data.predictions && Array.isArray(response.data.predictions)) {
      rawPredictions = response.data.predictions;
    }

    // Filter and map predictions
    const detections = [];
    rawPredictions.forEach(pred => {
      if (pred.class && pred.class.toLowerCase() === targetClass.toLowerCase()) {
        const box = {
          x: pred.x || 0,
          y: pred.y || 0,
          width: pred.width || 0,
          height: pred.height || 0
        };

        const segmentationPointsCount = Array.isArray(pred.points) ? pred.points.length : 0;

        detections.push({
          class: pred.class,
          confidence: pred.confidence || 0,
          box,
          segmentationPointsCount
        });
      }
    });

    return {
      smokeDetected: detections.length > 0,
      totalSmokeDetections: detections.length,
      detections
    };

  } catch (error) {
    console.error('Roboflow Service Error:', error.message);
    const apiError = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    throw new Error('Roboflow API error: ' + apiError);
  }
}

module.exports = { detectSmoke };
