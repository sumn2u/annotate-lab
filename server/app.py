import io
from flask import Flask, jsonify, request, url_for, send_from_directory, send_file
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
    temp_dir = None  # Initialize temporary directory variable

    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_names = data.get("image_names", [])
        if not image_names:
            raise ValueError("Invalid JSON data format: 'image_names' not found.")

        # Prepare to store all processed images
        img_byte_arrs = []

        for image_name in image_names:
            json_bytes, download_filename = create_json_response(image_name)
            # Convert BytesIO to string and return as JSON
            json_str = json_bytes.getvalue().decode("utf-8")

            images = json.loads(json_str).get("configuration", [])

            color_map = data.get("colorMap", {})
            outlineThickness = data.get("outlineThickness", {})

            # Convert color map values to tuples
            for key in color_map.keys():
                color_map[key] = tuple(color_map[key])

            for image_info in images:
                # image_url = image_info.get("regions", [])[0].get("image-src")
                regions = image_info.get("regions", [])
                if not regions:
                    continue  # Skip if no regions are present

                region = regions[
                    0
                ]  # Take the first region (assuming there is at least one)
                image_url = region.get("image-src")
                # Docker container uses port 5000, so replace 5001 with 5000
                if "127.0.0.1:5001" in image_url:
                    image_url = image_url.replace("127.0.0.1:5001", "127.0.0.1:5000")
                elif "http://rocky-badlands-09400-2bb445641857.herokuapp.com" in image_url:
                    image_url = image_url.replace(
                        "http://rocky-badlands-09400-2bb445641857.herokuapp.com",
                        "https://rocky-badlands-09400-2bb445641857.herokuapp.com",
                    )

                response = requests.get(image_url)
                image = Image.open(BytesIO(response.content))
                draw = ImageDraw.Draw(image)

                for region in image_info.get("regions", []):
                    points = region.get("points", [])
                    width, height = image.size
                    label = region.get("class")
                    color = color_map.get(
                        label, (255, 0, 0)
                    )  # Default to red if label not in color_map
                    if "points" in region and region["points"]:
                        points = region["points"]
                        scaled_points = [(x * width, y * height) for x, y in points]
                        # Draw polygon with thicker outline
                        draw.line(
                            scaled_points + [scaled_points[0]],
                            fill=color,
                            width=outlineThickness.get("POLYGON", 2),
                        )  # Change width as desired
                    elif all(key in region for key in ("x", "y", "w", "h")):
                        try:
                            x = (
                                float(region["x"][1:-1]) * width
                                if isinstance(region["x"], str)
                                else float(region["x"][0]) * width
                            )
                            y = (
                                float(region["y"][1:-1]) * height
                                if isinstance(region["y"], str)
                                else float(region["y"][0]) * height
                            )
                            w = (
                                float(region["w"][1:-1]) * width
                                if isinstance(region["w"], str)
                                else float(region["w"][0]) * width
                            )
                            h = (
                                float(region["h"][1:-1]) * height
                                if isinstance(region["h"], str)
                                else float(region["h"][0]) * height
                            )
                        except (ValueError, TypeError) as e:
                            raise ValueError(
                                f"Invalid format in region dimensions: {region}, Error: {e}"
                            )
                        # Draw rectangle with thicker outline
                        draw.rectangle(
                            [x, y, x + w, y + h],
                            outline=color,
                            width=outlineThickness.get("BOUNDING_BOX", 2),
                        )
                    elif all(key in region for key in ("rx", "ry", "rw", "rh")):
                        try:
                            rx = (
                                float(region["rx"][1:-1]) * width
                                if isinstance(region["rx"], str)
                                else float(region["rx"][0]) * width
                            )
                            ry = (
                                float(region["ry"][1:-1]) * height
                                if isinstance(region["ry"], str)
                                else float(region["ry"][0]) * height
                            )
                            rw = (
                                float(region["rw"][1:-1]) * width
                                if isinstance(region["rw"], str)
                                else float(region["rw"][0]) * width
                            )
                            rh = (
                                float(region["rh"][1:-1]) * height
                                if isinstance(region["rh"], str)
                                else float(region["rh"][0]) * height
                            )
                        except (ValueError, TypeError) as e:
                            raise ValueError(
                                f"Invalid format in region dimensions: {region}, Error: {e}"
                            )
                        # Draw ellipse (circle if rw and rh are equal)
                        draw.ellipse(
                            [rx, ry, rx + rw, ry + rh],
                            outline=color,
                            width=outlineThickness.get("CIRCLE", 2),
                        )

                img_byte_arr = BytesIO()
                image.save(img_byte_arr, format="PNG")
                img_byte_arr.seek(0)

                img_byte_arrs.append(
                    {
                        "data": img_byte_arr,
                        "download_name": image_info.get("image-name"),
                    }
                )

        # Prepare and return the zip file containing all processed images
        zip_byte_arr = BytesIO()
        with zipfile.ZipFile(zip_byte_arr, "w") as zip_file:
            for img_info in img_byte_arrs:
                zip_file.writestr(
                    f"{img_info['download_name']}", img_info["data"].read()
                )

        zip_byte_arr.seek(0)

        # Clean up temporary resources after sending the zip file
        for img_info in img_byte_arrs:
            img_info["data"].close()

        return send_file(
            zip_byte_arr,
            mimetype="application/zip",
            as_attachment=True,
            download_name="images_with_annotations.zip",
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
    finally:
        # Clean up temporary directory if it was created
        if temp_dir and os.path.exists(temp_dir):
            try:
                for file in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, file)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                os.rmdir(temp_dir)
            except Exception as cleanup_error:
                print(f"Error cleaning up temporary directory: {cleanup_error}")


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


@app.route("/download_image_mask", methods=["POST"])
@cross_origin(origin=client_url, headers=["Content-Type"])
def download_image_mask():
    try:
        data = request.get_json()
        # Ensure the expected structure of the JSON data
        image_names = data.get("image_names", [])
        if not image_names:
            raise ValueError("Invalid JSON data format: 'image_names' not found.")

        # Initialize a temporary directory to store mask images
        temp_dir = tempfile.mkdtemp()

        # Process each image and create masks
        zip_filename = "image_masks.zip"
        zip_file_path = os.path.join(temp_dir, zip_filename)

        with zipfile.ZipFile(zip_file_path, "w") as zipf:
            for image_name in image_names:
                json_bytes, download_filename = create_json_response(image_name)
                json_str = json_bytes.getvalue().decode("utf-8")
                images = json.loads(json_str).get("configuration", [])

                color_map = data.get("colorMap", {})
                outlineThickness = data.get("outlineThickness", {})

                # Convert color map values to tuples
                for key in color_map.keys():
                    color_map[key] = tuple(color_map[key])
                for image_info in images:
                    regions = image_info.get("regions", [])
                    if not regions:
                        continue  # Skip if no regions are present

                    region = regions[
                        0
                    ]  # Take the first region (assuming there is at least one)
                    image_url = region.get("image-src")
                    # Docker container uses port 5000, so replace 5001 with 5000
                    if "127.0.0.1:5001" in image_url:
                        image_url = image_url.replace(
                            "127.0.0.1:5001", "127.0.0.1:5000"
                        )
                    elif "http://rocky-badlands-09400-2bb445641857.herokuapp.com" in image_url:
                        image_url = image_url.replace(
                            "http://rocky-badlands-09400-2bb445641857.herokuapp.com",
                            "https://rocky-badlands-09400-2bb445641857.herokuapp.com",
                        )

                    response = requests.get(image_url)
                    response.raise_for_status()
                    image = Image.open(BytesIO(response.content))
                    width, height = image.size
                    mask = Image.new(
                        "RGB", (width, height), app.config["MASK_BACKGROUND_COLOR"]
                    )  # 'RGB' mode for colored masks
                    draw = ImageDraw.Draw(mask)

                    for region in image_info.get("regions", []):
                        label = region.get("class")
                        color = color_map.get(
                            label, (255, 255, 255)
                        )  # Default to white if label not in color_map
                        if "points" in region and region["points"]:
                            points = region["points"]
                            scaled_points = [
                                (int(x * width), int(y * height)) for x, y in points
                            ]
                            draw.polygon(
                                scaled_points,
                                outline=color,
                                fill=color,
                                width=outlineThickness.get("POLYGON", 2),
                            )
                        elif all(key in region for key in ("x", "y", "w", "h")):
                            try:
                                x = (
                                    float(region["x"][1:-1]) * width
                                    if isinstance(region["x"], str)
                                    else float(region["x"][0]) * width
                                )
                                y = (
                                    float(region["y"][1:-1]) * height
                                    if isinstance(region["y"], str)
                                    else float(region["y"][0]) * height
                                )
                                w = (
                                    float(region["w"][1:-1]) * width
                                    if isinstance(region["w"], str)
                                    else float(region["w"][0]) * width
                                )
                                h = (
                                    float(region["h"][1:-1]) * height
                                    if isinstance(region["h"], str)
                                    else float(region["h"][0]) * height
                                )
                            except (ValueError, TypeError) as e:
                                raise ValueError(
                                    f"Invalid format in region dimensions: {region}, Error: {e}"
                                )
                            # Draw rectangle for bounding box
                            draw.rectangle(
                                [x, y, x + w, y + h],
                                outline=color,
                                fill=color,
                                width=outlineThickness.get("BOUNDING_BOX", 2),
                            )
                        elif all(key in region for key in ("rx", "ry", "rw", "rh")):
                            try:
                                rx = (
                                    float(region["rx"][1:-1]) * width
                                    if isinstance(region["rx"], str)
                                    else float(region["rx"][0]) * width
                                )
                                ry = (
                                    float(region["ry"][1:-1]) * height
                                    if isinstance(region["ry"], str)
                                    else float(region["ry"][0]) * height
                                )
                                rw = (
                                    float(region["rw"][1:-1]) * width
                                    if isinstance(region["rw"], str)
                                    else float(region["rw"][0]) * width
                                )
                                rh = (
                                    float(region["rh"][1:-1]) * height
                                    if isinstance(region["rh"], str)
                                    else float(region["rh"][0]) * height
                                )
                            except (ValueError, TypeError) as e:
                                raise ValueError(
                                    f"Invalid format in region dimensions: {region}, Error: {e}"
                                )
                            # Draw ellipse (circle if rw and rh are equal)
                            draw.ellipse(
                                [rx, ry, rx + rw, ry + rh],
                                outline=color,
                                width=outlineThickness.get("CIRCLE", 2),
                                fill=color,
                            )

                    # Save mask image to temporary directory
                    mask_filename = image_info.get("image-name")
                    mask_path = os.path.join(temp_dir, mask_filename)
                    mask.save(mask_path)

                    # Add mask image to zip file
                    zipf.write(mask_path, arcname=mask_filename)

        # Send zip file as response
        return send_file(
            zip_file_path,
            mimetype="application/zip",
            as_attachment=True,
            download_name=zip_filename,
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
    finally:
        # Clean up temporary directory
        try:
            if temp_dir:
                for file in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, file)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                os.rmdir(temp_dir)
        except Exception as e:
            print(f"Error cleaning up temporary directory: {e}")


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
    zip_filename = "yolo_annotations.zip"
    zip_file_path = os.path.join(temp_dir, zip_filename)

    try:
        with zipfile.ZipFile(zip_file_path, "w") as zipf:
            for image_name in image_names:
                annotations = create_yolo_annotations([image_name])

                # Create a temporary text file with YOLO annotations for each image
                annotation_filename = os.path.splitext(image_name)[0] + ".txt"
                annotation_path = os.path.join(temp_dir, annotation_filename)

                with open(annotation_path, "w") as f:
                    for annotation in annotations:
                        f.write(annotation + "\n")

                zipf.write(annotation_path, arcname=annotation_filename)

        return send_file(
            zip_file_path,
            mimetype="application/zip",
            as_attachment=True,
            download_name=zip_filename,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            if temp_dir:
                for file in os.listdir(temp_dir):
                    file_path = os.path.join(temp_dir, file)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                os.rmdir(temp_dir)
        except Exception as e:
            print(f"Error cleaning up temporary directory: {e}")


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