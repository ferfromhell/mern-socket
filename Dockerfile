FROM node:alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3456
CMD node server.js