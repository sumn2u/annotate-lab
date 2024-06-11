import unittest
# import os
import json
from io import BytesIO
from app import app

class FlaskTestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_main_page(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome to Annotate Lab', response.data)

    def test_upload_file_no_file(self):
        response = self.app.post('/upload', data={})
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'No file part in the request', response.data)

    def test_upload_file_invalid_file_type(self):
        data = {
            'file': (BytesIO(b'some file data'), 'test.txt')
        }
        response = self.app.post('/upload', content_type='multipart/form-data', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'File type not allowed', response.data)

    def test_upload_file_success(self):
        data = {
            'file': (BytesIO(b'some file data'), 'test.png')
        }
        response = self.app.post('/upload', content_type='multipart/form-data', data=data)
        self.assertEqual(response.status_code, 201)
        self.assertIn(b'Files uploaded successfully', response.data)

    def test_images_name(self):
        data = {"image_name": "example.png"}
        response = self.app.post('/imagesName', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'configuration', response.data)

    
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
        response = self.app.post('/save', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 500)
        self.assertIn(b'Failed to save annotation data', response.data)

    def test_clear_session_success(self):
        response = self.app.post('/clearSession')
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Database cleared successfully.')

    def test_images_name_no_image_name(self):
        response = self.app.post('/imagesName', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 500)
        self.assertIn(b"'image_name' not found", response.data)

    def test_download_configuration_no_image_name(self):
        response = self.app.post('/download_configuration', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 500)
        self.assertIn(b"'image_name' not found", response.data)

    def test_download_image_with_annotations_no_image_name(self):
        response = self.app.post('/download_image_with_annotations', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"'image_name' not found", response.data)

    def test_download_image_mask_no_image_name(self):
        response = self.app.post('/download_image_mask', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"'image_name' not found", response.data)

    # def test_get_images_info_no_path(self):
    #     app.config['UPLOAD_FOLDER'] = '/nonexistent_path'
    #     response = self.app.get('/imagesInfo')
    #     self.assertEqual(response.status_code, 404)
    #     self.assertIn(b'Path does not exist', response.data)

    def tearDown(self):
        # Clean up code if necessary
        pass

if __name__ == '__main__':
    unittest.main()
