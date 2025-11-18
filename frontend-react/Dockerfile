FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Utiliser .env.docker pour la configuration Docker (port 8080)
RUN cp .env.docker .env || true

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
