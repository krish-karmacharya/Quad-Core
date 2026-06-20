from ultralytics import YOLO
from huggingface_hub import hf_hub_download
import numpy as np
from app.ocr_reader import read_plate_text

class PlateDetector:
    def __init__(self):
        repo_id = "krishnamishra8848/Nepal-Vehicle-License-Plate-Detection"
        filename = "last.pt"
        print(f"Downloading/Loading YOLO model '{filename}' from Hugging Face repo '{repo_id}'...")
        
        # Download the YOLO model file from Hugging Face Hub (cached automatically)
        model_path = hf_hub_download(repo_id=repo_id, filename=filename)
        print(f"Model downloaded and cached at: {model_path}")
        
        # Load the model using Ultralytics
        self.model = YOLO(model_path)

    def detect_plates(self, image_np):
        """
        Runs YOLO model on the input image numpy array to locate license plates,
        clips the boundaries, performs OCR, and returns the list of results.
        """
        results = self.model.predict(
            image_np,
            conf=0.25,
            verbose=False
        )
        
        detected_plates = []
        h, w = image_np.shape[:2]
        
        for result in results:
            if result.boxes is None:
                continue
                
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            
            for box, conf in zip(boxes, confidences):
                # Map coordinates to integers
                x1, y1, x2, y2 = map(int, box)
                
                # Clamp coordinates to image boundaries
                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w, x2)
                y2 = min(h, y2)
                
                # Verify bounds
                if x2 <= x1 or y2 <= y1:
                    continue
                
                # Crop plate region from original image (using BGR for OpenCV or RGB depending on caller)
                plate_crop = image_np[y1:y2, x1:x2]
                if plate_crop.size == 0:
                    continue
                
                # Perform OCR on the plate region
                plate_text_original, plate_text_normalized, ocr_confidence = read_plate_text(plate_crop)
                
                detected_plates.append({
                    "plate_text_original": plate_text_original,
                    "plate_text_normalized": plate_text_normalized,
                    "yolo_confidence": round(float(conf), 4),
                    "ocr_confidence": round(float(ocr_confidence), 4),
                    "box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    }
                })
                
        return detected_plates
