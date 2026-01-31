FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

WORKDIR /app/backend

# Expose port
EXPOSE $PORT

# Start gunicorn
CMD gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2
