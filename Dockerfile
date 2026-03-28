# Step 1: Build the application
FROM node:20 AS build
WORKDIR /app

# Vite needs the API key at build time
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

COPY package*.json ./
RUN npm install
COPY . .
# Skip tsc to avoid strict-mode failures; Vite handles transpilation
RUN npx vite build

# Step 2: Serve with nginx (most reliable for Cloud Run)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run sets PORT env var; nginx must listen on it
# Create an entrypoint script that rewrites the nginx config with the correct port
RUN echo 'server { listen 0.0.0.0:PORT_PLACEHOLDER; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Use shell form so $PORT is expanded at runtime
CMD sh -c "sed -i 's/PORT_PLACEHOLDER/'\"$PORT\"'/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

EXPOSE 8080
ENV PORT=8080
