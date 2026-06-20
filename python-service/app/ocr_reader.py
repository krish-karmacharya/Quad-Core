import re
import cv2
import easyocr
import torch

# Determine if GPU is available
use_gpu = torch.cuda.is_available()

# Initialize reader with Nepali and English support, with fallback
try:
    reader = easyocr.Reader(['ne', 'en'], gpu=use_gpu)
    print("✅ EasyOCR Nepali + English loaded.")
except Exception as e:
    print(f"⚠️ Nepali OCR failed to load ({e}). Using English OCR only.")
    reader = easyocr.Reader(['en'], gpu=use_gpu)

def clean_plate_text(text: str) -> str:
    """
    Cleans OCR text, keeping only uppercase English letters, numbers, and Nepali characters.
    """
    text = text.upper()
    # Match alphanumeric english characters and Nepali unicode block (U+0900 to U+097F)
    text = re.sub(r'[^A-Z0-9\u0900-\u097F ]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def convert_nepali_digits_to_english(text: str) -> str:
    """
    Translates Nepali unicode digits to standard English digits.
    """
    nepali_to_english_digits = {
        '०': '0',
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9'
    }
    for nepali_digit, english_digit in nepali_to_english_digits.items():
        text = text.replace(nepali_digit, english_digit)
    return text

def preprocess_plate_for_ocr(plate_crop):
    """
    Applies image resizing, bilateral filtering, and CLAHE contrast enhancement 
    to make the cropped license plate text easier for OCR to read.
    """
    if plate_crop is None or plate_crop.size == 0:
        return None

    # Upscale image by 3x using bicubic interpolation
    resized = cv2.resize(
        plate_crop,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    # Convert to grayscale
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    
    # Bilateral filter to reduce noise while preserving edges
    gray = cv2.bilateralFilter(gray, 11, 17, 17)

    # CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    enhanced = clahe.apply(gray)

    return enhanced

def read_plate_text(plate_crop):
    """
    Preprocesses the plate crop, performs OCR, and returns the original text, 
    digit-normalized text, and average confidence.
    """
    processed_plate = preprocess_plate_for_ocr(plate_crop)

    if processed_plate is None:
        return "", "", 0.0

    # Run OCR text detection
    ocr_results = reader.readtext(
        processed_plate,
        detail=1,
        paragraph=False
    )

    texts = []
    scores = []

    for result in ocr_results:
        detected_text = result[1]
        confidence = result[2]

        cleaned_text = clean_plate_text(detected_text)

        if cleaned_text:
            texts.append(cleaned_text)
            scores.append(confidence)

    original_text = " ".join(texts)
    original_text = clean_plate_text(original_text)

    # Convert Nepali digits (०-९) to English digits (0-9)
    normalized_text = convert_nepali_digits_to_english(original_text)

    avg_confidence = sum(scores) / len(scores) if scores else 0.0

    return original_text, normalized_text, avg_confidence
