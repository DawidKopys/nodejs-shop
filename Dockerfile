FROM node:16.20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080
EXPOSE 27017
CMD [ "node", "app.js" ]
