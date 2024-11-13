from ultralytics import YOLO
import base64
import cv2
import numpy as np
import json
import sys

model = YOLO("models/blueprint.pt")

def apply_model(coded_image):
    try:
        img_data = base64.b64decode(coded_image)
        nparr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Image decoding failed. Please check the input base64 image.")

        image_resized = cv2.resize(image, (640, 640))
        result = model.predict(image_resized, conf=0.5, show_labels=False, save=False, verbose=False)
        matches = {"windows": 0, "doors": 0, "texts": 0}
        classes = result[0].boxes.cls.numpy()
        names = result[0].names
        
        for i in classes:
            label = names[int(i)]
            if label == "window":
                matches["windows"] += 1
            elif label == "door":
                matches["doors"] += 1
            elif label == "text":
                matches["texts"] += 1
                   
        colors = {"window": (255, 0, 0), "text": (40, 40, 213), "door": (0, 153, 0)}
        for i, box in enumerate(result[0].boxes.xyxy):
            x1, y1, x2, y2 = map(int, box)
            class_id = int(result[0].boxes.cls[i])
            label = names[class_id]
            cv2.rectangle(
                image,
                (x1, y1),
                (x2, y2),
                colors.get(label, (0, 255, 0)),
                4,
            )
        _, buffer = cv2.imencode(".png", image)
        annotated_image_coded = base64.b64encode(buffer).decode("utf-8")
        return json.dumps({"matches": matches, "annotated_image_coded": annotated_image_coded})
    
    except Exception as e:
        error_message = {"error": str(e)}
        return json.dumps(error_message)

if __name__ == "__main__":
    base64_image = sys.argv[1]
    result = apply_model(base64_image)
    sys.stdout.write(result)