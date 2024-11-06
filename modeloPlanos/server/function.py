#!/usr/bin/env python3

from ultralytics import YOLO
import base64
import cv2
import numpy as np
from PIL import Image
from io import BytesIO

model = YOLO("blueprint.pt")


def apply_model(coded_image):
    decoded_image = base64.b64decode(coded_image)
    image = Image.open(BytesIO(decoded_image))
    image_numpy = np.array(image)
    result = model.predict(image_numpy, conf=0.5, show_labels=False)
    classes = result[0].boxes.cls.numpy()
    matches = {}
    names = result[0].names
    for key, value in names.items():
        matches[value + "s"] = 0

    for i in classes:
        matches[names[int(i)] + "s"] += 1

    colors = {"window": (255, 0, 0), "text": (40, 40, 213), "door": (0, 153, 0)}
    for i, box in enumerate(result[0].boxes.xyxy):
        # Get box coordinates, class, and confidence
        x1, y1, x2, y2 = map(int, box)
        class_id = int(result[0].boxes.cls[i])
        label = names[class_id]

        # Draw the bounding box
        cv2.rectangle(
            image_numpy,
            (x1, y1),
            (x2, y2),
            colors[label],
            4,
        )

    image = Image.fromarray(image_numpy)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    annotated_image_coded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return matches, annotated_image_coded
