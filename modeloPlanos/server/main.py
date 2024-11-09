import schemas
from function import apply_model

from fastapi import FastAPI

app = FastAPI()


@app.post("/file", response_model=schemas.FileData)
def analyze_file(files: schemas.FileBase):
    try:
        coded_image = files.coded_file
        matches, annotated_file = apply_model(coded_image)
        body = matches
        body["annotated_file"] = annotated_file
        return body
    except Exception as e:
        return {"message": "failure", "error": str(e)}
