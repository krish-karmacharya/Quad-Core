# SmokeWatch Nepal Backend MVP

MERN-compatible backend for an AI-based vehicle smoke reporting system.

Users can upload a vehicle-smoke photo, the backend stores the image, calls an AI detection service, saves the result in MongoDB, and allows admins to verify/reject reports.

## Tech Stack

- Node.js 24 LTS
- Express 5
- MongoDB + Mongoose
- Multer for image upload
- JWT authentication
- Python FastAPI AI service integration point
- Optional mock AI mode for hackathon demo

## Folder Structure

```txt
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
uploads/
  reports/
  processed/
ai-service-stub/
```

## Setup

### 1. Install Node.js LTS

Use Node.js 24 LTS.

Check version:

```bash
node -v
npm -v
```

### 2. Install MongoDB

Use either:

- MongoDB Compass + local MongoDB server
- MongoDB Atlas cloud database

Local default URI:

```txt
mongodb://127.0.0.1:27017/smokewatch_mvp
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create `.env`

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
copy .env.example .env
```

Update values if needed.

For first demo, keep:

```env
MOCK_AI=true
```

This means the backend will return a demo smoke result even before your YOLO/FastAPI service is ready.

### 5. Seed admin user

```bash
npm run seed:admin
```

Default admin from `.env.example`:

```txt
email: admin@smokewatch.local
password: Admin@12345
```

### 6. Run development server

```bash
npm run dev
```

Server:

```txt
http://localhost:5000
```

Health check:

```txt
GET http://localhost:5000/api/health
```

## API Endpoints

### Auth

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user/admin |
| GET | `/api/auth/me` | User/Admin | Get logged-in profile |

### Reports

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/reports` | User/Admin | Submit vehicle smoke photo |
| GET | `/api/reports/mine` | User/Admin | View own reports |
| GET | `/api/reports/:id` | Owner/Admin | View single report |
| GET | `/api/reports` | Admin | View all reports (filter/sort) |
| PATCH | `/api/reports/:id/status` | Admin | Update status |
| GET | `/api/reports/stats` | Admin | Dashboard stats |

### Report list query params (admin)

| Param | Example | Purpose |
|---|---|---|
| `status` | `pending` | Filter by workflow status |
| `smokeLevel` | `heavy` | Filter by AI smoke density |
| `severity` | `high` | Filter by computed severity label |
| `minSeverityIndex` | `61` | Filter reports at or above severity index |
| `sortBy` | `severityIndex` | Sort by `createdAt`, `severityIndex`, or `confidenceScore` |
| `sortOrder` | `desc` | `asc` or `desc` |
| `page` | `1` | Pagination page |
| `limit` | `20` | Page size (max 100) |

### Severity index

Each report gets a computed `severityIndex` (0–100) and `severity` label from AI output:

| Field | Values |
|---|---|
| `severityIndex` | `0`–`100` numeric score |
| `severity` | `none`, `low`, `medium`, `high`, `critical` |
| `recommendedAction` | Human-readable guidance for admins |

Scoring logic:

- Base score from `smokeLevel`: none `0`, low `20`, medium `45`, heavy `70`
- Up to `+15` from AI `confidenceScore`
- `+10` when a license plate is detected

### Admin status workflow

Reports start as `pending`. Allowed transitions:

| Current | Can move to |
|---|---|
| `pending` | `verified`, `rejected` |
| `verified` | `action_taken`, `rejected`, `pending` |
| `rejected` | `pending` |
| `action_taken` | _(terminal — no further status changes)_ |

## Test With cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sagar","email":"sagar@example.com","password":"Password@123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sagar@example.com","password":"Password@123"}'
```

Copy the returned token.

### Submit Report

Replace `YOUR_TOKEN_HERE` and `photo.jpg`.

```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "photo=@photo.jpg" \
  -F "locationName=Koteshwor, Kathmandu" \
  -F "latitude=27.678" \
  -F "longitude=85.349" \
  -F "demoSmokeLevel=heavy" \
  -F "demoVehicleType=bus"
```

### Admin Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smokewatch.local","password":"Admin@12345"}'
```

### Admin Update Status

```bash
curl -X PATCH http://localhost:5000/api/reports/REPORT_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status":"verified","adminNote":"Smoke clearly visible."}'
```

## Frontend Upload Field Names

When you build React frontend, use these fields:

```js
const formData = new FormData();
formData.append('photo', file);
formData.append('locationName', 'Koteshwor, Kathmandu');
formData.append('latitude', '27.678');
formData.append('longitude', '85.349');
```

## AI Service Integration

The repo includes a FastAPI AI service in `ai-service-stub/` that integrates:

- Roboflow smoke detection
- Nepal license plate YOLO detection
- EasyOCR for Nepali/English plate text

Install and run it:

```powershell
cd ai-service-stub
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
$env:ROBOFLOW_API_KEY="your_roboflow_key"
uvicorn main:app --reload --port 8000
```

Then set the Node backend:

```env
MOCK_AI=false
AI_SERVICE_URL=http://localhost:8000/detect
AI_PUBLIC_BASE_URL=http://localhost:8000
```

Expected AI response:

```json
{
  "vehicleType": "bus",
  "smokeDetected": true,
  "smokeLevel": "heavy",
  "severityIndex": 95,
  "severity": "critical",
  "recommendedAction": "Urgent review — immediate enforcement recommended",
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

## MVP Notes

- This backend does not directly measure CO2.
- It detects visible vehicle smoke/emission signs from images.
- Use `MOCK_AI=true` during UI/backend demo.
- Add the real YOLO/FastAPI model after the backend is working.
