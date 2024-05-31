from crypt import methods
import dbm
from email import header
from urllib import response
from urllib.robotparser import RequestRate
from wsgiref import headers
from flask import Flask, jsonify, request, url_for,send_from_directory
from flask_cors import CORS, cross_origin
from db.db_handler import Module
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

# Set the folder to save uploaded files
UPLOAD_FOLDER = 'uploads'

app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# CORS(app, resources={r"/*": {"origins": "localhost:5173"}})
CORS(app, resources={r"/*": {"origins": "*"}})
# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


dbModule = Module()
path = os.path.abspath('../client/public/images')

@app.route('/save', methods=['POST'])
@cross_origin(origin='localhost:5173', headers=['Content-Type'])
def save_annotate_info():
    try:
        request_data = request.get_json()
        dbModule.handleNewData(request_data)
        return "got it"
    except AssertionError:
        print('error')
    pass

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
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        files = get_uploaded_files()
        return jsonify({"message": "File uploaded successfully", "files": files}), 201
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # return jsonify({'url': url_for('static', filename=f'uploads/{filename}', _external=True)})
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)



@app.route('/activeImage', methods=['POST'])
@cross_origin(origins='*', headers=['Content-Type'])
def save_active_image_info():
    try:
        request_data = request.get_json()
        dbModule.handleActiveImageData(request_data)
        return 'got it '
    except AssertionError:
        print('error')


@app.route('/imagesName', methods=['POST'])
@cross_origin(origins='*', headers=['Content-Type'])
def images_name():
    global path
    try:
        request_data = request.get_json()

        # Ensure the expected structure of the JSON data
        if 'params' in request_data and 'labels' in request_data['params']:
            labels = request_data['params']['labels']
        else:
            raise ValueError("Invalid JSON data format: 'params' or 'labels' not found.")

        # Assuming dbModule.createCategories works correctly with the 'labels' data
        dbModule.createCategories(labels)

        imagesName = []
        for (root, dirs, files) in os.walk(path):
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    dictionary = {'image-name': f}
                    imageIndex = dbModule.findInfoInDb(dbModule.imagesInfo, 'image-src', 'images/' + f)
                    polygonRegions = dbModule.findInfoInPolygonDb(dbModule.imagePolygonRegions, 'image-src', 'images/' + f)
                
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

        response = jsonify({'imagesName': imagesName})
        return response

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/imagesInfo', methods=['GET'])
@cross_origin(origins='*', headers=['Content-Type'])
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
    except AssertionError:
        print('Error')

@app.route('/', methods=['GET'])
def main():
    return '''
        <h1>Welcome to Annotate Lab</h1>
    '''


# If the file is run directly,start the app.
if __name__ == '__main__':
    app.run(debug=False)