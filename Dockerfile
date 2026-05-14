FROM node:22-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Build React app
RUN cd client && npm run build

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
