FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Set working directory to backend for the app to run
WORKDIR /app/backend

# Expose the port
EXPOSE 8000

# Start the application using the main.py in the backend folder
# Using shell form to allow environment variable expansion ($PORT)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
