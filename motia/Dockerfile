# Motia Manim Video Generator - Production Dockerfile
# Uses Ubuntu base for better Manim compatibility

# Stage 1: Build the Motia application
FROM node:20-bookworm-slim AS builder

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

# Stage 2: Production image with Node.js + Manim
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MPLBACKEND=Agg
ENV XDG_RUNTIME_DIR=/tmp/runtime-motia
ENV DISPLAY=:99
ENV NODE_ENV=production

# Install system dependencies including Node.js and Manim requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Node.js
    curl \
    ca-certificates \
    gnupg \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    # Build tools
    build-essential \
    pkg-config \
    # Manim dependencies
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    libopenblas-dev \
    gfortran \
    ffmpeg \
    xvfb \
    # LaTeX for mathematical rendering
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    texlive-latex-extra \
    cm-super \
    dvipng \
    dvisvgm \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment and install Manim
RUN python3 -m venv /opt/manim-venv
ENV PATH="/opt/manim-venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir manim==0.18.0 numpy scipy pillow

# Install Motia CLI globally
RUN npm install -g motia@latest

# Create app directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/public/videos /app/tmp /app/.motia

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/motia.config.ts ./

# Set permissions
RUN chmod -R 755 /app/public/videos /app/tmp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start Xvfb for headless rendering and Motia
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset & motia start"]
