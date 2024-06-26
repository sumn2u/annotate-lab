import cv2
import os

# Function to draw bounding boxes
def draw_bboxes(image_path, label_path, output_path):
    # Define colors for different classes
    colors = [(0, 0, 255), (0, 255, 0)]  # Example colors for two classes: green and red for unripe and riped

    # Read the image
    image = cv2.imread(image_path)
    height, width, _ = image.shape
    
    # Read the label file
    with open(label_path, 'r') as f:
        labels = f.readlines()
    
    for label in labels:
        label_data = label.strip().split()
        class_id = int(label_data[0])
        x_center, y_center, bbox_width, bbox_height = map(float, label_data[1:])
        
        # Convert normalized coordinates to pixel coordinates
        x_center *= width
        y_center *= height
        bbox_width *= width
        bbox_height *= height
        
        # Calculate top-left and bottom-right coordinates
        x1 = int(x_center - bbox_width / 2)
        y1 = int(y_center - bbox_height / 2)
        x2 = int(x_center + bbox_width / 2)
        y2 = int(y_center + bbox_height / 2)
        
        # Draw the bounding box with a color based on class ID
        color = colors[class_id]
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        cv2.putText(image, str(class_id), (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    # Save the output image
    cv2.imwrite(output_path, image)


# Paths to the image, label, and output
image_path = './tomato_example.jpeg'
label_path = './tomato_example.txt'
output_path = './output_tomato_example.jpg'

# Draw bounding boxes on the image
draw_bboxes(image_path, label_path, output_path)

print(f"Output image saved to {output_path}")
