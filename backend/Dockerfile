# =============================================
# Backend Dockerfile - Agency CRM
# =============================================

# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

# Create the uploads directory
RUN mkdir -p uploads

# Expose the backend port
EXPOSE 5001

# Start the server
CMD ["node", "index.js"]
