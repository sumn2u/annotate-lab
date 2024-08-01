import torch
import os
import requests
from segment_anything import SamPredictor, sam_model_registry, SamAutomaticMaskGenerator
import numpy as np
import supervision as sv
import cv2

class SamModel:
    def __init__(self, model_url, model_path, model_type):
        self.model_path = model_path
        if not os.path.exists(self.model_path):
            print(f"Downloading model from {model_url}")
            self.download_model(model_url, self.model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = sam_model_registry[model_type](checkpoint=self.model_path)
        self.model.to(self.device)
        self.model.eval()

    def download_model(self, url, path):
        response = requests.get(url)
        response.raise_for_status()  # Ensure we notice bad responses
        with open(path, 'wb') as f:
            f.write(response.content)
        print(f"Model downloaded to {path}")

    def load_model(self, model_path):
        model = SamPredictor()
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        return model

    def get_annotations(self, masks):
        detections = sv.Detections(
            xyxy=sv.mask_to_xyxy(masks=masks),
            mask=masks
        )

        detections = detections[detections.area == np.max(detections.area)]
        return detections
    
    def predict(self, image):
        mask_generator = SamAutomaticMaskGenerator(
                            self.model, 
                            points_per_side=24,
                            pred_iou_thresh=0.9,
                            stability_score_thresh=0.95,
                            crop_n_layers=1,
                            crop_n_points_downscale_factor=2,
                            min_mask_region_area=200)
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        sam_result = mask_generator.generate(image_rgb)
        detections = sv.Detections.from_sam(sam_result=sam_result)
        return detections
     
