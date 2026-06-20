# Mapping from Nepali digits to English digits
NEPALI_TO_ENGLISH_DIGITS = {
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

def normalize_nepali_digits(text: str) -> str:
    """
    Converts all Nepali digits in the input text to English digits.
    """
    if not text:
        return ""
    
    normalized = []
    for char in text:
        normalized.append(NEPALI_TO_ENGLISH_DIGITS.get(char, char))
    
    return "".join(normalized).strip()
