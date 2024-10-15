#!/usr/bin/env python3

from ultralytics import YOLO

# Load a YOLOv8n PyTorch model
model = YOLO("blueprint.pt")

# Run inference
path = "example_handwriting.png"
results = model.predict(path, save=True, save_txt=True)

print(results[0].probs)
