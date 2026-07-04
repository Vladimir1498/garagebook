FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:8000

COPY package.json ./
RUN npm install

COPY . .
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
