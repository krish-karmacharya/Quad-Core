import os
import re
import cv2
import uuid
import numpy as np
import easyocr
import torch
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from inference_sdk import InferenceHTTPClient
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

app = FastAPI(title="SmokePlate AI - Integrated AI Service Stub")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

# Configuration (using Roboflow credentials from your Colab copy-paste script as fallback)
API_URL = "https://serverless.roboflow.com"
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY") or "lJZZwXEuTKO3chOjtF6K"
WORKSPACE_NAME = os.getenv("ROBOFLOW_WORKSPACE_NAME") or "lama17chhiring-gmail-com"
WORKFLOW_ID = os.getenv("ROBOFLOW_WORKFLOW_ID") or "general-segmentation-api"
TARGET_CLASS = os.getenv("ROBOFLOW_TARGET_CLASS") or "smoke"
AI_PUBLIC_BASE_URL = os.getenv("AI_PUBLIC_BASE_URL") or "http://localhost:8000"

# Global instances
roboflow_client = None
plate_model = None
reader = None

@app.on_event("startup")
def startup_event():
    global roboflow_client, plate_model, reader
    print("=== Initializing AI Stub Models ===")
    
    # Initialize Roboflow Client
    roboflow_client = InferenceHTTPClient(
        api_url=API_URL,
        api_key=ROBOFLOW_API_KEY
    )
    
    # Download and load YOLO model
    weights_path = hf_hub_download(
        repo_id="krishnamishra8848/Nepal-Vehicle-License-Plate-Detection",
        filename="last.pt"
    )
    plate_model = YOLO(weights_path)
    
    # Load EasyOCR
    use_gpu = torch.cuda.is_available()
    try:
        reader = easyocr.Reader(['ne', 'en'], gpu=use_gpu)
        print("✅ EasyOCR Nepali + English loaded.")
    except Exception as e:
        print(f"⚠️ Nepali OCR failed to load ({e}). Using English OCR only.")
        reader = easyocr.Reader(['en'], gpu=use_gpu)
    
    print("=== AI Stub Models Loaded Successfully ===")

@app.get("/health")
def health():
    return {
        "success": True,
        "service": "SmokePlate AI Service Stub",
        "modelsLoaded": plate_model is not None,
        "roboflowConfigured": bool(ROBOFLOW_API_KEY)
    }

# Preprocessing & Normalization Helpers from Colab
def clean_plate_text(text: str) -> str:
    text = text.upper()
    text = re.sub(r'[^A-Z0-9\u0900-\u097F ]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def convert_nepali_digits_to_english(text: str) -> str:
    nepali_to_english_digits = {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    }
    for nepali_digit, english_digit in nepali_to_english_digits.items():
        text = text.replace(nepali_digit, english_digit)
    return text

def preprocess_plate_for_ocr(plate_crop):
    if plate_crop is None or plate_crop.size == 0:
        return None
    resized = cv2.resize(plate_crop, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    return enhanced

def read_plate_text(plate_crop):
    processed_plate = preprocess_plate_for_ocr(plate_crop)
    if processed_plate is None:
        return "", "", 0.0
    ocr_results = reader.readtext(processed_plate, detail=1, paragraph=False)
    texts = []
    scores = []
    for result in ocr_results:
        detected_text = result[1]
        confidence = result[2]
        cleaned_text = clean_plate_text(detected_text)
        if cleaned_text:
            texts.append(cleaned_text)
            scores.append(confidence)
    original_text = clean_plate_text(" ".join(texts))
    normalized_text = convert_nepali_digits_to_english(original_text)
    avg_confidence = sum(scores) / len(scores) if scores else 0.0
    return original_text, normalized_text, avg_confidence

def find_roboflow_predictions(data):
    predictions = []
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "predictions" and isinstance(value, list):
                predictions.extend(value)
            else:
                predictions.extend(find_roboflow_predictions(value))
    elif isinstance(data, list):
        for item in data:
            predictions.extend(find_roboflow_predictions(item))
    return predictions

def clamp_box(x1, y1, x2, y2, width, height):
    return (
        max(0, min(width, int(x1))),
        max(0, min(height, int(y1))),
        max(0, min(width, int(x2))),
        max(0, min(height, int(y2))),
    )

@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")
        
    try:
        # Read file bytes
        image_bytes = await image.read()
        
        # Save temp file for Roboflow API which expects a filepath
        temp_name = f"{uuid.uuid4().hex}_{image.filename}"
        temp_path = BASE_DIR / temp_name
        with open(temp_path, "wb") as f:
            f.write(image_bytes)
            
        # Read into OpenCV
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise Exception("Image could not be decoded.")
            
        height, width = img.shape[:2]
        
        # Step 1: Smoke detection
        result = roboflow_client.run_workflow(
            workspace_name=WORKSPACE_NAME,
            workflow_id=WORKFLOW_ID,
            images={"image": str(temp_path)},
            parameters={"classes": TARGET_CLASS},
            use_cache=True
        )
        
        # Delete temp file
        if temp_path.exists():
            temp_path.unlink()
            
        predictions = find_roboflow_predictions(result)
        smoke_detections = []
        annotated_img = img.copy()
        
        for pred in predictions:
            class_name = pred.get("class", pred.get("class_name", "unknown"))
            confidence = float(pred.get("confidence", 0))
            smoke_data = {
                "class": class_name,
                "confidence": round(confidence, 4)
            }
            if all(k in pred for k in ["x", "y", "width", "height"]):
                x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
                x1, y1, x2, y2 = clamp_box(x - w / 2, y - h / 2, x + w / 2, y + h / 2, width, height)
                smoke_data["box"] = {"x": x, "y": y, "width": w, "height": h}
                cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(annotated_img, f"Smoke {confidence:.2f}", (x1, max(y1 - 10, 30)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                
            if "points" in pred:
                points = np.array([[p["x"], p["y"]] for p in pred["points"]], dtype=np.int32)
                smoke_data["segmentation_points_count"] = len(pred["points"])
                cv2.polylines(annotated_img, [points], True, (0, 0, 255), 2)
                overlay = annotated_img.copy()
                cv2.fillPoly(overlay, [points], (0, 0, 255))
                annotated_img = cv2.addWeighted(overlay, 0.4, annotated_img, 0.6, 0)
                
            smoke_detections.append(smoke_data)
            
        smoke_detected = len(smoke_detections) > 0
        original_img = img.copy()
        license_plates = []
        
        # Step 2: License plate detection + OCR if smoke is detected
        if smoke_detected:
            results = plate_model.predict(annotated_img, conf=0.25, verbose=False)
            for r in results:
                if r.boxes is not None:
                    boxes = r.boxes.xyxy.cpu().numpy()
                    confidences = r.boxes.conf.cpu().numpy()
                    for box, conf in zip(boxes, confidences):
                        x1, y1, x2, y2 = clamp_box(*box, width, height)
                        if x2 <= x1 or y2 <= y1:
                            continue
                        plate_crop = original_img[y1:y2, x1:x2]
                        if plate_crop.size == 0:
                            continue
                        plate_text_original, plate_text_normalized, ocr_confidence = read_plate_text(plate_crop)
                        
                        license_plates.append({
                            "plate_text_original": plate_text_original,
                            "plate_text_normalized": plate_text_normalized,
                            "yolo_confidence": round(float(conf), 4),
                            "ocr_confidence": round(float(ocr_confidence), 4),
                            "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                        })
                        cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 255, 0), 3)
                        cv2.putText(annotated_img, "License Plate", (x1, max(y1 - 10, 30)), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            plate_status = "License plate detection was performed because smoke was detected."
        else:
            plate_status = "License plate detection skipped because no smoke was detected."
            
        # Save output image
        out_filename = f"{uuid.uuid4().hex}.jpg"
        out_path = OUTPUT_DIR / out_filename
        cv2.imwrite(str(out_path), annotated_img)
        processed_url = f"{AI_PUBLIC_BASE_URL.rstrip('/')}/outputs/{out_filename}"
        
        return {
            "image": image.filename,
            "smoke_detection": {
                "smoke_detected": smoke_detected,
                "total_smoke_detections": len(smoke_detections),
                "detections": smoke_detections
            },
            "license_plate_detection": {
                "status": plate_status,
                "total_plates": len(license_plates),
                "plates": license_plates
            },
            "processed_image_url": processed_url
        }
    except Exception as e:
        print(f"Error processing image: {e}")
        # Clean temp file in case of error
        if 'temp_path' in locals() and temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))
