#!/usr/bin/env python3

import base64
import requests
from function import apply_model, score
from PIL import Image
from io import BytesIO


def recognize(path):
    image_string = ""
    with open(path, "rb") as image:
        image_string = base64.b64encode(image.read()).decode("utf-8")
    # body = {"image_coded": image_string}
    matches, annotated_image_coded = apply_model(image_string)
    body = matches
    body["anotated_file"] = annotated_image_coded
    return body


url = "http://127.0.0.1:8000/file"


def recognize_api(path):
    image_string = ""
    with open(path, "rb") as image:
        image_string = base64.b64encode(image.read()).decode("utf-8")
    # body = {"image_coded": image_string}
    body = {"coded_file": image_string}
    response = requests.get(url, json=body)
    return response


path = "../basic_extra.png"
with open(path, "rb") as image:
    image_string = base64.b64encode(image.read()).decode("utf-8")

score(image_string)

# path = "../basic_extra.png"
# response = recognize_api(path)
# print(response)
# body = recognize(path)
# decoded_image = base64.b64decode(body["anotated_file"])
# image = Image.open(BytesIO(decoded_image))
# image.show()
