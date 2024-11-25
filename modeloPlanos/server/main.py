import schemas
from function import apply_model, score

from fastapi import FastAPI

app = FastAPI()


@app.post("/file/analyze", response_model=schemas.FileData)
def analyze_file(files: schemas.FileBase):
    try:
        body = {}
        coded_image = files.coded_file
        matches, annotated_file = apply_model(coded_image)
        body["matches"] = matches
        body["annotated_file"] = annotated_file
        return body
    except Exception as e:
        return {"message": "failure", "error": str(e)}


@app.post("/file/score", response_model=schemas.FileData)
def score_file(files: schemas.FileBase):
    try:
        coded_image = files.coded_file
        possible_percent = score(coded_image)
        body = {"possible_percent": round(possible_percent, 2)}
        return body
    except Exception as e:
        return {"message": "failure", "error": str(e)}
