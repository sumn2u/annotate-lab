FROM node:18-alpine AS builder

WORKDIR /app

ENV VITE_SERVER_URL=http://127.0.0.1:5001

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
