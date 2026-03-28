# Step 1: Build the application
FROM node:20-slim AS build
WORKDIR /app

# Vite needs the API key at build time
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve static files using 'serve' (no nginx, no config complexity)
# 'serve' natively reads the $PORT env variable set by Cloud Run
FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l $PORT"]
