#!/usr/bin/env python3

from fastapi import FastAPI, Request
import requests
from fastapi.responses import JSONResponse


path = "https://pokeapi.co/api/v2/pokemon/"

app = FastAPI()


@app.get("/pokemon")
def get_pokemon(name: str):
    response = requests.get(path + name)
    if response.status_code == 404:
        success = False
        returned_code = 400
        message = "Pokemon doesn't exist"
        return {
            "success": success,
            "message": message,
        }, returned_code
    else:
        success = True
        returned_code = 200
        pokemon = response.json()
    return JSONResponse(
        status_code=returned_code,
        content={
            "success": success,
            "pokemon": pokemon,
        },
    )


@app.route("/{full_path:path}")
def catch_all(full_path: str, request: Request = ""):
    return JSONResponse(
        status_code=500,
        content={"success": False, "detail": "Endpoint is not implemented."},
    )
