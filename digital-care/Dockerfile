FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts
COPY . .
RUN mkdir -p /app/storage/prescriptions
EXPOSE 8787
CMD ["node", "server.js"]
