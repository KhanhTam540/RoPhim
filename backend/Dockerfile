FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directories
RUN mkdir -p uploads/avatars uploads/posters uploads/videos

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]