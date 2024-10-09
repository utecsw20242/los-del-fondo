#!/usr/bin/env python3

from ultralytics import YOLO

# Load a YOLOv8n PyTorch model
model = YOLO("yolov8n.pt")

# Run inference
path = "test_image.png"
results = model.predict(path, save=True, save_txt=True)

print(results[0].probs)
