# STAR+ Model Server - Dockerfile
# Build: docker build -t star-plus-model-server .
# Run: docker run -p 8001:8001 -v /path/to/STAR_PLUS_AI/models:/app/models star-plus-model-server

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ASTRO_SPACE_MODEL_DIR=/app/models \
    PORT=8001

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first for better caching
COPY scripts/requirements_model_server.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy model server code
COPY scripts/model_server.py .

# Create models directory (will be mounted at runtime)
RUN mkdir -p /app/models

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run the server
CMD ["python", "model_server.py"]