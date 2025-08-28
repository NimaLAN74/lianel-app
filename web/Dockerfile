# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile if present; choose ci or install accordingly (no noisy errors)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      echo "Using package-lock.json -> npm ci" && npm ci; \
    else \
      echo "No package-lock.json -> npm install" && npm install; \
    fi

COPY . .
RUN npm run build

# Runtime: serve with Vite preview (good enough behind TLS proxy)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 5173
CMD ["npm", "run", "preview"]