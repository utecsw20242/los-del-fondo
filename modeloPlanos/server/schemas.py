#!/usr/bin/env python3

from pydantic import BaseModel


class FileBase(BaseModel):
    # We are assuming the image is in base 64
    coded_file: str


class FileData(BaseModel):
    windows: int
    doors: int
    texts: int
    annotated_file: str
