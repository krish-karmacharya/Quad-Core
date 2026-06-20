# SmokePlate AI - License Plate Detection & OCR Microservice

This Python FastAPI microservice is responsible for license plate detection and optical character recognition (OCR) on vehicle images where smoke/pollution has been detected.

## Tech Stack
* **FastAPI**: Lightweight web framework
* **YOLOv8 (Ultralytics)**: Used to detect license plates
* **EasyOCR**: Performs OCR with dual Nepali (`ne`) and English (`en`) language support
* **OpenCV**: Performs image decoding and cropping

## Hugging Face Model Source
* **Repo**: `krishnamishra8848/Nepal-Vehicle-License-Plate-Detection`
* **File**: `last.pt` (automatically downloaded and cached via `huggingface_hub`)

## Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Service
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. API Endpoints
* `GET /health` - Service health status
* `POST /detect-plate` - Accept multipart image upload (`file` parameter) and return detected license plate texts and confidence coordinates.
