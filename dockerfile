# Use the official Node.js 14 image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

ENV HOST 0.0.0.0

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "start"]