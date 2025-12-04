# Dockerfile for Angular Frontend
# Build stage
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build -- --configuration=production

# Production stage (Nginx)
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
