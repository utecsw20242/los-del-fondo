#!/usr/bin/env python3

import requests
import base64

url = ""


def recognize(path):
    image_string = ""
    with open(path, "rb") as image:
        image_string = base64.b64encode(image.read()).decode("utf-8")
    body = {"image": image_string}
    r = requests.post(url, json=body)
    return r
