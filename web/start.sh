#!/bin/bash

# Manim Video Generator - Gradio Web UI Launch Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Manim Video Generator - Web UI"
echo "=========================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Set environment variables
export API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
export GRADIO_SERVER_NAME="${GRADIO_SERVER_NAME:-0.0.0.0}"
export GRADIO_SERVER_PORT="${GRADIO_SERVER_PORT:-7860}"

echo ""
echo "Configuration:"
echo "  API URL: $API_BASE_URL"
echo "  Server:  http://$GRADIO_SERVER_NAME:$GRADIO_SERVER_PORT"
echo ""

# Check if API is accessible
echo "Checking API connectivity..."
if curl -s --connect-timeout 5 "$API_BASE_URL/health" > /dev/null 2>&1; then
    echo "  API is accessible!"
else
    echo "  Warning: Cannot reach API at $API_BASE_URL"
    echo "  Make sure the Motia backend is running."
fi

echo ""
echo "Starting Gradio web interface..."
echo "=========================================="
echo ""

# Run the Gradio app
python3 app.py
