from pydantic import BaseModel

from typing import Dict

class FileBase(BaseModel):
    # Asumiendo que el archivo es una imagen en base64
    coded_file: str

class FileData(BaseModel):
    # Cambiar la estructura para que 'matches' sea un diccionario
    matches: Dict[str, int]
    annotated_file: str
