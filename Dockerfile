FROM node:16-alpine

WORKDIR /app

# Install required dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Copy package files
COPY package*.json ./

# Install dependencies (including postinstall patches)
RUN npm install

# Copy application files
COPY . .

# Create data directory for persistence
RUN mkdir -p /var/data/meshcentral

# Expose ports
EXPOSE 80 443 4433 4443

# Set environment
ENV NODE_ENV=production
ENV MESHCENTRAL_DATA_PATH=/var/data/meshcentral

# Start MeshCentral
CMD ["node", "node_modules/meshcentral/meshcentral.js"]
