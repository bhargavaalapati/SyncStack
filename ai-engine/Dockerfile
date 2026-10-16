# /ai-engine/Dockerfile
FROM python:3.11-slim
WORKDIR /app

# The context is ALREADY inside /ai-engine because of Render settings!
# So we just copy from the current directory (.)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the python code
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]