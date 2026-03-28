# Step 1: Build the application
FROM node:20-slim AS build
WORKDIR /app

# Add a build argument for the API key (Vite needs this at build time)
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Step 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the config template
COPY nginx.conf /etc/nginx/conf.d/config.template

# Inject $PORT into the config and start Nginx
# Cloud Run provides $PORT, defaulting to 8080 if not set
ENV PORT=8080
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/config.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
