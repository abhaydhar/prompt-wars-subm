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
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config to handle React Router client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
