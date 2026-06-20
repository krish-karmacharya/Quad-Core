# SmokeWatch Python AI Service

FastAPI service for:

- Roboflow smoke detection
- Nepal vehicle license plate detection with YOLO weights from Hugging Face
- EasyOCR plate text extraction for Nepali and English text

The Node backend calls `POST /detect` when `MOCK_AI=false`.

## Install

Use a Python virtual environment.

```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Linux/macOS:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configure

Set these in your shell or in the process manager that runs this service:

```env
ROBOFLOW_API_KEY=your_roboflow_key
ROBOFLOW_API_URL=https://serverless.roboflow.com
ROBOFLOW_WORKSPACE_NAME=lama17chhiring-gmail-com
ROBOFLOW_WORKFLOW_ID=general-segmentation-api
ROBOFLOW_TARGET_CLASS=smoke
PLATE_MODEL_REPO_ID=krishnamishra8848/Nepal-Vehicle-License-Plate-Detection
PLATE_MODEL_FILENAME=last.pt
AI_PUBLIC_BASE_URL=http://localhost:8000
```

In the Node backend `.env`:

```env
MOCK_AI=false
AI_SERVICE_URL=http://localhost:8000/detect
```

## Run

```powershell
uvicorn main:app --reload --port 8000
```

Health check:

```txt
GET http://localhost:8000/health
```

The first `/detect` request downloads/loads the model weights and OCR runtime, so it can be slower than later requests.

## Response Contract

```json
{
  "vehicleType": "unknown",
  "smokeDetected": true,
  "smokeLevel": "heavy",
  "confidenceScore": 0.91,
  "processedImageUrl": "http://localhost:8000/outputs/annotated.jpg",
  "detections": [
    {
      "className": "smoke",
      "confidence": 0.91,
      "box": { "x1": 420, "y1": 80, "x2": 680, "y2": 260 }
    }
  ],
  "licensePlateDetection": {
    "status": "License plate detection was performed because smoke was detected.",
    "totalPlates": 1,
    "plates": [
      {
        "plateTextOriginal": "बा २ च १२३४",
        "plateTextNormalized": "बा 2 च 1234",
        "yoloConfidence": 0.88,
        "ocrConfidence": 0.76,
        "box": { "x1": 260, "y1": 340, "x2": 420, "y2": 385 }
      }
    ]
  }
}
```
