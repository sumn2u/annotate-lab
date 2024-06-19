import os
from pathlib import Path
from shutil import copyfile
from urllib.parse import urlparse

images_folder = Path('./uploads').resolve()
categories_folder = Path('./uploads/categories')

def get_filename_from_url(url):
    # Parse the URL
    parsed_url = urlparse(url)
    
    # Extract the path
    path = parsed_url.path
    
    # Get the part after /uploads/
    filename = path.split('/uploads/')[-1]
    
    return filename


def create_categories_label(label):
    if not os.path.exists(categories_folder):
        os.makedirs(categories_folder)
        
    cat_lists = os.listdir(categories_folder)

    if label not in cat_lists:
        os.makedirs(categories_folder / label)

def create_categories(labels):
    if not os.path.exists(categories_folder):
        os.makedirs(categories_folder)
        
    cat_lists = os.listdir(categories_folder)
    for label in labels:
        if label not in cat_lists:
            os.makedirs(categories_folder / label)

def add_image_folder(label, image_name, image_src):
    image_src = get_filename_from_url(image_src)
    image_name = os.path.splitext(image_src)
    print(f"adding image {image_name} to category {label} with base name {image_src}")
    base_name = os.path.basename(image_src)
    try:
        if image_name not in os.listdir(categories_folder / label):
            print('copying file', images_folder / image_src, categories_folder / label / base_name)
            copyfile(images_folder / image_src, categories_folder / label / base_name)
    except FileNotFoundError:
        # Handle the FileNotFoundError by creating categories
        create_categories_label(label)
        copyfile(images_folder / image_src, categories_folder / label / base_name)

    except Exception as e:
        print('error in augmenting image ' + image_name + ' to category ' + label)  
        print('Error:', e)  
    return

def remove_image_folder(label, image_name):
    try: 
        if image_name in os.listdir(categories_folder / label):
            os.remove(categories_folder / label / image_name)
    except Exception as e:
        print('error in removing image ' + image_name + ' from category ' + label)
        print('Error:', e)    
    return