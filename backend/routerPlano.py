#!/usr/bin/env python3

from fastapi import APIRouter, HTTPException
from yoloseg import apply_model
import uuid
import schemas

router = APIRouter()


@router.post("/planos/", response_model=schemas.PlanoInDB)
def create_planos(planos: schemas.PlanoCreate):
    coded_image = planos["coded_image"]
    matches = apply_model(coded_image)
    body = {"matches": matches, "id": uuid.uuid1()}
    # Call to api gateway to change database or change it here with boto3 and credentials
    # TODO

    return body


@router.get("/planos/{planos_id}", response_model=schemas.PlanosInDB)
def read_planos(planos_id: str):
    # Call to api gateway to change database or change it here with boto3 and credentials
    # TODO
    body = {}
    return body


@router.put("/planos/{planos_id}", response_model=schemas.PlanosInDB)
def update_planos(planos_id: str, planos: schemas.PlanosUpdate):
    # Check if blueprints exists in database
    # TODO
    # if db_planos is None:
    #     raise HTTPException(status_code=404, detail="Planos not found")
    coded_image = planos["coded_image"]
    matches = apply_model(coded_image)
    body = {"matches": matches, "id": uuid.uuid1()}
    # Call to api gateway to change database or change it here with boto3 and credentials
    # TODO

    return body


@router.delete("/planos/{planos_id}", response_model=schemas.PlanosInDB)
def delete_planos(planos_id: str):
    # Call to api gateway to change database or change it here with boto3 and credentials
    # TODO
    # if db_planos is None:
    #     raise HTTPException(status_code=404, detail="Planos not found")
    body = {}
    return body
