# SmokePlate AI - Vehicle Smoke Detection & License Plate Recognition

SmokePlate AI is a MERN-based full-stack solution integrated with Python FastAPI AI microservices. Users upload vehicle images, the system performs real-time smoke emission checks using Roboflow APIs, and if smoke is detected, triggers a license plate detector (YOLO) and OCR text reader (EasyOCR with Nepali and English language support). Detections are logged to MongoDB and reviewed via an interactive admin verification dashboard.

---

## Folder Structure

```text
smokeplate-ai/
├── frontend/             # React (Vite) + Tailwind CSS v4 frontend
├── backend/              # Node.js + Express.js backend
├── python-service/       # Python FastAPI model inference microservice
├── README.md             # This guide
└── .gitignore            # Git ignore configuration
```

---

## Core Workflow

1. **Upload**: User uploads a vehicle image via the React frontend.
2. **Backend Storage**: Node.js backend handles image upload constraints via Multer.
3. **Smoke Analysis**: Node.js backend executes a Roboflow API check to see if smoke is present.
4. **Conditional OCR**:
   * If smoke is **not** detected: The plate recognition is skipped, the record status is saved as `NO_SMOKE`, and the review state is marked `PENDING`.
   * If smoke **is** detected: The image is piped to the Python service, which uses YOLO to find the license plate, crops it, and runs EasyOCR (Nepali + English) to extract original and normalized texts (Arabic digits converted from Devnagari digits).
5. **Review Queue**: All new records are saved with `reviewStatus = PENDING`.
6. **Verification**: Admins log in to verify details, add comments, adjust misread license plates, or reject false reports.

---

## Prerequisites

Ensure you have the following installed locally:
* **Node.js** (v18 or higher)
* **Python** (v3.9 or higher)
* **MongoDB Community Server** (started locally on `mongodb://127.0.0.1:27017/`)

---

## Setup & Running Guide

### 1. Database (MongoDB)
Start your local MongoDB instance. In Windows, this is typically done automatically as a service, or can be started manually:
```bash
net start MongoDB
```

### 2. Backend Service
Configure credentials and run:
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# (Optional) Review or edit environment settings in backend/.env
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/smokeplate_ai
# JWT_SECRET=your_jwt_secret_here
# ROBOFLOW_API_KEY=your_roboflow_api_key_here

# Seed the default admin credentials
npm run seed:admin

# Start the Node development server
npm run dev
```

### 3. Python AI Microservice
Set up the AI environment:
```bash
# Navigate to the python-service directory
cd python-service

# Create a virtual environment (recommended)
python -m venv .venv
# Activate it on Windows
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server via Uvicorn (on port 8000)
uvicorn app.main:app --reload --port 8000
```
*Note: On first execution, the Python service will download the Nepali EasyOCR dictionaries and the YOLO Nepal vehicle license plate model (`last.pt` from Hugging Face hub `krishnamishra8848/Nepal-Vehicle-License-Plate-Detection`). This may take a few minutes.*

### 4. Frontend Application
Start the dev server:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite React development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Admin Portal Authentication

Navigate to the **Admin Portal** button on the top right, or directly visit `http://localhost:5173/admin/login` and use the seeded credentials:

* **Email:** `admin@smokeplate.ai`
* **Password:** `Admin@12345`

> [!WARNING]
> **Production Security Note:** Seeded credentials are for development/testing only. Remember to change the admin password in the MongoDB database or update environment seeding scripts prior to production deployments.

---

## Security Notes

1. **API Keys**: The Roboflow API key is kept strictly in the backend `.env` and never exposed to the client frontend.
2. **Access Control**: All `/api/admin/` routes require a valid JWT Bearer token in the `Authorization` header and confirm that the user has an `admin` role.
3. **Upload Constraints**: Only `.jpg`, `.jpeg`, `.png`, and `.webp` extensions are allowed, restricted to a maximum size of `10MB`.