FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install PM2 globally before switching user
RUN npm install pm2 -g && npm cache clean --force

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Bundle app source
COPY . .

# Create logs dir and set ownership
RUN mkdir -p /usr/src/app/logs && chown -R appuser:appgroup /usr/src/app

# Expose port
EXPOSE 5000

USER appuser

# Start command
CMD ["pm2-runtime", "ecosystem.config.js"]
