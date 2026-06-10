import cv2
import numpy as np

class YOLOHandler:
    """
    YOLO ONNX model handler (supports YOLOv5, YOLOv8, etc.)
    Expects output shape: (1, 84, N) where N = number of predictions.
    """
    def __init__(self, input_size=(640, 640), conf_threshold=0.5, iou_threshold=0.45):
        self.input_size = input_size
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold

    # ---------- Helper methods ----------
    def _letterbox(self, img, color=(114, 114, 114)):
        """Resize and pad image to exact self.input_size dimensions."""
        shape = img.shape[:2]  # current (height, width)
        target_h, target_w = self.input_size

        # Compute scale ratio and new unpad dimensions
        r = min(target_h / shape[0], target_w / shape[1])
        new_unpad_h = int(round(shape[0] * r))
        new_unpad_w = int(round(shape[1] * r))

        # Resize to new unpad dimensions
        if (new_unpad_w, new_unpad_h) != (shape[1], shape[0]):
            img = cv2.resize(img, (new_unpad_w, new_unpad_h), interpolation=cv2.INTER_LINEAR)

        # Compute padding
        dw = target_w - new_unpad_w
        dh = target_h - new_unpad_h
        left = dw // 2
        right = dw - left
        top = dh // 2
        bottom = dh - top

        # Add borders
        img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)

        # Final safety check: if dimensions still not exact, force resize
        if img.shape[0] != target_h or img.shape[1] != target_w:
            img = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_LINEAR)

        return img, (r, r), (dw, dh)

    def _scale_coords(self, img1_shape, coords, img0_shape):
        """Rescale coordinates (xyxy) from img1_shape to img0_shape."""
        gain = min(img1_shape[0] / img0_shape[0], img1_shape[1] / img0_shape[1])
        pad = (img1_shape[1] - img0_shape[1] * gain) / 2, (img1_shape[0] - img0_shape[0] * gain) / 2
        coords[:, [0, 2]] -= pad[0]
        coords[:, [1, 3]] -= pad[1]
        coords[:, :4] /= gain
        coords[:, [0, 2]] = coords[:, [0, 2]].clip(0, img0_shape[1])
        coords[:, [1, 3]] = coords[:, [1, 3]].clip(0, img0_shape[0])
        return coords

    def _nms(self, boxes, scores):
        """Non‑maximum suppression using OpenCV."""
        indices = cv2.dnn.NMSBoxes(boxes.tolist(), scores.tolist(), self.conf_threshold, self.iou_threshold)
        if len(indices) == 0:
            return []
        if isinstance(indices, tuple):
            indices = indices[0]
        return indices.flatten() if hasattr(indices, 'flatten') else indices

    # ---------- Public methods ----------
    def preprocess(self, image_bgr):
        img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        img, _, _ = self._letterbox(img_rgb, self.input_size)
        # img should already be target_h x target_w
        img = img.astype(np.float32) / 255.0
        img = np.transpose(img, (2, 0, 1))   # HWC -> CHW
        img = np.expand_dims(img, axis=0)    # add batch dim
        # Assert shape is correct (optional)
        assert img.shape == (1, 3, self.input_size[0], self.input_size[1]), \
            f"Expected shape (1,3,{self.input_size[0]},{self.input_size[1]}), got {img.shape}"
        return img

    def postprocess(self, raw_output, original_shape, class_names):
        """
        Convert raw ONNX output to list of detections.
        raw_output: either a list of outputs or a single numpy array.
        original_shape: (height, width) of the original image.
        class_names: list of strings (index = class id).
        Returns list of dicts: [{"bbox": [x1,y1,x2,y2], "class": str, "confidence": float}]
        """
        output = raw_output[0] if isinstance(raw_output, list) else raw_output
        predictions = np.squeeze(output).T          # (N, 84) for YOLOv8
        # For YOLO, first 4 are bbox (cx,cy,w,h), rest are class scores
        scores = np.max(predictions[:, 4:], axis=1) # max class score
        # Filter by confidence
        mask = scores > self.conf_threshold
        if not mask.any():
            return []
        predictions = predictions[mask]
        scores = scores[mask]
        # Extract boxes in xywh (normalized)
        xywh = predictions[:, :4]
        # Convert to xyxy
        x1 = xywh[:, 0] - xywh[:, 2] / 2
        y1 = xywh[:, 1] - xywh[:, 3] / 2
        x2 = xywh[:, 0] + xywh[:, 2] / 2
        y2 = xywh[:, 1] + xywh[:, 3] / 2
        boxes = np.stack([x1, y1, x2, y2], axis=1)
        # Class ids
        class_ids = np.argmax(predictions[:, 4:], axis=1)
        # Apply NMS
        keep = self._nms(boxes, scores)
        if len(keep) == 0:
            return []
        boxes = boxes[keep]
        scores = scores[keep]
        class_ids = class_ids[keep]
        # Scale boxes to original image size
        h, w = original_shape
        img1_shape = self.input_size
        boxes = self._scale_coords(img1_shape, boxes, (h, w))
        # Build result list
        results = []
        for box, score, cls_id in zip(boxes, scores, class_ids):
            x1, y1, x2, y2 = box.astype(int)
            class_name = class_names[cls_id] if cls_id < len(class_names) else f"class_{cls_id}"
            results.append({
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "class": class_name,
                "confidence": float(score)
            })
        return results