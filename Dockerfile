# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript source code
RUN npm run build

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "dist/main"]