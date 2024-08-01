import requests
import cv2
import numpy as np
import uuid

def load_image_from_url(url):
    response = requests.get(url)
    image = np.asarray(bytearray(response.content), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image

def format_regions_for_frontend(detections, image_src, image_width, image_height):
   # Assuming mask contains 'segmentation' key with binary mask data
    formatted_regions = []
    for i in range(len(detections.xyxy)):
        x1, y1, x2, y2 = detections.xyxy[i]
        region = {
            "cls": "",
            "comment": "",
            "color": "#f44336",
            "h": (y2 - y1) / image_height,
            "id": uuid.uuid4(),  # Generate unique ID
            "image-src": image_src,
            "tags": "",
            "type": "box",
            "w": (x2 - x1) / image_width,
            "x": x1 / image_width,
            "y": y1 / image_height
        }
        formatted_regions.append(region)
    return formatted_regions