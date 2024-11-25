# schemas.py

from pydantic import BaseModel

class FileBase(BaseModel):
    # Se asume que la imagen está en base 64
    coded_file: str

class FileData(BaseModel):
    # matches será un diccionario con las claves windows, doors y texts
    matches: dict = {
        "windows": 0,
        "doors": 0,
        "texts": 0
    }
    annotated_file: str
