FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Use PM2 runtime for production cluster mode
RUN npm install pm2 -g

# Start command
CMD ["pm2-runtime", "ecosystem.config.js"]
