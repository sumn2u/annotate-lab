from crypt import methods
import dbm
from email import header
from urllib import response
from urllib.robotparser import RequestRate
from wsgiref import headers
from flask import Flask, jsonify, request, url_for,send_from_directory,send_file
from flask_cors import CORS, cross_origin
from db.db_handler import Module
import numpy as np
from io import BytesIO
import pandas as pd
import requests
import json
from PIL import Image, ImageDraw
import os
from dotenv import load_dotenv

app = Flask(__name__)


# Get the CLIENT_URL environment variable
client_url = os.getenv('CLIENT_URL')

# Set the folder to save uploaded files
UPLOAD_FOLDER = 'uploads'

app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, resources={r"/*": {"origins": client_url},
                     r"/uploads/*": {"origins": "*"}})
# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


dbModule = Module()
path = os.path.abspath('./uploads')

@app.route('/save', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def save_annotate_info():
    try:
        request_data = request.get_json()
        if dbModule.handleNewData(request_data): 
            # Return success response
            return jsonify({"status": "success", "message": "Annotation data saved successfully"}), 200
        else:
            # Return failure response if handleNewData fails
            return jsonify({"status": "error", "message": "Failed to save annotation data"}), 500
    except AssertionError:
        # Handle any other exceptions
        return jsonify({"status": "error", "message": "An error occurred while processing the request"}), 500


# Allowed extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_uploaded_files():
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if allowed_file(filename):
            file_url = url_for('uploaded_file', filename=filename, _external=True)
            files.append({'filename': filename, 'url': file_url})
    return files

@app.route('/upload', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file part in the request"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"status": "error", "message": "No selected file"}), 400
        
        if file and allowed_file(file.filename):
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            files = get_uploaded_files()
            return jsonify({"status": "success", "message": "File uploaded successfully", "files": files}), 201
        else:
            return jsonify({"status": "error", "message": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)



@app.route('/activeImage', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def save_active_image_info():
    try:
        request_data = request.get_json()
        # Assume handleActiveImageData returns True if successful
        if dbModule.handleActiveImageData(request_data):
            # Return success response
            return jsonify({"status": "success", "message": "Image data saved successfully"}), 200
        else:
            # Return failure response if handleActiveImageData fails
            return jsonify({"status": "error", "message": "Failed to save image data"}), 500
    except AssertionError:
        # Handle any other exceptions
        return jsonify({"status": "error", "message": "An error occurred while processing the request"}), 500


def create_json_response(image_name):
    imagesName = []
    for (root, dirs, files) in os.walk(path):
        for f in files:
            if f.lower().endswith(('.png', '.jpg', '.jpeg')) and f.lower() == image_name.lower():
                dictionary = {'image-name': f}
                imageIndex = dbModule.findInfoInDb(dbModule.imagesInfo, 'image-src', 'http://127.0.0.1:5000/uploads/' + f)
                polygonRegions = dbModule.findInfoInPolygonDb(dbModule.imagePolygonRegions, 'image-src', 'http://127.0.0.1:5000/uploads/' + f)
                if imageIndex is not None:
                    comment = str(dbModule.imagesInfo.at[imageIndex, 'comment'])
                    dictionary['comment'] = comment if comment != "nan" else ''
                    dictionary['cls'] = str(dbModule.imagesInfo.at[imageIndex, 'selected-classes'])
                    dictionary['cls'] = dictionary['cls'] if dictionary['cls'] != "nan" else ''
                    dictionary['processed'] = True
                else:
                    dictionary['processed'] = False

                if polygonRegions is not None:
                    if isinstance(polygonRegions, pd.DataFrame):
                        regions_list = polygonRegions.to_dict(orient='records')
                        for region in regions_list:
                            points = region.get('points', '')
                            decoded_points = [[float(coord) for coord in point.split('-')] for point in points.split(';')]
                            region['points'] = decoded_points
                        dictionary['regions'] = regions_list
                    else:
                        dictionary['regions'] = polygonRegions

                imagesName.append(dictionary)

    # Convert the response to JSON and then to a BytesIO object
    json_data = json.dumps({'configuration': imagesName})
    json_bytes = BytesIO(json_data.encode('utf-8'))

    # Use the image_name for the download file name
    download_filename = f'configuration_download.json'

    return json_bytes, download_filename

@app.route('/imagesName', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def images_name():
    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_name = data.get('image_name')
        if not image_name:
            raise ValueError("Invalid JSON data format: 'image_name' not found.")

        json_bytes, download_filename = create_json_response(image_name)

         # Convert BytesIO to string and return as JSON
        json_str = json_bytes.getvalue().decode('utf-8')
        return jsonify(json.loads(json_str))

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/download_configuration', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def download_configuration():

    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_name = data.get('image_name')
        if not image_name:
            raise ValueError("Invalid JSON data format: 'image_name' not found.")

        json_bytes, download_filename = create_json_response(image_name)

        return send_file(json_bytes, mimetype='application/json', as_attachment=True, download_name=download_filename)

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/download_image_with_annotations', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def download_image_with_annotations():

    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_name = data.get('image_name')
        if not image_name:
            raise ValueError("Invalid JSON data format: 'image_name' not found.")

        json_bytes, download_filename = create_json_response(image_name)
            # Convert BytesIO to string and return as JSON
        json_str = json_bytes.getvalue().decode('utf-8')
        
        images = json.loads(json_str).get("configuration", [])

        color_map = data.get("colorMap", {})
        
        # Convert color map values to tuples
        for key in color_map.keys():
            color_map[key] = tuple(color_map[key])
        
        for image_info in images:
            image_url = image_info.get("regions", [])[0].get("image-src")
            response = requests.get(image_url)
            image = Image.open(BytesIO(response.content))
            draw = ImageDraw.Draw(image)
            
            for region in image_info.get("regions", []):
                points = region.get("points", [])
                width, height = image.size
                label = region.get("class")
                color = color_map.get(label, (255, 0, 0))  # Default to red if label not in color_map
                scaled_points = [(x * width, y * height) for x, y in points]
                draw.polygon(scaled_points, outline=color)
            
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)

            return send_file(img_byte_arr, mimetype='image/png', as_attachment=True, download_name=image_info.get("image-name"))
        
    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/download_image_mask', methods=['POST'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def download_image_mask():
    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_name = data.get('image_name')
        if not image_name:
            raise ValueError("Invalid JSON data format: 'image_name' not found.")

        json_bytes, download_filename = create_json_response(image_name)
            # Convert BytesIO to string and return as JSON
        json_str = json_bytes.getvalue().decode('utf-8')
        
        images = json.loads(json_str).get("configuration", [])

        color_map = data.get("colorMap", {})

        # Convert color map values to tuples
        for key in color_map.keys():
            color_map[key] = tuple(color_map[key])

        for image_info in images:
            image_url = image_info.get("regions", [])[0].get("image-src")
            response = requests.get(image_url)
            image = Image.open(BytesIO(response.content))
            width, height = image.size
            mask = Image.new('RGB', (width, height), (0, 0, 0))  # 'RGB' mode for colored masks
            draw = ImageDraw.Draw(mask)
            
            for region in image_info.get("regions", []):
                points = region.get("points", [])
                label = region.get("class")
                color = color_map.get(label, (255, 255, 255))  # Default to white if label not in color_map
                scaled_points = [(int(x * width), int(y * height)) for x, y in points]
                draw.polygon(scaled_points, outline=color, fill=color)
            
            mask_byte_arr = BytesIO()
            mask.save(mask_byte_arr, format='PNG')
            mask_byte_arr.seek(0)

            return send_file(mask_byte_arr, mimetype='image/png', as_attachment=True, download_name=f"mask_{image_info.get('image-name')}")
    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/imagesInfo', methods=['GET'])
@cross_origin(origin=client_url, headers=['Content-Type'])
def get_images_info():
    global path

    print(f"Searching in path: {path}")  # Debugging statement

    # Check if the path exists and is a directory
    if not os.path.exists(path):
        return jsonify({'error': 'Path does not exist'}), 404

    if not os.path.isdir(path):
        return jsonify({'error': 'Path is not a directory'}), 400

    try:
        imagesName = []
        for(root, dirs, file) in os.walk(path):
            print(f"Root: {root}, Dirs: {dirs}, Files: {file}")  # Debugging statement
            for f in file:
                dictionary = {}
                if ('.png' in f) or ('.jpg' in f) or ('.jpeg' in f):
                    dictionary['image-name'] = f
                    imageIndex = dbModule.findInfoInDb(dbModule.imagesInfo, 'image-src', './images/'+f)

                    if (imageIndex is not None):
                        comment = str(dbModule.imagesInfo.at[imageIndex, 'comment'])
                        dictionary['comment'] = comment if comment != "nan" else '' 
                        dictionary['cls'] = str(dbModule.imagesInfo.at[imageIndex, 'selected-classes'])
                        
                        dictionary['cls'] = dictionary['cls'] if dictionary['cls'] != "nan" else ''
                        dictionary['processed'] = True
                    else:
                        dictionary['processed'] = False

                    imagesName.append(dictionary)

        response = jsonify({'imagesNames': imagesName})
        return response
    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def main():
    return '''
        <h1>Welcome to Annotate Lab</h1>
    '''


# If the file is run directly,start the app.
if __name__ == '__main__':
    app.run(debug=False)