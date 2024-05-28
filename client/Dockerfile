# Use an official node image as the base image
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Expose port 5173
EXPOSE 5173

# Start the application
CMD ["npm", "start"]
