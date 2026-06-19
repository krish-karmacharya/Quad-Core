import json
import os
import re
import tempfile
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles


app = FastAPI(title="SmokeWatch AI Service")

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

API_URL = os.getenv("ROBOFLOW_API_URL", "https://serverless.roboflow.com")
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
WORKSPACE_NAME = os.getenv("ROBOFLOW_WORKSPACE_NAME", "lama17chhiring-gmail-com")
WORKFLOW_ID = os.getenv("ROBOFLOW_WORKFLOW_ID", "general-segmentation-api")
TARGET_CLASS = os.getenv("ROBOFLOW_TARGET_CLASS", "smoke")

PLATE_MODEL_REPO_ID = os.getenv(
    "PLATE_MODEL_REPO_ID",
    "krishnamishra8848/Nepal-Vehicle-License-Plate-Detection",
)
PLATE_MODEL_FILENAME = os.getenv("PLATE_MODEL_FILENAME", "last.pt")
PLATE_CONFIDENCE = float(os.getenv("PLATE_CONFIDENCE", "0.25"))

SMOKE_LEVEL_LOW_THRESHOLD = float(os.getenv("SMOKE_LEVEL_LOW_THRESHOLD", "0.4"))
SMOKE_LEVEL_HEAVY_THRESHOLD = float(os.getenv("SMOKE_LEVEL_HEAVY_THRESHOLD", "0.8"))

AI_PUBLIC_BASE_URL = os.getenv("AI_PUBLIC_BASE_URL", "http://localhost:8000")

_runtime: dict[str, Any] = {
    "cv2": None,
    "np": None,
    "roboflow_client": None,
    "plate_model": None,
    "reader": None,
    "device_gpu": False,
    "loaded": False,
}


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "SmokeWatch AI Service",
        "modelsLoaded": _runtime["loaded"],
        "roboflowConfigured": bool(ROBOFLOW_API_KEY),
    }


def load_runtime():
    if _runtime["loaded"]:
        return

    if not ROBOFLOW_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ROBOFLOW_API_KEY is missing. Set it in the AI service environment.",
        )

    try:
        import cv2
        import easyocr
        import numpy as np
        import torch
        from huggingface_hub import hf_hub_download
        from inference_sdk import InferenceHTTPClient
        from ultralytics import YOLO
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI dependencies are not installed: {exc}",
        ) from exc

    _runtime["cv2"] = cv2
    _runtime["np"] = np
    _runtime["roboflow_client"] = InferenceHTTPClient(
        api_url=API_URL,
        api_key=ROBOFLOW_API_KEY,
    )

    weights_path = hf_hub_download(
        repo_id=PLATE_MODEL_REPO_ID,
        filename=PLATE_MODEL_FILENAME,
    )
    _runtime["plate_model"] = YOLO(weights_path)

    use_gpu = torch.cuda.is_available()
    _runtime["device_gpu"] = use_gpu
    try:
        _runtime["reader"] = easyocr.Reader(["ne", "en"], gpu=use_gpu)
    except Exception:
        _runtime["reader"] = easyocr.Reader(["en"], gpu=use_gpu)

    _runtime["loaded"] = True


def clean_plate_text(text: str) -> str:
    text = text.upper()
    text = re.sub(r"[^A-Z0-9\u0900-\u097F ]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def convert_nepali_digits_to_english(text: str) -> str:
    digit_map = {
        "०": "0",
        "१": "1",
        "२": "2",
        "३": "3",
        "४": "4",
        "५": "5",
        "६": "6",
        "७": "7",
        "८": "8",
        "९": "9",
    }

    for nepali_digit, english_digit in digit_map.items():
        text = text.replace(nepali_digit, english_digit)

    return text


def preprocess_plate_for_ocr(plate_crop):
    cv2 = _runtime["cv2"]

    if plate_crop is None or plate_crop.size == 0:
        return None

    resized = cv2.resize(plate_crop, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


def read_plate_text(plate_crop):
    reader = _runtime["reader"]
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


def smoke_level_from_confidence(confidence: float) -> str:
    if confidence >= SMOKE_LEVEL_HEAVY_THRESHOLD:
        return "heavy"
    if confidence >= SMOKE_LEVEL_LOW_THRESHOLD:
        return "medium"
    return "low"


def detect_smoke(image_path: str, image):
    cv2 = _runtime["cv2"]
    np = _runtime["np"]
    client = _runtime["roboflow_client"]

    result = client.run_workflow(
        workspace_name=WORKSPACE_NAME,
        workflow_id=WORKFLOW_ID,
        images={"image": image_path},
        parameters={"classes": TARGET_CLASS},
        use_cache=True,
    )

    predictions = find_roboflow_predictions(result)
    smoke_detections = []
    annotated_img = image.copy()
    height, width = image.shape[:2]

    for pred in predictions:
        class_name = pred.get("class", pred.get("class_name", "unknown"))
        confidence = float(pred.get("confidence", 0))
        smoke_data = {
            "className": class_name,
            "confidence": round(confidence, 4),
        }

        if all(key in pred for key in ["x", "y", "width", "height"]):
            x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
            x1, y1, x2, y2 = clamp_box(
                x - w / 2,
                y - h / 2,
                x + w / 2,
                y + h / 2,
                width,
                height,
            )
            smoke_data["box"] = {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(
                annotated_img,
                f"Smoke {confidence:.2f}",
                (x1, max(y1 - 10, 30)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 255),
                2,
            )

        if "points" in pred:
            points = np.array(
                [[point["x"], point["y"]] for point in pred["points"]],
                dtype=np.int32,
            )
            smoke_data["segmentationPointsCount"] = len(pred["points"])
            overlay = annotated_img.copy()
            cv2.polylines(annotated_img, [points], True, (0, 0, 255), 2)
            cv2.fillPoly(overlay, [points], (0, 0, 255))
            annotated_img = cv2.addWeighted(overlay, 0.4, annotated_img, 0.6, 0)

        smoke_detections.append(smoke_data)

    return smoke_detections, annotated_img


def detect_license_plate(image, original_image):
    cv2 = _runtime["cv2"]
    plate_model = _runtime["plate_model"]

    results = plate_model.predict(image, conf=PLATE_CONFIDENCE, verbose=False)
    detected_plates = []
    annotated_img = image.copy()
    height, width = image.shape[:2]

    for result in results:
        if result.boxes is None:
            continue

        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()

        for box, confidence in zip(boxes, confidences):
            x1, y1, x2, y2 = clamp_box(*box, width, height)
            if x2 <= x1 or y2 <= y1:
                continue

            plate_crop = original_image[y1:y2, x1:x2]
            if plate_crop.size == 0:
                continue

            plate_text_original, plate_text_normalized, ocr_confidence = read_plate_text(plate_crop)
            detected_plates.append(
                {
                    "plateTextOriginal": plate_text_original,
                    "plateTextNormalized": plate_text_normalized,
                    "yoloConfidence": round(float(confidence), 4),
                    "ocrConfidence": round(float(ocr_confidence), 4),
                    "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                }
            )

            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 255, 0), 3)
            cv2.putText(
                annotated_img,
                "License Plate",
                (x1, max(y1 - 10, 30)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2,
            )

    return detected_plates, annotated_img


def save_annotated_image(image):
    cv2 = _runtime["cv2"]
    filename = f"{uuid.uuid4().hex}.jpg"
    output_path = OUTPUT_DIR / filename
    cv2.imwrite(str(output_path), image)
    return f"{AI_PUBLIC_BASE_URL.rstrip('/')}/outputs/{filename}"


def process_vehicle_image(image_path: str):
    cv2 = _runtime["cv2"]

    image = cv2.imread(image_path)
    if image is None:
        raise HTTPException(status_code=400, detail="Uploaded image could not be loaded.")

    smoke_detections, smoke_annotated_img = detect_smoke(image_path, image)
    smoke_detected = len(smoke_detections) > 0

    if smoke_detected:
        license_plates, final_annotated_img = detect_license_plate(smoke_annotated_img, image)
        plate_status = "License plate detection was performed because smoke was detected."
    else:
        license_plates = []
        final_annotated_img = smoke_annotated_img
        plate_status = "License plate detection skipped because no smoke was detected."

    max_smoke_confidence = max(
        [detection["confidence"] for detection in smoke_detections],
        default=0.0,
    )

    return {
        "vehicleType": "unknown",
        "smokeDetected": smoke_detected,
        "smokeLevel": smoke_level_from_confidence(max_smoke_confidence) if smoke_detected else "none",
        "confidenceScore": round(float(max_smoke_confidence), 4),
        "processedImageUrl": save_annotated_image(final_annotated_img),
        "detections": smoke_detections,
        "licensePlateDetection": {
            "status": plate_status,
            "totalPlates": len(license_plates),
            "plates": license_plates,
        },
    }


@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    load_runtime()

    suffix = Path(image.filename or "upload.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(await image.read())
        temp_path = temp_file.name

    try:
        return process_vehicle_image(temp_path)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI detection failed: {exc}") from exc
    finally:
        Path(temp_path).unlink(missing_ok=True)


@app.post("/detect/debug")
async def detect_debug(image: UploadFile = File(...)):
    result = await detect(image)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result
