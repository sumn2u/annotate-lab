import unittest
from unittest.mock import patch

# import os
import json
from io import BytesIO
from app import app, default_settings


class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_main_page(self):
        response = self.app.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Welcome to Annotate Lab", response.data)

    def test_upload_file_no_file(self):
        response = self.app.post("/upload", data={})
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"No file part in the request", response.data)

    def test_upload_file_invalid_file_type(self):
        data = {"file": (BytesIO(b"some file data"), "test.txt")}
        response = self.app.post(
            "/upload", content_type="multipart/form-data", data=data
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"File type not allowed", response.data)

    def test_get_initial_settings(self):
        response = self.app.get("/settings")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["taskDescription"], "")
        self.assertEqual(data["taskChoice"], "object_detection")

    def test_update_settings(self):
        updated_settings = {
            "taskDescription": "Updated task description",
            "showLab": True,
        }
        response = self.app.post("/settings", json=updated_settings)
        self.assertEqual(response.status_code, 200)
        response = self.app.get("/settings")
        data = json.loads(response.data)
        self.assertEqual(data["taskDescription"], "Updated task description")
        self.assertTrue(data["showLab"])

    def test_reset_settings(self):
        # Update settings first to ensure they are not default
        updated_settings = {"taskDescription": "", "showLab": False}
        response = self.app.post("/settings", json=updated_settings)
        self.assertEqual(response.status_code, 200)

        # Reset settings to default
        response = self.app.post("/settings/reset")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Settings reset to default values", response.data)

        # Verify settings are reset to default
        response = self.app.get("/settings")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        for key, value in default_settings.items():
            self.assertEqual(data[key], value)

    def test_upload_file_success(self):
        data = {"file": (BytesIO(b"some file data"), "test.png")}
        response = self.app.post(
            "/upload", content_type="multipart/form-data", data=data
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn(b"Files uploaded successfully", response.data)

    def test_images_name(self):
        data = {"image_name": "example.png"}
        response = self.app.post(
            "/imagesName", data=json.dumps(data), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"configuration", response.data)

    def test_uploaded_file_not_found(self):
        with patch("os.path.exists") as mock_exists:
            mock_exists.return_value = False
            response = self.app.get("/uploads/example.png")
            self.assertEqual(response.status_code, 404)
            data = response.get_json()
            self.assertEqual(data["status"], "error")
            self.assertEqual(data["message"], "File not found")

    # def test_save_annotate_info_success(self):
    #     annotate_data = {
    #         "src": "http://localhost:5000/uploads/orange.png",
    #         "name": "orange",
    #         "cls": ["One"],
    #         "comment": "",
    #         "pixelSize": {"h": 249, "w": 320},
    #         "regions": [{
    #             "cls": "One",
    #             "comment": "orange",
    #             "id": "23318017142157643",
    #             "type": "circle",
    #             "coords": {
    #                 "rh": 0.5223840871586494,
    #                 "rw": 0.4771723122238586,
    #                 "rx": 0.28424153166421207,
    #                 "ry": 0.17980611695678148
    #             }
    #         }]
    #     }
    #     response = self.app.post('/save', data=json.dumps(annotate_data), content_type='application/json')
    #     self.assertEqual(response.status_code, 200)
    #     self.assertIn(b'Annotation data saved successfully', response.data)

    def test_save_annotate_info_failure(self):
        response = self.app.post(
            "/save", data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 500)
        self.assertIn(b"Failed to save annotation data", response.data)

    def test_clear_session_success(self):
        response = self.app.post("/clearSession")
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["message"], "Database cleared successfully.")

    def test_images_name_no_image_name(self):
        response = self.app.post(
            "/imagesName", data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 500)
        self.assertIn(b"'image_name' not found", response.data)

    def test_download_configuration_no_image_name(self):
        response = self.app.post(
            "/download_configuration",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 500)
        self.assertIn(b"'image_names' not found", response.data)

    def test_download_image_with_annotations_no_image_name(self):
        response = self.app.post(
            "/download_image_with_annotations",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"'image_names' not found", response.data)

    def test_download_image_mask_no_image_name(self):
        response = self.app.post(
            "/download_image_mask", data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"'image_names' not found", response.data)

    def test_download_yolo_annotations_no_image_name(self):
        response = self.app.post(
            "/download_yolo_annotations",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"'image_names' not found", response.data)

    def test_download_coco_annotations_no_image_name(self):
        response = self.app.post(
            "/download_coco_annotations",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"'image_names' not found", response.data)


    def test_create_coco_annotations_with_box(self):
        """Test create_coco_annotations function with box regions"""
        # Use app.test_request_context to create a request context
        with self.app.application.test_request_context():
            from app import create_coco_annotations
            
            # Mock the class labels from settings
            with patch('app.get_class_labels_from_settings') as mock_get_labels, \
                patch('app.os.walk') as mock_os_walk, \
                patch('app.Image.open') as mock_image_open, \
                patch('app.dbModule.findInfoInBoxDb') as mock_find_box, \
                patch('app.dbModule.findInfoInPolygonDb') as mock_find_polygon, \
                patch('app.dbModule.findInfoInCircleDb') as mock_find_circle:
                
                mock_get_labels.return_value = {"1": "ripe", "2": "unripe"}
                
                # Mock os.walk to find the image
                mock_os_walk.return_value = [
                    ('/fake/path', [], ['test_image.jpg'])
                ]
                
                # Mock Image.open
                mock_img = unittest.mock.MagicMock()
                mock_img.size = (640, 480)
                mock_image_open.return_value.__enter__.return_value = mock_img
                
                # Mock database response for box regions
                import pandas as pd
                mock_box_data = pd.DataFrame([{
                    'class': '1',
                    'x': 0.15625,  # 100/640
                    'y': 0.3125,   # 150/480
                    'w': 0.3125,   # 200/640
                    'h': 0.625,    # 300/480
                    'region-id': 'box_123'
                }])
                mock_find_box.return_value = mock_box_data
                
                # Mock other database responses as empty
                mock_find_polygon.return_value = pd.DataFrame()
                mock_find_circle.return_value = pd.DataFrame()
                
                # Call the function
                result = create_coco_annotations(["test_image.jpg"])
                
                # Assertions
                self.assertEqual(len(result["images"]), 1)
                self.assertEqual(result["images"][0]["file_name"], "test_image.jpg")
                self.assertEqual(result["images"][0]["width"], 640)
                self.assertEqual(result["images"][0]["height"], 480)
                
                self.assertEqual(len(result["annotations"]), 1)
                annotation = result["annotations"][0]
                self.assertEqual(annotation["image_id"], 1)
                self.assertEqual(annotation["category_id"], 1)
                self.assertEqual(annotation["bbox"], [100.0, 150.0, 200.0, 300.0])
                self.assertEqual(annotation["area"], 60000.0)
                
                self.assertEqual(len(result["categories"]), 1)
                self.assertEqual(result["categories"][0]["name"], "ripe")

    def test_create_coco_annotations_with_polygon(self):
        """Test create_coco_annotations function with polygon regions"""
        # Use app.test_request_context to create a request context
        with self.app.application.test_request_context():
            from app import create_coco_annotations
            
            # Mock the class labels from settings
            with patch('app.get_class_labels_from_settings') as mock_get_labels, \
                patch('app.os.walk') as mock_os_walk, \
                patch('app.Image.open') as mock_image_open, \
                patch('app.dbModule.findInfoInPolygonDb') as mock_find_polygon, \
                patch('app.dbModule.findInfoInBoxDb') as mock_find_box, \
                patch('app.dbModule.findInfoInCircleDb') as mock_find_circle:
                
                mock_get_labels.return_value = {"1": "ripe"}
                
                # Mock os.walk to find the image
                mock_os_walk.return_value = [
                    ('/fake/path', [], ['test_image.jpg'])
                ]
                
                # Mock Image.open
                mock_img = unittest.mock.MagicMock()
                mock_img.size = (640, 480)
                mock_image_open.return_value.__enter__.return_value = mock_img
                
                # Mock database response for polygon regions
                import pandas as pd
                # Format: "x1-y1;x2-y2;x3-y3;x4-y4" (normalized coordinates)
                mock_polygon_data = pd.DataFrame([{
                    'class': '1',
                    'points': '0.1-0.2;0.3-0.2;0.3-0.4;0.1-0.4',
                    'region-id': 'poly_123'
                }])
                mock_find_polygon.return_value = mock_polygon_data
                
                # Mock other database responses as empty
                mock_find_box.return_value = pd.DataFrame()
                mock_find_circle.return_value = pd.DataFrame()
                
                # Call the function
                result = create_coco_annotations(["test_image.jpg"])
                
                # Assertions
                self.assertEqual(len(result["annotations"]), 1)
                annotation = result["annotations"][0]
                
                # Check segmentation
                self.assertTrue(len(annotation["segmentation"]) > 0)
                self.assertTrue(len(annotation["segmentation"][0]) > 0)
                
                # Check bbox (should be computed from polygon)
                bbox = annotation["bbox"]
                self.assertEqual(len(bbox), 4)
                self.assertTrue(bbox[0] >= 0)  # x should be positive
                self.assertTrue(bbox[1] >= 0)  # y should be positive
                self.assertTrue(bbox[2] > 0)   # width should be positive
                self.assertTrue(bbox[3] > 0)   # height should be positive

    def test_create_coco_annotations_with_circle(self):
        """Test create_coco_annotations function with circle/ellipse regions"""
        # Use app.test_request_context to create a request context
        with self.app.application.test_request_context():
            from app import create_coco_annotations
            
            # Mock the class labels from settings
            with patch('app.get_class_labels_from_settings') as mock_get_labels, \
                patch('app.os.walk') as mock_os_walk, \
                patch('app.Image.open') as mock_image_open, \
                patch('app.dbModule.findInfoInCircleDb') as mock_find_circle, \
                patch('app.dbModule.findInfoInBoxDb') as mock_find_box, \
                patch('app.dbModule.findInfoInPolygonDb') as mock_find_polygon:
                
                mock_get_labels.return_value = {"2": "unripe"}
                
                # Mock os.walk to find the image
                mock_os_walk.return_value = [
                    ('/fake/path', [], ['test_image.jpg'])
                ]
                
                # Mock Image.open
                mock_img = unittest.mock.MagicMock()
                mock_img.size = (640, 480)
                mock_image_open.return_value.__enter__.return_value = mock_img
                
                # Mock database response for circle regions
                import pandas as pd
                mock_circle_data = pd.DataFrame([{
                    'class': '2',
                    'rx': 0.25,  # 160/640
                    'ry': 0.25,  # 120/480
                    'rw': 0.1,   # 64/640
                    'rh': 0.1,   # 48/480
                    'region-id': 'circle_123'
                }])
                mock_find_circle.return_value = mock_circle_data
                
                # Mock other database responses as empty
                mock_find_box.return_value = pd.DataFrame()
                mock_find_polygon.return_value = pd.DataFrame()
                
                # Call the function
                result = create_coco_annotations(["test_image.jpg"])
                
                # Assertions
                self.assertEqual(len(result["annotations"]), 1)
                annotation = result["annotations"][0]
                
                # Check bbox (circle converted to bbox)
                bbox = annotation["bbox"]
                self.assertEqual(len(bbox), 4)
                self.assertEqual(annotation["category_id"], 1)  # First category should be 'unripe'
                self.assertEqual(result["categories"][0]["name"], "unripe")

    def test_create_coco_annotations_image_not_found(self):
        """Test create_coco_annotations when image is not found"""
        # Use app.test_request_context to create a request context
        with self.app.application.test_request_context():
            from app import create_coco_annotations
            
            # Mock os.walk to return no files
            with patch('app.os.walk') as mock_os_walk:
                mock_os_walk.return_value = []
                
                # Call the function and expect ValueError
                with self.assertRaises(ValueError) as context:
                    create_coco_annotations(["nonexistent_image.jpg"])
                
                self.assertIn("not found in the upload directory", str(context.exception))

    def test_create_coco_annotations_multiple_images(self):
        """Test create_coco_annotations with multiple images"""
        # Use app.test_request_context to create a request context
        with self.app.application.test_request_context():
            from app import create_coco_annotations
            
            # Mock the class labels from settings
            with patch('app.get_class_labels_from_settings') as mock_get_labels, \
                patch('app.os.walk') as mock_os_walk, \
                patch('app.Image.open') as mock_image_open, \
                patch('app.dbModule.findInfoInBoxDb') as mock_find_box, \
                patch('app.dbModule.findInfoInPolygonDb') as mock_find_polygon, \
                patch('app.dbModule.findInfoInCircleDb') as mock_find_circle:
                
                mock_get_labels.return_value = {"1": "ripe", "2": "unripe"}
                
                # Mock os.walk to find multiple images
                mock_os_walk.return_value = [
                    ('/fake/path', [], ['image1.jpg', 'image2.jpg'])
                ]
                
                # Mock Image.open for both images
                mock_img = unittest.mock.MagicMock()
                mock_img.size = (640, 480)
                mock_image_open.return_value.__enter__.return_value = mock_img
                
                # Mock database response for box regions for both images
                import pandas as pd
                mock_box_data = pd.DataFrame([
                    {'class': '1', 'x': 0.1, 'y': 0.1, 'w': 0.2, 'h': 0.2, 'region-id': 'box_1'},
                    {'class': '2', 'x': 0.5, 'y': 0.5, 'w': 0.3, 'h': 0.3, 'region-id': 'box_2'}
                ])
                mock_find_box.return_value = mock_box_data
                
                # Mock other database responses as empty
                mock_find_polygon.return_value = pd.DataFrame()
                mock_find_circle.return_value = pd.DataFrame()
                
                # Call the function with multiple images
                result = create_coco_annotations(["image1.jpg", "image2.jpg"])
                
                # Assertions
                self.assertEqual(len(result["images"]), 2)
                self.assertEqual(len(result["annotations"]), 4)  # 2 images * 2 annotations each
                self.assertEqual(len(result["categories"]), 2)
                
                # Check that categories have proper names
                category_names = [cat["name"] for cat in result["categories"]]
                self.assertIn("ripe", category_names)
                self.assertIn("unripe", category_names)

    def test_extract_numeric_value(self):
        """Test the extract_numeric_value helper function"""
        from app import extract_numeric_value
        
        # Test with various input formats
        self.assertEqual(extract_numeric_value(10.5), 10.5)
        self.assertEqual(extract_numeric_value(5), 5.0)
        self.assertEqual(extract_numeric_value("10.5"), 10.5)
        self.assertEqual(extract_numeric_value("[10.5]"), 10.5)
        self.assertEqual(extract_numeric_value("[10.5, 20.3]"), 10.5)
        self.assertEqual(extract_numeric_value("array([10.5])"), 10.5)
        self.assertEqual(extract_numeric_value([15.3]), 15.3)
        self.assertEqual(extract_numeric_value(None), 0.0)
        self.assertEqual(extract_numeric_value("invalid"), 0.0)
        # Test with comma-separated string
        self.assertEqual(extract_numeric_value("10.5, 20.3"), 10.5)

    def test_get_class_labels_from_settings(self):
        """Test the get_class_labels_from_settings function"""
        from app import get_class_labels_from_settings
        import json
        import os
        import tempfile
        
        # Create a temporary settings file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            test_settings = {
                "configuration": {
                    "labels": [
                        {"id": "1", "description": "ripe"},
                        {"id": "2", "description": "unripe"},
                        {"id": "3", "description": "damaged"}
                    ]
                }
            }
            json.dump(test_settings, f)
            temp_file_path = f.name
        
        # Mock the JSON_FILE constant
        with patch('app.JSON_FILE', temp_file_path):
            # Call the function
            result = get_class_labels_from_settings()
            
            # Assertions
            self.assertEqual(len(result), 3)
            self.assertEqual(result["1"], "ripe")
            self.assertEqual(result["2"], "unripe")
            self.assertEqual(result["3"], "damaged")
        
        # Clean up
        os.unlink(temp_file_path)
    # def test_get_images_info_no_path(self):
    #     app.config['UPLOAD_FOLDER'] = '/nonexistent_path'
    #     response = self.app.get('/imagesInfo')
    #     self.assertEqual(response.status_code, 404)
    #     self.assertIn(b'Path does not exist', response.data)

    def tearDown(self):
        # Clean up code if necessary
        pass


if __name__ == "__main__":
    unittest.main()
