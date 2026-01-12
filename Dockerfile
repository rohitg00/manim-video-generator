# Motia Manim Video Generator - Production Dockerfile
# Simplified for local testing and production deployment

# Stage 1: Build the Motia application
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY tsconfig.json ./

# Install motia globally and dependencies
RUN npm install -g motia@latest && \
    npm ci --omit=dev

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY motia.config.ts ./

# Build the application
RUN npm run build

# Stage 2: Production image - Use Python base and add Node.js
FROM python:3.11-slim-bookworm

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MPLBACKEND=Agg
ENV XDG_RUNTIME_DIR=/tmp/runtime-motia
ENV DISPLAY=:99
ENV NODE_ENV=production
ENV PORT=3000
ENV USE_REDIS=false

# Install Node.js 20.x
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install build tools and Manim dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    libopenblas-dev \
    gfortran \
    ffmpeg \
    xvfb && \
    rm -rf /var/lib/apt/lists/*

# Install LaTeX packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    cm-super \
    dvipng \
    dvisvgm && \
    rm -rf /var/lib/apt/lists/*

# Install Manim via pip
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir manim==0.18.0 numpy scipy pillow

# Install Motia CLI globally
RUN npm install -g motia@latest

# Create app user
RUN useradd -m -u 1000 node && \
    mkdir -p /app && \
    chown -R node:node /app

WORKDIR /app

# Switch to non-root user
USER node

# Copy built application from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/motia.config.ts ./

# Create necessary directories
RUN mkdir -p /app/public/videos /app/tmp /app/.motia && \
    chmod -R 755 /app/public /app/tmp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start Xvfb and Motia
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset & npm run start"]
