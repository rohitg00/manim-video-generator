# Motia Manim Video Generator - Production Dockerfile
# Multi-stage build for optimal image size

# Stage 1: Build the Motia application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY motia.config.ts ./

# Build the application
RUN npm run build

# Stage 2: Production image with Manim
FROM motiadev/motia:latest AS base

# Switch to root for system package installation
USER root

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV MPLBACKEND=Agg
ENV XDG_RUNTIME_DIR=/tmp/runtime-motia
ENV DISPLAY=:99
ENV NODE_ENV=production

# Install Manim dependencies (Python, LaTeX, FFmpeg, Cairo)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    libopenblas-dev \
    gfortran \
    ffmpeg \
    xvfb \
    sox \
    libsox-fmt-all \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    cm-super \
    dvipng \
    tipa \
    texlive-xetex \
    texlive-extra-utils \
    texlive-plain-generic \
    dvisvgm \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment and install Manim
RUN python3 -m venv /opt/manim-venv
ENV PATH="/opt/manim-venv/bin:$PATH"
RUN pip install --no-cache-dir manim==0.17.3 numpy scipy pillow

# Create app directory and necessary subdirectories
WORKDIR /app
RUN mkdir -p /app/public/videos \
    && mkdir -p /app/tmp \
    && mkdir -p /app/.motia

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/motia.config.ts ./

# Set permissions
RUN chmod -R 755 /app/public/videos \
    && chmod -R 755 /app/tmp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start Xvfb for headless rendering and Motia
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset & motia start"]
