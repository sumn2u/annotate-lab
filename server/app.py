import io
from flask import Flask, jsonify, request, url_for, send_from_directory, send_file, after_this_request, current_app
from flask_cors import CORS, cross_origin
from db.db_handler import Module
from io import BytesIO
import pandas as pd
import requests
import json
from PIL import Image, ImageDraw
import os
import traceback
import tempfile
import shutil
import zipfile
import math
import re
from datetime import datetime
from sam_model import SamModel
from utils import load_image_from_url, format_regions_for_frontend

app = Flask(__name__)
app.config.from_object("config")

# URL of the sam_model to download
if app.config['SAM_MODEL_ENABLED']:
    from sam_model import SamModel
    # URL of the sam_model to download
    model_type = 'vit_h'
    model_url = 'https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth'
    model_path = 'sam_model.pth'  # Path to save the model

    sam_model = SamModel(model_url, model_path, model_type)
else:
    sam_model = None

# Get the CLIENT_URL environment variable, set a default to 80
client_url = os.getenv("CLIENT_URL", "http://localhost")


# Set the folder to save uploaded files
UPLOAD_FOLDER = "uploads"

app.config["CORS_HEADERS"] = "Content-Type"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

CORS(app, resources={r"/*": {"origins": client_url}, r"/uploads/*": {"origins": "*"}})
# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# File path to store task configuration
JSON_FILE = "settings.json"


default_settings = {
    "taskDescription": "",
    "taskChoice": "object_detection",
    "images": [],
    "showLab": False,
    "mode": "light",
    "lastSavedImageIndex": None,
    "configuration": {
        "labels": [],
        "multipleRegions": True,
        "multipleRegionLabels": True,
        "regionTypesAllowed": [],
    },
}

# Load initial data from JSON file if exists
try:
    with open(JSON_FILE, "r") as f:
        initial_settings = json.load(f)
except FileNotFoundError:
    initial_settings = default_settings.copy()

    # Save initial settings to JSON file
    with open(JSON_FILE, "w") as f:
        json.dump(initial_settings, f, indent=4)


def save_settings(settings):
    with open(JSON_FILE, "w") as f:
        json.dump(settings, f, indent=4)


dbModule = Module()
path = os.path.abspath("./uploads")


@app.route("/save", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def save_annotate_info():
    try:
        request_data = request.get_json()
        if dbModule.handleNewData(request_data):
            # Return success response
            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "Annotation data saved successfully",
                    }
                ),
                200,
            )
        else:
            # Return failure response if handleNewData fails
            return (
                jsonify(
                    {"status": "error", "message": "Failed to save annotation data"}
                ),
                500,
            )
    except AssertionError:
        # Handle any other exceptions
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "An error occurred while processing the request",
                }
            ),
            500,
        )


# Allowed extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_uploaded_files():
    files = []
    for filename in os.listdir(app.config["UPLOAD_FOLDER"]):
        if allowed_file(filename):
            file_url = url_for("uploaded_file", filename=filename, _external=True)
            files.append({"filename": filename, "url": file_url})
    return files


def save_settings(settings):
    with open(JSON_FILE, "w") as f:
        json.dump(settings, f, indent=4)


@app.route("/settings", methods=["GET"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def get_settings():
    return jsonify(initial_settings)


@app.route("/settings", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def update_settings():
    new_settings = request.json
    initial_settings.update(new_settings)
    save_settings(initial_settings)
    return jsonify({"message": "Settings updated successfully"})


@app.route("/get_auto_annotations", methods=["POST"])
@cross_origin(origin="*", headers=["Content-Type"])
def get_auto_annotations():
    try:
        data = request.get_json()
        image_name = data.get("image_name")
        if not image_name:
            raise ValueError("Invalid JSON data format: 'image_name' not found.")

        image_annotations = []
        base_url = request.host_url + "uploads/"
        image_url = base_url + image_name
        image = load_image_from_url(image_url)
        regions = sam_model.predict(image)
        formatted_regions = format_regions_for_frontend(regions, image_url, image.shape[1], image.shape[0])
        image_annotations.append(
            {
                "image_name": image_name,
                "image_source": image_url,
                "regions": formatted_regions,
            }
        )
        return jsonify(image_annotations), 200

    except ValueError as ve:
        print("ValueError:", ve)
        traceback.print_exc()
        return jsonify({"error": str(ve)}), 400
    except requests.exceptions.RequestException as re:
        print("RequestException:", re)
        traceback.print_exc()
        return jsonify({"error": "Error fetching image from URL"}), 500
    except Exception as e:
        print("General error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
@app.route("/settings/reset", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def reset_settings():
    global initial_settings
    initial_settings = default_settings.copy()
    save_settings(initial_settings)
    return jsonify({"message": "Settings reset to default values"})


@app.route("/upload", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def upload_file():
    try:
        uploaded_files = []

        if "file" not in request.files:
            return (
                jsonify({"status": "error", "message": "No file part in the request"}),
                400,
            )

        files = request.files.getlist("file")

        for file in files:
            if file.filename == "":
                return jsonify({"status": "error", "message": "No selected file"}), 400

            if file and allowed_file(file.filename):
                filename = file.filename
                file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
                file_url = url_for("uploaded_file", filename=filename, _external=True)
                file_info = {"filename": filename, "url": file_url}
                uploaded_files.append(file_info)
            else:
                return (
                    jsonify({"status": "error", "message": "File type not allowed"}),
                    400,
                )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Files uploaded successfully",
                    "files": uploaded_files,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/uploads/<filename>", methods=["GET"])
def uploaded_file(filename):
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    if os.path.exists(file_path):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
    else:
        return jsonify({"status": "error", "message": "File not found"}), 404


@app.route("/uploads/<filename>", methods=["DELETE"])
def delete_file(filename):
    try:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return (
                jsonify({"status": "success", "message": "File deleted successfully"}),
                200,
            )
        else:
            return jsonify({"status": "error", "message": "File not found"}), 404

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/activeImage", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def save_active_image_info():
    try:
        request_data = request.get_json()
        # Assume handleActiveImageData returns True if successful
        if dbModule.handleActiveImageData(request_data):
            # Return success response
            return (
                jsonify(
                    {"status": "success", "message": "Image data saved successfully"}
                ),
                200,
            )
        else:
            # Return failure response if handleActiveImageData fails
            return (
                jsonify({"status": "error", "message": "Failed to save image data"}),
                500,
            )
    except AssertionError:
        # Handle any other exceptions
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "An error occurred while processing the request",
                }
            ),
            500,
        )


def create_json_response(image_name, color_map=None):
    imagesName = []
    base_url = request.host_url + "uploads/"
    # Initialize the main dictionary for storing image information
    main_dict = {"image-name": image_name, "regions": []}

    if color_map:
        main_dict["color-map"] = color_map

    added_region_ids = set()  # Set to track added region IDs

    for root, dirs, files in os.walk(path):
        for f in files:
            if (
                f.lower().endswith((".png", ".jpg", ".jpeg"))
                and f.lower() == image_name.lower()
            ):
                image_url = base_url + f
                imageIndex = dbModule.findInfoInDb(
                    dbModule.imagesInfo, "image-src", image_url
                )
                polygonRegions = dbModule.findInfoInPolygonDb(
                    dbModule.imagePolygonRegions, "image-src", image_url
                )
                boxRegions = dbModule.findInfoInBoxDb(
                    dbModule.imageBoxRegions, "image-src", image_url
                )
                circleRegions = dbModule.findInfoInCircleDb(
                    dbModule.imageCircleRegions, "image-src", image_url
                )

                if imageIndex is not None:
                    comment = str(dbModule.imagesInfo.at[imageIndex, "comment"])
                    main_dict["comment"] = comment if comment != "nan" else ""
                    main_dict["cls"] = str(
                        dbModule.imagesInfo.at[imageIndex, "selected-classes"]
                    )
                    main_dict["cls"] = (
                        main_dict["cls"] if main_dict["cls"] != "nan" else ""
                    )
                    main_dict["processed"] = True

                def add_regions(regions, region_type=None):
                    if isinstance(regions, pd.DataFrame):
                        regions_list = regions.to_dict(orient="records")
                    else:
                        regions_list = regions

                    for region in regions_list:
                        region_id = region.get("region-id")
                        if region_id not in added_region_ids:
                            added_region_ids.add(region_id)
                            if "points" in region:
                                points = region["points"]
                                decoded_points = [
                                    [float(coord) for coord in point.split("-")]
                                    for point in points.split(";")
                                ]
                                region["points"] = decoded_points
                            region["type"] = region_type
                            main_dict["regions"].append(region)

                if polygonRegions is not None:
                    add_regions(polygonRegions, "polygon")

                if boxRegions is not None:
                    add_regions(boxRegions, "box")

                if circleRegions is not None:
                    add_regions(circleRegions, "circle")

    # Add the main dictionary to the list
    imagesName.append(main_dict)

    # Convert the response to JSON and then to a BytesIO object
    json_data = json.dumps({"configuration": imagesName})
    json_bytes = BytesIO(json_data.encode("utf-8"))

    # Use the image_name for the download file name
    download_filename = f"configuration_download.json"

    return json_bytes, download_filename


@app.route("/imagesName", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def images_name():
    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_name = data.get("image_name")
        if not image_name:
            raise ValueError("Invalid JSON data format: 'image_name' not found.")

        json_bytes, download_filename = create_json_response(image_name)

        # Convert BytesIO to string and return as JSON
        json_str = json_bytes.getvalue().decode("utf-8")
        return jsonify(json.loads(json_str))

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


def clear_upload_folder():
    try:
        for root, dirs, files in os.walk(UPLOAD_FOLDER):
            for file in files:
                file_path = os.path.join(root, file)
                os.remove(file_path)
            for dir in dirs:
                dir_path = os.path.join(root, dir)
                shutil.rmtree(dir_path)
    except Exception as e:
        print(f"Error clearing upload folder: {str(e)}")


@app.route("/clearSession", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def clear_session():
    global initial_settings
    try:
        dbModule.clear_db()
        initial_settings = default_settings.copy()
        save_settings(initial_settings)
        clear_upload_folder()
        return jsonify({"message": "Database cleared successfully."}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/download_configuration", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def download_configuration():
    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        color_map = data.get("colorMap", None)
        image_names = data.get("image_names", [])

        # Iterate through each image name
        all_data = {}
        if not image_names:
            raise ValueError("Invalid JSON data format: 'image_names' not found.")

        for img_name in image_names:
            json_bytes, download_filename = create_json_response(img_name, color_map)
            json_data = json_bytes.getvalue().decode("utf-8")
            all_data[img_name] = json.loads(json_data)

        # Convert accumulated data to JSON string
        json_str = json.dumps(all_data, indent=4)

        return send_file(
            io.BytesIO(json_str.encode("utf-8")),
            mimetype="application/json",
            as_attachment=True,
            download_name="merged_configuration.json",
        )

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/class_distribution", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def class_distribution():
    try:
        class_data = dbModule.get_class_distribution()
        response_data = [
            {"data": [count], "class": class_name}
            for class_name, count in class_data.items()
        ]

        return jsonify(response_data), 200

    except Exception as e:
        print("Error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/download_image_with_annotations", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def download_image_with_annotations():
    try:
        data = request.get_json()
        image_names = data.get("image_names", [])
        if not image_names:
            return jsonify({"error": "Invalid JSON data format: 'image_names' not found."}), 400

        color_map = data.get("colorMap", {})
        outline_thickness = data.get("outlineThickness", {})

        color_map = {key: tuple(value) for key, value in color_map.items()}

        processed_images = []

        for image_name in image_names:
            json_bytes, _ = create_json_response(image_name)
            json_str = json_bytes.getvalue().decode("utf-8")
            images = json.loads(json_str).get("configuration", [])

            for image_info in images:
                regions = image_info.get("regions", [])
                if not regions:
                    continue

                image_url = regions[0].get("image-src")

                if "127.0.0.1:5001" in image_url:
                    image_url = image_url.replace("127.0.0.1:5001", "127.0.0.1:5000")
                elif "http://rocky-badlands-09400-2bb445641857.herokuapp.com" in image_url:
                    image_url = image_url.replace(
                        "http://rocky-badlands-09400-2bb445641857.herokuapp.com",
                        "https://rocky-badlands-09400-2bb445641857.herokuapp.com",
                    )

                response = requests.get(image_url)
                response.raise_for_status()
                image = Image.open(BytesIO(response.content))
                if image.mode != "RGBA":
                    image = image.convert("RGBA")
                draw = ImageDraw.Draw(image)
                width, height = image.size

                for region in image_info.get("regions", []):
                    label = region.get("class")
                    color = color_map.get(label, (255, 0, 0))

                    if "points" in region and region["points"]:
                        points = region["points"]
                        scaled_points = [(x * width, y * height) for x, y in points]
                        draw.line(
                            scaled_points + [scaled_points[0]],
                            fill=color,
                            width=outline_thickness.get("POLYGON", 2),
                        )
                    elif all(key in region for key in ("x", "y", "w", "h")):
                        try:
                            x = (float(region["x"][1:-1]) if isinstance(region["x"], str) else float(region["x"][0])) * width
                            y = (float(region["y"][1:-1]) if isinstance(region["y"], str) else float(region["y"][0])) * height
                            w = (float(region["w"][1:-1]) if isinstance(region["w"], str) else float(region["w"][0])) * width
                            h = (float(region["h"][1:-1]) if isinstance(region["h"], str) else float(region["h"][0])) * height
                        except (ValueError, TypeError) as e:
                            raise ValueError(f"Invalid bounding box: {region}, error: {e}")
                        draw.rectangle(
                            [x, y, x + w, y + h],
                            outline=color,
                            width=outline_thickness.get("BOUNDING_BOX", 2),
                        )
                    elif all(key in region for key in ("rx", "ry", "rw", "rh")):
                        try:
                            rx = (float(region["rx"][1:-1]) if isinstance(region["rx"], str) else float(region["rx"][0])) * width
                            ry = (float(region["ry"][1:-1]) if isinstance(region["ry"], str) else float(region["ry"][0])) * height
                            rw = (float(region["rw"][1:-1]) if isinstance(region["rw"], str) else float(region["rw"][0])) * width
                            rh = (float(region["rh"][1:-1]) if isinstance(region["rh"], str) else float(region["rh"][0])) * height
                        except (ValueError, TypeError) as e:
                            raise ValueError(f"Invalid circle: {region}, error: {e}")
                        draw.ellipse(
                            [rx, ry, rx + rw, ry + rh],
                            outline=color,
                            width=outline_thickness.get("CIRCLE", 2),
                        )

                img_byte_arr = BytesIO()
                image.save(img_byte_arr, format="PNG")
                img_byte_arr.seek(0)

                original_name = image_info.get("image-name", image_name)
                base_name = os.path.splitext(original_name)[0]
                download_name = f"{base_name}_annotated.png"

                processed_images.append((img_byte_arr, download_name))

        if not processed_images:
            return jsonify({"error": "No images with annotations found"}), 404

        if len(processed_images) == 1:
            img_byte_arr, download_name = processed_images[0]
            return send_file(
                img_byte_arr,
                mimetype="image/png",
                as_attachment=True,
                download_name=download_name
            )

        zip_byte_arr = BytesIO()
        with zipfile.ZipFile(zip_byte_arr, "w") as zipf:
            for img_byte_arr, download_name in processed_images:
                zipf.writestr(download_name, img_byte_arr.read())
                # No need to close img_byte_arr here; it will be GC'd

        zip_byte_arr.seek(0)

        return send_file(
            zip_byte_arr,
            mimetype="application/zip",
            as_attachment=True,
            download_name="images_with_annotations.zip"
        )

    except ValueError as ve:
        print("ValueError:", ve)
        traceback.print_exc()
        return jsonify({"error": str(ve)}), 400
    except requests.exceptions.RequestException as re:
        print("RequestException:", re)
        traceback.print_exc()
        return jsonify({"error": "Error fetching image from URL"}), 500
    except Exception as e:
        print("General error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def convert_nan(value):
    if isinstance(value, float) and math.isnan(value):
        return None
    elif isinstance(value, str) and value.lower() == "nan":
        return None
    else:
        return value


def hex_to_rgb_tuple(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def map_region_keys(region):
    mapped_region = {}
    for key, value in region.items():
        if key == "class":
            mapped_region["cls"] = convert_nan(value)
        elif key == "region-id":
            mapped_region["id"] = convert_nan(value)
        elif key.startswith("r") and len(key) == 2 and key[1] in ["h", "w", "x", "y"]:
            if (
                isinstance(value, list)
                and len(value) == 1
                and isinstance(value[0], float)
            ):
                mapped_region[key[1:]] = value[0]
            elif (
                isinstance(value, str) and value.startswith("[") and value.endswith("]")
            ):
                mapped_region[key[1:]] = float(value[1:-1])
            else:
                mapped_region[key[1:]] = convert_nan(value)
        elif key in ["x", "y", "w", "h"] and region.get("type") == "box":
            if (
                isinstance(value, list)
                and len(value) == 1
                and isinstance(value[0], float)
            ):
                mapped_region[key] = value[0]
            elif (
                isinstance(value, str) and value.startswith("[") and value.endswith("]")
            ):
                mapped_region[key] = float(value[1:-1])
            else:
                mapped_region[key] = convert_nan(value)
        elif key == "color":
            mapped_region["color"] = hex_to_rgb_tuple(value)
        else:
            mapped_region[key] = convert_nan(value)
    print(f"Mapped Region: {mapped_region}")
    return mapped_region


@app.route("/get_image_annotations", methods=["POST"])
@cross_origin(origin="*", headers=["Content-Type"])
def get_image_annotations():
    try:
        data = request.get_json()
        image_names = data.get("image_names", [])
        if not image_names:
            raise ValueError("Invalid JSON data format: 'image_names' not found.")

        image_annotations = []

        for image_name in image_names:
            json_bytes, download_filename = create_json_response(image_name)
            json_str = json_bytes.getvalue().decode("utf-8")
            # print(f"JSON String: {json_str}")  # Debug: Print JSON string
            images = json.loads(json_str).get("configuration", [])

            for image_info in images:
                regions = image_info.get("regions", [])
                if not regions:
                    continue

                region = regions[0]
                image_url = region.get("image-src")
                if "127.0.0.1:5001" in image_url:
                    image_url = image_url.replace("127.0.0.1:5001", "127.0.0.1:5000")
                elif "http://rocky-badlands-09400-2bb445641857.herokuapp.com" in image_url:
                    image_url = image_url.replace(
                        "http://rocky-badlands-09400-2bb445641857.herokuapp.com",
                        "https://rocky-badlands-09400-2bb445641857.herokuapp.com",
                    )
                # Handle NaN values in regions
                cleaned_regions = cleaned_regions = [
                    map_region_keys(region) for region in regions
                ]

                image_annotations.append(
                    {
                        "image_name": image_info.get("image-name"),
                        "image_source": image_url,
                        "regions": cleaned_regions,
                    }
                )

        print(f"Image Annotations: {image_annotations}")
        return jsonify(image_annotations), 200

    except ValueError as ve:
        print("ValueError:", ve)
        traceback.print_exc()
        return jsonify({"error": str(ve)}), 400
    except requests.exceptions.RequestException as re:
        print("RequestException:", re)
        traceback.print_exc()
        return jsonify({"error": "Error fetching image from URL"}), 500
    except Exception as e:
        print("General error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def get_class_labels_from_settings():
    """Extract class labels from settings.json"""
    try:
        with open(JSON_FILE, "r") as f:
            settings = json.load(f)
            labels = settings.get('configuration', {}).get('labels', [])
            # Create a mapping from id to description
            class_map = {}
            for label in labels:
                if isinstance(label, dict):
                    label_id = str(label.get('id', ''))
                    description = label.get('description', '')
                    if label_id and description:
                        class_map[label_id] = description
            return class_map
    except Exception as e:
        print(f"Error reading settings: {e}")
        return {}


def extract_numeric_value(value, strict=True):
    """
    Extract numeric value from various formats.
    
    Args:
        value: The value to extract a number from
        strict: If True, returns None on failure; if False, returns 0.0
    
    Returns:
        float or None (if strict=True and parsing fails)
    """
    if value is None:
        return None if strict else 0.0
    
    if isinstance(value, (int, float)):
        return float(value)
    
    if isinstance(value, list):
        if len(value) > 0:
            try:
                return float(value[0])
            except (ValueError, TypeError):
                pass
        return None if strict else 0.0
    
    if isinstance(value, str):
        # Remove any whitespace
        value = value.strip()
        
        # Handle empty string
        if not value:
            return None if strict else 0.0
        
        # Remove common array wrappers
        if value.startswith('array(') and value.endswith(')'):
            value = value[6:-1].strip()
        
        # Remove outer brackets if present
        if (value.startswith('[') and value.endswith(']')) or \
           (value.startswith('(') and value.endswith(')')):
            value = value[1:-1].strip()
        
        # Extract all numbers from the string
        numbers = re.findall(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', value)
        
        if numbers:
            try:
                return float(numbers[0])
            except ValueError:
                pass
    
    return None if strict else 0.0


def calculate_polygon_area(points):
    """
    Calculate the area of a polygon using the shoelace formula.
    Points should be in absolute coordinates as a flat list [x1, y1, x2, y2, ...].
    """
    if len(points) < 6:  # Need at least 3 points (6 coordinates)
        return 0.0
    
    area = 0
    n = len(points) // 2  # Number of points
    
    for i in range(n):
        x1 = points[2 * i]
        y1 = points[2 * i + 1]
        x2 = points[2 * ((i + 1) % n)]
        y2 = points[2 * ((i + 1) % n) + 1]
        area += x1 * y2 - x2 * y1
    
    return abs(area) / 2.0

@app.route("/download_coco_annotations", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def download_coco_annotations():
    data = request.get_json()
    image_names = data.get("image_names", [])

    if not image_names:
        return (
            jsonify({"error": "Invalid JSON data format: 'image_names' not found."}),
            400,
        )

    temp_dir = tempfile.mkdtemp()

    try:
        coco_data = create_coco_annotations(image_names)

        if len(image_names) == 1:
            json_filename = os.path.splitext(image_names[0])[0] + ".json"
        else:
            json_filename = "coco_annotations.json"

        json_path = os.path.join(temp_dir, json_filename)

        with open(json_path, "w") as f:
            json.dump(coco_data, f, indent=2)

        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(json_path):
                    os.remove(json_path)
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
            except Exception as e:
                print(f"Cleanup error: {e}")
            return response

        return send_file(
            json_path,
            mimetype="application/json",
            as_attachment=True,
            download_name=json_filename
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def create_coco_annotations(image_names):
    """
    Create COCO format annotations for the given image names.
    """
    base_url = request.host_url + "uploads/"
    
    # Get class labels from settings
    class_labels = get_class_labels_from_settings()
    print(f"Class labels from settings: {class_labels}")
    
    # Initialize COCO data structure
    coco_data = {
        "info": {
            "description": "COCO Format Annotations",
            "url": request.host_url,
            "version": "1.0",
            "year": datetime.now().year,
            "contributor": "Annotate Lab",
            "date_created": datetime.now().isoformat()
        },
        "licenses": [
            {
                "id": 1,
                "name": "Unknown",
                "url": ""
            }
        ],
        "images": [],
        "annotations": [],
        "categories": []
    }
    
    # Track category IDs and annotation IDs
    category_map = {}
    next_category_id = 1
    next_annotation_id = 1
    
    # Build a lookup from filename (lowercased) to full image path once
    print(f"Building image path lookup from {path}...")
    image_path_map = {}
    for root, dirs, files in os.walk(path):
        for f in files:
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                image_path_map[f.lower()] = os.path.join(root, f)
    
    print(f"Found {len(image_path_map)} images in directory")
    
    # Process each image
    for image_name in image_names:
        # Find image path using the precomputed map
        image_path = image_path_map.get(image_name.lower())
        
        if not image_path:
            raise ValueError(f"Image '{image_name}' not found in the upload directory.")
        
        # Get image dimensions
        with Image.open(image_path) as img:
            width, height = img.size
        
        # Add image info to COCO
        image_id = len(coco_data["images"]) + 1
        image_name_without_ext = os.path.splitext(image_name)[0]
        coco_data["images"].append({
            "id": image_id,
            "file_name": image_name,
            "width": width,
            "height": height,
            "license": 1,
            "date_captured": datetime.now().isoformat(),
            "original_name": image_name_without_ext
        })
        
        # Fetch annotations for this image
        image_url = base_url + image_name
        polygonRegions = dbModule.findInfoInPolygonDb(
            dbModule.imagePolygonRegions, "image-src", image_url
        )
        boxRegions = dbModule.findInfoInBoxDb(
            dbModule.imageBoxRegions, "image-src", image_url
        )
        circleRegions = dbModule.findInfoInCircleDb(
            dbModule.imageCircleRegions, "image-src", image_url
        )
        
        # Process box regions
        if boxRegions is not None and not boxRegions.empty:
            for index, region in boxRegions.iterrows():
                # Get class ID and convert to description
                class_id = str(region.get("class", "unknown"))
                class_name = class_labels.get(class_id, class_id)
                
                # Parse bbox coordinates with strict=True to detect failures
                x_val = region.get("x")
                y_val = region.get("y")
                w_val = region.get("w")
                h_val = region.get("h")
                
                x = extract_numeric_value(x_val, strict=True)
                y = extract_numeric_value(y_val, strict=True)
                w = extract_numeric_value(w_val, strict=True)
                h = extract_numeric_value(h_val, strict=True)
                
                # Validate parsed values
                if any(v is None for v in [x, y, w, h]):
                    print(f"Skipping box region with invalid coordinates: {region}")
                    continue
                
                # Validate dimensions (must be positive)
                if w <= 0 or h <= 0:
                    print(f"Skipping box region with zero/negative dimensions: w={w}, h={h}")
                    continue
                
                # Validate coordinates are within reasonable range (0-1 for normalized)
                if not (0 <= x <= 1 and 0 <= y <= 1):
                    print(f"Warning: Box coordinates outside normalized range: x={x}, y={y}")
                    # Still continue as they might be absolute coordinates
                
                # Get or create category
                if class_name not in category_map:
                    category_map[class_name] = next_category_id
                    coco_data["categories"].append({
                        "id": next_category_id,
                        "name": class_name,
                        "supercategory": "none"
                    })
                    next_category_id += 1
                
                # Convert to absolute coordinates
                abs_x = x * width
                abs_y = y * height
                abs_w = w * width
                abs_h = h * height
                
                # Add annotation
                coco_data["annotations"].append({
                    "id": next_annotation_id,
                    "image_id": image_id,
                    "category_id": category_map[class_name],
                    "bbox": [round(abs_x, 2), round(abs_y, 2), round(abs_w, 2), round(abs_h, 2)],
                    "area": round(abs_w * abs_h, 2),
                    "segmentation": [],
                    "iscrowd": 0,
                    "region_id": region.get("region-id", f"box_{next_annotation_id}")
                })
                next_annotation_id += 1
        
        # Process polygon regions (segmentation)
        if polygonRegions is not None and not polygonRegions.empty:
            for index, region in polygonRegions.iterrows():
                # Get class ID and convert to description
                class_id = str(region.get("class", "unknown"))
                class_name = class_labels.get(class_id, class_id)
                
                points_str = region.get("points", "")
                
                # Skip if no points
                if not points_str:
                    print(f"Skipping polygon region with no points: {region}")
                    continue
                
                # Parse points
                points_list = points_str.split(";")
                segmentation = []
                absolute_points = []
                x_coords = []
                y_coords = []
                valid_points = True
                
                for point_str in points_list:
                    if point_str and "-" in point_str:
                        try:
                            x, y = map(float, point_str.split("-"))
                            # Validate coordinates
                            if not (0 <= x <= 1 and 0 <= y <= 1):
                                print(f"Warning: Point coordinates outside normalized range: x={x}, y={y}")
                            
                            # Convert normalized coordinates to absolute
                            abs_x = x * width
                            abs_y = y * height
                            
                            segmentation.extend([round(abs_x, 2), round(abs_y, 2)])
                            absolute_points.extend([abs_x, abs_y])
                            x_coords.append(abs_x)
                            y_coords.append(abs_y)
                        except ValueError:
                            print(f"Invalid point format: {point_str}")
                            valid_points = False
                            break
                
                if not valid_points or len(segmentation) < 6:  # Need at least 3 points
                    print(f"Skipping polygon with invalid points: {region}")
                    continue
                
                # Get or create category
                if class_name not in category_map:
                    category_map[class_name] = next_category_id
                    coco_data["categories"].append({
                        "id": next_category_id,
                        "name": class_name,
                        "supercategory": "none"
                    })
                    next_category_id += 1
                
                # Calculate bbox from segmentation
                x_min = min(x_coords)
                y_min = min(y_coords)
                x_max = max(x_coords)
                y_max = max(y_coords)
                bbox_width = x_max - x_min
                bbox_height = y_max - y_min
                
                # Validate bbox dimensions
                if bbox_width <= 0 or bbox_height <= 0:
                    print(f"Skipping polygon with zero/negative bbox dimensions")
                    continue
                
                # Calculate actual polygon area using shoelace formula
                polygon_area = calculate_polygon_area(absolute_points)
                
                # Add annotation
                coco_data["annotations"].append({
                    "id": next_annotation_id,
                    "image_id": image_id,
                    "category_id": category_map[class_name],
                    "bbox": [round(x_min, 2), round(y_min, 2), 
                            round(bbox_width, 2), round(bbox_height, 2)],
                    "area": round(polygon_area, 2),
                    "segmentation": [segmentation],
                    "iscrowd": 0,
                    "region_id": region.get("region-id", f"poly_{next_annotation_id}")
                })
                next_annotation_id += 1
        
        # Process circle/ellipse regions
        if circleRegions is not None and not circleRegions.empty:
            for index, region in circleRegions.iterrows():
                # Get class ID and convert to description
                class_id = str(region.get("class", "unknown"))
                class_name = class_labels.get(class_id, class_id)
                
                # Parse circle/ellipse coordinates with strict=True
                rx_val = region.get("rx")
                ry_val = region.get("ry")
                rw_val = region.get("rw")
                rh_val = region.get("rh")
                
                rx = extract_numeric_value(rx_val, strict=True)
                ry = extract_numeric_value(ry_val, strict=True)
                rw = extract_numeric_value(rw_val, strict=True)
                rh = extract_numeric_value(rh_val, strict=True)
                
                # Validate parsed values
                if any(v is None for v in [rx, ry, rw, rh]):
                    print(f"Skipping circle region with invalid coordinates: {region}")
                    continue
                
                # Validate dimensions (must be positive)
                if rw <= 0 or rh <= 0:
                    print(f"Skipping circle region with zero/negative dimensions: rw={rw}, rh={rh}")
                    continue
                
                # Validate coordinates are within reasonable range
                if not (0 <= rx <= 1 and 0 <= ry <= 1):
                    print(f"Warning: Circle coordinates outside normalized range: rx={rx}, ry={ry}")
                
                # Get or create category
                if class_name not in category_map:
                    category_map[class_name] = next_category_id
                    coco_data["categories"].append({
                        "id": next_category_id,
                        "name": class_name,
                        "supercategory": "none"
                    })
                    next_category_id += 1
                
                # Convert to absolute coordinates
                abs_rx = rx * width
                abs_ry = ry * height
                abs_rw = rw * width
                abs_rh = rh * height
                
                # Calculate ellipse area
                ellipse_area = math.pi * abs_rw * abs_rh / 4.0
                
                # Add annotation
                coco_data["annotations"].append({
                    "id": next_annotation_id,
                    "image_id": image_id,
                    "category_id": category_map[class_name],
                    "bbox": [round(abs_rx, 2), round(abs_ry, 2), 
                            round(abs_rw, 2), round(abs_rh, 2)],
                    "area": round(ellipse_area, 2),
                    "segmentation": [],
                    "iscrowd": 0,
                    "region_id": region.get("region-id", f"circle_{next_annotation_id}")
                })
                next_annotation_id += 1
    
    # If no categories were added, add a default one
    if not coco_data["categories"]:
        coco_data["categories"].append({
            "id": 1,
            "name": "unknown",
            "supercategory": "none"
        })
    
    print(f"Created COCO annotations with {len(coco_data['images'])} images, "
          f"{len(coco_data['annotations'])} annotations, "
          f"{len(coco_data['categories'])} categories")
    
    return coco_data

@app.route("/download_image_mask", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def download_image_mask():
    try:
        data = request.get_json()
        image_names = data.get("image_names", [])
        if not image_names:
            return jsonify({"error": "Invalid JSON data format: 'image_names' not found."}), 400

        color_map = data.get("colorMap", {})
        outline_thickness = data.get("outlineThickness", {})

        color_map = {key: tuple(value) for key, value in color_map.items()}

        temp_dir = tempfile.mkdtemp()
        mask_paths = []  
        for image_name in image_names:
            json_bytes, download_filename = create_json_response(image_name)
            json_str = json_bytes.getvalue().decode("utf-8")
            data_json = json.loads(json_str)
            images = data_json.get("configuration", [])

            for image_info in images:
                regions = image_info.get("regions", [])
                if not regions:
                    continue  # skip images with no annotations

                image_url = regions[0].get("image-src")
                if "127.0.0.1:5001" in image_url:
                    image_url = image_url.replace("127.0.0.1:5001", "127.0.0.1:5000")
                elif "http://rocky-badlands-09400-2bb445641857.herokuapp.com" in image_url:
                    image_url = image_url.replace(
                        "http://rocky-badlands-09400-2bb445641857.herokuapp.com",
                        "https://rocky-badlands-09400-2bb445641857.herokuapp.com",
                    )

                response = requests.get(image_url)
                response.raise_for_status()
                original_image = Image.open(BytesIO(response.content))
                if original_image.mode != "RGBA":
                    original_image = original_image.convert("RGBA")
                width, height = original_image.size

                mask = Image.new(
                    "RGB",
                    (width, height),
                    current_app.config.get("MASK_BACKGROUND_COLOR", (0, 0, 0))
                )
                draw = ImageDraw.Draw(mask)

                for region in image_info.get("regions", []):
                    label = region.get("class")
                    color = color_map.get(label, (255, 255, 255))

                    # Points for polygon
                    if "points" in region and region["points"]:
                        points = region["points"]
                        scaled_points = [
                            (int(x * width), int(y * height)) for x, y in points
                        ]
                        draw.polygon(
                            scaled_points,
                            outline=color,
                            fill=color,
                            width=outline_thickness.get("POLYGON", 2),
                        )
                    # Bounding box (x, y, w, h)
                    elif all(key in region for key in ("x", "y", "w", "h")):
                        try:
                            x = (float(region["x"][1:-1]) if isinstance(region["x"], str) else float(region["x"][0])) * width
                            y = (float(region["y"][1:-1]) if isinstance(region["y"], str) else float(region["y"][0])) * height
                            w = (float(region["w"][1:-1]) if isinstance(region["w"], str) else float(region["w"][0])) * width
                            h = (float(region["h"][1:-1]) if isinstance(region["h"], str) else float(region["h"][0])) * height
                        except (ValueError, TypeError) as e:
                            raise ValueError(f"Invalid format in bounding box: {region}, error: {e}")
                        draw.rectangle(
                            [x, y, x + w, y + h],
                            outline=color,
                            fill=color,
                            width=outline_thickness.get("BOUNDING_BOX", 2),
                        )
                    # Circle (rx, ry, rw, rh)
                    elif all(key in region for key in ("rx", "ry", "rw", "rh")):
                        try:
                            rx = (float(region["rx"][1:-1]) if isinstance(region["rx"], str) else float(region["rx"][0])) * width
                            ry = (float(region["ry"][1:-1]) if isinstance(region["ry"], str) else float(region["ry"][0])) * height
                            rw = (float(region["rw"][1:-1]) if isinstance(region["rw"], str) else float(region["rw"][0])) * width
                            rh = (float(region["rh"][1:-1]) if isinstance(region["rh"], str) else float(region["rh"][0])) * height
                        except (ValueError, TypeError) as e:
                            raise ValueError(f"Invalid format in circle: {region}, error: {e}")
                        draw.ellipse(
                            [rx, ry, rx + rw, ry + rh],
                            outline=color,
                            fill=color,
                            width=outline_thickness.get("CIRCLE", 2),
                        )

                # Save mask image as PNG with appropriate name
                base_name = os.path.splitext(image_info.get("image-name", image_name))[0]
                mask_filename = f"{base_name}_mask.png"
                mask_path = os.path.join(temp_dir, mask_filename)
                mask.save(mask_path)
                mask_paths.append(mask_path)

        # Determine response: single mask image or ZIP
        if len(image_names) == 1 and len(mask_paths) == 1:
            # Single mask – return the image directly
            single_mask_path = mask_paths[0]

            @after_this_request
            def cleanup_single(response):
                try:
                    if os.path.exists(single_mask_path):
                        os.remove(single_mask_path)
                    if os.path.exists(temp_dir):
                        shutil.rmtree(temp_dir)
                except Exception as e:
                    print(f"Cleanup error: {e}")
                return response

            return send_file(
                single_mask_path,
                mimetype="image/png",
                as_attachment=True,
                download_name=os.path.basename(single_mask_path)
            )
        else:
            # Multiple masks – create a ZIP archive
            zip_filename = "image_masks.zip"
            zip_path = os.path.join(temp_dir, zip_filename)

            with zipfile.ZipFile(zip_path, "w") as zipf:
                for mask_path in mask_paths:
                    arcname = os.path.basename(mask_path)
                    zipf.write(mask_path, arcname=arcname)

            @after_this_request
            def cleanup_zip(response):
                try:
                    for mask_path in mask_paths:
                        if os.path.exists(mask_path):
                            os.remove(mask_path)
                    if os.path.exists(zip_path):
                        os.remove(zip_path)
                    if os.path.exists(temp_dir):
                        shutil.rmtree(temp_dir)
                except Exception as e:
                    print(f"Cleanup error: {e}")
                return response

            return send_file(
                zip_path,
                mimetype="application/zip",
                as_attachment=True,
                download_name=zip_filename
            )

    except ValueError as ve:
        print("ValueError:", ve)
        traceback.print_exc()
        return jsonify({"error": str(ve)}), 400
    except requests.exceptions.RequestException as re:
        print("RequestException:", re)
        traceback.print_exc()
        return jsonify({"error": "Error fetching image from URL"}), 500
    except Exception as e:
        print("General error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def create_yolo_annotations(image_names, color_map=None):
    base_url = request.host_url + "uploads/"
    all_annotations = []

    for image_name in image_names:
        # Fetch image and its annotations
        image_path = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if (
                    f.lower().endswith((".png", ".jpg", ".jpeg"))
                    and f.lower() == image_name.lower()
                ):
                    image_path = os.path.join(root, f)
                    break
            if image_path:
                break

        if not image_path:
            raise ValueError(f"Image '{image_name}' not found in the upload directory.")

        # Fetch annotations from database or other source based on image_path
        image_url = base_url + image_name
        imageIndex = dbModule.findInfoInDb(dbModule.imagesInfo, "image-src", image_url)
        polygonRegions = dbModule.findInfoInPolygonDb(
            dbModule.imagePolygonRegions, "image-src", image_url
        )
        boxRegions = dbModule.findInfoInBoxDb(
            dbModule.imageBoxRegions, "image-src", image_url
        )
        circleRegions = dbModule.findInfoInCircleDb(
            dbModule.imageCircleRegions, "image-src", image_url
        )

        # Initialize YOLO annotations for current image
        width, height = Image.open(image_path).size
        annotations = []

        # Process polygon regions
        if polygonRegions is not None:
            for index, region in polygonRegions.iterrows():
                class_name = region.get("class", "unknown")
                points_str = region.get("points", "")

                # Split points string into individual points
                points_list = points_str.split(";")

                # Convert points to list of tuples
                points = []
                for point_str in points_list:
                    x, y = map(float, point_str.split("-"))
                    points.append((x, y))

                # Convert points to normalized YOLO format
                if points:
                    xmin = min(point[0] for point in points)
                    ymin = min(point[1] for point in points)
                    xmax = max(point[0] for point in points)
                    ymax = max(point[1] for point in points)

                    # YOLO format: class_index x_center y_center width height (all normalized)
                    annotations.append(
                        f"{class_name} {(xmin + xmax) / 2:.6f} {(ymin + ymax) / 2:.6f} {xmax - xmin:.6f} {ymax - ymin:.6f}"
                    )

        # Process box regions
        if boxRegions is not None:
            for index, region in boxRegions.iterrows():
                class_name = region.get("class", "unknown")
                try:
                    x = (
                        float(region["x"][1:-1])
                        if isinstance(region["x"], str)
                        else float(region["x"][0])
                    )
                    y = (
                        float(region["y"][1:-1])
                        if isinstance(region["y"], str)
                        else float(region["y"][0])
                    )
                    w = (
                        float(region["w"][1:-1])
                        if isinstance(region["w"], str)
                        else float(region["w"][0])
                    )
                    h = (
                        float(region["h"][1:-1])
                        if isinstance(region["h"], str)
                        else float(region["h"][0])
                    )
                except (ValueError, TypeError) as e:
                    raise ValueError(
                        f"Invalid format in region dimensions: {region}, Error: {e}"
                    )
                # YOLO format: class_index x_center y_center width height (all normalized)
                annotations.append(
                    f"{class_name} {x + w / 2:.6f} {y + h / 2:.6f} {w:.6f} {h:.6f}"
                )

        # Process circle/ellipse regions
        if circleRegions is not None:
            for index, region in circleRegions.iterrows():
                class_name = region.get("class", "unknown")
                try:
                    rx = (
                        float(region["rx"][1:-1]) * width
                        if isinstance(region["rx"], str)
                        else float(region["rx"][0])
                    )
                    ry = (
                        float(region["ry"][1:-1]) * height
                        if isinstance(region["ry"], str)
                        else float(region["ry"][0])
                    )
                    rw = (
                        float(region["rw"][1:-1]) * width
                        if isinstance(region["rw"], str)
                        else float(region["rw"][0])
                    )
                    rh = (
                        float(region["rh"][1:-1]) * height
                        if isinstance(region["rh"], str)
                        else float(region["rh"][0])
                    )
                except (ValueError, TypeError) as e:
                    raise ValueError(
                        f"Invalid format in region dimensions: {region}, Error: {e}"
                    )

                # For YOLO, if width and height are equal, it represents a circle
                if rw == rh:
                    annotations.append(
                        f"{class_name} {rx:.6f} {ry:.6f} {rw:.6f} {rw:.6f}"
                    )  # Treat as circle
                else:
                    # Treat as ellipse (YOLO does not directly support ellipse, so treat as box)
                    annotations.append(
                        f"{class_name} {rx + rw / 2:.6f} {ry + rh / 2:.6f} {rw:.6f} {rh:.6f}"
                    )

        # Append annotations for current image to all_annotations list
        all_annotations.extend(annotations)

    print(f"Annotations: {all_annotations}")
    return all_annotations


@app.route("/download_yolo_annotations", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def download_yolo_annotations():
    data = request.get_json()
    image_names = data.get("image_names", [])

    if not image_names:
        return (
            jsonify({"error": "Invalid JSON data format: 'image_names' not found."}),
            400,
        )

    temp_dir = tempfile.mkdtemp()
    file_paths = [] 

    try:
        for image_name in image_names:
            annotations = create_yolo_annotations([image_name])
            annotation_filename = os.path.splitext(image_name)[0] + ".txt"
            annotation_path = os.path.join(temp_dir, annotation_filename)

            with open(annotation_path, "w") as f:
                for annotation in annotations:
                    f.write(annotation + "\n")
            file_paths.append(annotation_path)

        if len(image_names) == 1:
            single_file_path = file_paths[0]

            @after_this_request
            def cleanup_single(response):
                try:
                    os.remove(single_file_path)
                    os.rmdir(temp_dir)
                except Exception as e:
                    print(f"Cleanup error: {e}")
                return response

            return send_file(
                single_file_path,
                mimetype="text/plain",
                as_attachment=True,
                download_name=os.path.basename(single_file_path)  # e.g., "image1.txt"
            )

        # Multiple images: create a ZIP archive
        zip_filename = "yolo_annotations.zip"
        zip_file_path = os.path.join(temp_dir, zip_filename)

        with zipfile.ZipFile(zip_file_path, "w") as zipf:
            for annotation_path in file_paths:
                arcname = os.path.basename(annotation_path)
                zipf.write(annotation_path, arcname=arcname)

        # Schedule cleanup of the whole temporary directory after sending
        @after_this_request
        def cleanup_zip(response):
            try:
                for f in file_paths:
                    if os.path.exists(f):
                        os.remove(f)
                if os.path.exists(zip_file_path):
                    os.remove(zip_file_path)
                os.rmdir(temp_dir)
            except Exception as e:
                print(f"Cleanup error: {e}")
            return response

        return send_file(
            zip_file_path,
            mimetype="application/zip",
            as_attachment=True,
            download_name=zip_filename
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/imagesInfo", methods=["GET"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def get_images_info():
    global path

    print(f"Searching in path: {path}")  # Debugging statement

    # Check if the path exists and is a directory
    if not os.path.exists(path):
        return jsonify({"error": "Path does not exist"}), 404

    if not os.path.isdir(path):
        return jsonify({"error": "Path is not a directory"}), 400

    try:
        imagesName = []
        for root, dirs, file in os.walk(path):
            print(f"Root: {root}, Dirs: {dirs}, Files: {file}")  # Debugging statement
            for f in file:
                dictionary = {}
                if (".png" in f) or (".jpg" in f) or (".jpeg" in f):
                    dictionary["image-name"] = f
                    imageIndex = dbModule.findInfoInDb(
                        dbModule.imagesInfo, "image-src", "./images/" + f
                    )

                    if imageIndex is not None:
                        comment = str(dbModule.imagesInfo.at[imageIndex, "comment"])
                        dictionary["comment"] = comment if comment != "nan" else ""
                        dictionary["cls"] = str(
                            dbModule.imagesInfo.at[imageIndex, "selected-classes"]
                        )

                        dictionary["cls"] = (
                            dictionary["cls"] if dictionary["cls"] != "nan" else ""
                        )
                        dictionary["processed"] = True
                    else:
                        dictionary["processed"] = False

                    imagesName.append(dictionary)

        response = jsonify({"imagesNames": imagesName})
        return response
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "error", "message": "Resource not found"}), 404


@app.route("/", methods=["GET"])
def main():
    return """
        <h1>Welcome to Annotate Lab</h1>
    """


# If the file is run directly,start the app.
if __name__ == "__main__":
    print("Starting server...")
    app.run(debug=False)