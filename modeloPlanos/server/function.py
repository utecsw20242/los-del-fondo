#!/usr/bin/env python3

from ultralytics import YOLO
import base64
from scipy.spatial import cKDTree
import cv2
import numpy as np
from PIL import Image
import pytesseract
from io import BytesIO
from collections import namedtuple

Box = namedtuple("Box", ["x1", "y1", "x2", "y2"])

model = YOLO("blueprint.pt")


def apply_model(coded_image):
    decoded_image = base64.b64decode(coded_image)
    image = Image.open(BytesIO(decoded_image))
    image = image.convert("RGB")
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


def calculate_center(box: Box):
    """
    Calculate the center of a rectangle.
    """
    x_center = (box.x1 + box.x2) / 2
    y_center = (box.y1 + box.y2) / 2
    return (x_center, y_center)


def is_angle_valid(angle):
    """
    Returns true if the angle is valid. To be valid it needs to be close to 90,
    180, 270 or 360 angle
    """
    valid_ranges = [(-10, 10), (80, 100), (170, 190), (260, 280)]
    for start, end in valid_ranges:
        if start <= angle <= end:
            return True
    return False


def calculate_angle(point1, point2):
    delta_y = point2[1] - point1[1]
    delta_x = point2[0] - point1[0]
    # angle = math.degrees(math.atan2(delta_y, delta_x))
    angle = np.degrees(np.arctan2(delta_y, delta_x))
    return angle % 360


def find_closest_objects(texts, numbers):
    centers1 = np.array([calculate_center(obj) for obj in texts])
    centers2 = np.array([calculate_center(obj) for obj in numbers])

    # Find the closest 2 objects in list2 for each object in list1, with angle constraints
    closest_objects = []
    for center1 in centers1:
        distances = []
        valid_indices = []

        # Calculate distances and angles
        for i, center2 in enumerate(centers2):
            distance = np.linalg.norm(center2 - center1)
            angle = calculate_angle(center1, center2)
            if is_angle_valid(angle):
                distances.append(distance)
                valid_indices.append(i)

        # Sort valid distances and get the indices of the closest 2
        if distances:
            sorted_indices = np.argsort(distances)[:2]
            closest_objects.append([valid_indices[idx] for idx in sorted_indices])
        else:
            closest_objects.append([])  # No valid objects
    return closest_objects


def remove_end_spaces(string):
    return "".join(string.rstrip())


def is_number(string):
    """
    Returns true if the string is a number. For now, it only works with comma
    as decimal separator
    """
    try:
        parsed = string.replace(",", ".")
        float(parsed)
        return True
    except ValueError:
        return False


def score(coded_image):
    """
    The score is the percent of rooms that have corresponding measures
    """
    decoded_image = base64.b64decode(coded_image)
    image = Image.open(BytesIO(decoded_image))
    image = image.convert("RGB")

    image_numpy = np.array(image)

    result = model.predict(image_numpy, conf=0.5, show_labels=False)
    classes = result[0].boxes.cls.numpy()
    names = result[0].names

    texts = []
    texts_translated = []
    numbers = []
    numbers_translated = []
    for i in range(len(classes)):
        if names[int(classes[i])] == "text":
            x1, y1, x2, y2 = map(int, result[0].boxes.xyxy[i])

            # 1. First we cut the text
            croped_image = image.crop((x1, y1, x2, y2))

            try:
                # 2. Later, we rotate to image so that the text extraction works
                config = "--psm 0 -c min_characters_to_try=1"
                osd_data = pytesseract.image_to_osd(
                    croped_image, output_type=pytesseract.Output.DICT, config=config
                )
                rotation_angle = osd_data["rotate"]

                if rotation_angle != 0 and rotation_angle != 180:
                    croped_image = croped_image.rotate(rotation_angle, expand=True)

                config = r"--oem 0 --psm 7 -c min_characters_to_try=1"
                # More languages takes longer
                line = remove_end_spaces(
                    pytesseract.image_to_string(croped_image, lang="eng", config=config)
                )

                if is_number(line):
                    numbers.append(Box(x1, y1, x2, y2))
                    numbers_translated.append(line)
                else:
                    texts.append(Box(x1, y1, x2, y2))
                    texts_translated.append(line)
            except pytesseract.pytesseract.TesseractError as e:
                print("Error: ", e)

    closest_objects = find_closest_objects(texts, numbers)

    possible = 0
    for i in closest_objects:
        if len(i) == 2:
            possible += 1

    possible_percent = (
        possible / len(closest_objects) if len(closest_objects) > 0 else 0
    )

    return possible_percent
