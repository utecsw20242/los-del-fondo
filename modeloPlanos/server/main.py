from typing import Union
import schemas
from yoloseg import apply_model

from fastapi import FastAPI

app = FastAPI()


@app.get("/file", response_model=schemas.FileData)
def analyze_file(files: schemas.FileCreate):
    coded_image = files["coded_image"]
    matches, anotated_file = apply_model(coded_image)
    body = matches
    body["anotated_file"] = annotated_file
    return body
