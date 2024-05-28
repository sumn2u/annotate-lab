# Use an official Python image as the base image
FROM python:3.9

# Set the working directory to /app
WORKDIR /app

# Copy the requirements.txt file
COPY requirements.txt ./

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the Flask application
CMD ["flask", "run", "--host=0.0.0.0"]
