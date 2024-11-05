#!/usr/bin/env python3

import pytesseract
from PIL import Image

# Asegúrate de que 'tesseract' esté disponible en el PATH o especifica la ruta
# pytesseract.pytesseract.tesseract_cmd = r"~/usr/bin/tesseract"

# Cargar la imagen
image_path = "A_002_vertical.png"
image = Image.open(image_path)

# Realizar el OCR
text = pytesseract.image_to_string(image, lang="spa")

# Mostrar el texto extraído
print(text)
