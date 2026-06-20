import os
import sys
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

sys.path.append(os.path.dirname(__file__))
from plate_detector import PlateDetector

app = FastAPI(title="SmokePlate AI - License Plate Detection & OCR Microservice")

# Enable CORS for cross-service calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instance of our plate detector
detector = None

@app.on_event("startup")
def startup_event():
    global detector
    print("=== Initializing AI Models ===")
    detector = PlateDetector()
    print("=== AI Models Loaded Successfully ===")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "detector_loaded": detector is not None
    }

@app.post("/detect-plate")
async def detect_plate(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")
        
    try:
        # Read binary content of uploaded image
        image_bytes = await file.read()
        
        # Convert bytes to numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode image using OpenCV (returns BGR format)
        image_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if image_bgr is None:
            raise HTTPException(status_code=400, detail="Could not decode the uploaded image.")
            
        # Convert BGR to RGB since YOLO and EasyOCR expect RGB format
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        
        # Run license plate detection & OCR
        plates_output = detector.detect_plates(image_rgb)
        
        return {
            "total_plates": len(plates_output),
            "plates": plates_output
        }
        
    except Exception as e:
        print(f"Error in /detect-plate endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Inference processing failed: {str(e)}")
