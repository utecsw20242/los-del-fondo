import schemas
from function import apply_model

from fastapi import FastAPI

app = FastAPI()


@app.get("/file", response_model=schemas.FileData)
def analyze_file(files: schemas.FileBase):
    coded_image = files.coded_file
    matches, annotated_file = apply_model(coded_image)
    body = matches
    body["annotated_file"] = annotated_file
    return body
