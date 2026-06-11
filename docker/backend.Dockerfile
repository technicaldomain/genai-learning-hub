# Stage 1: Build wheels and collect dependencies
FROM python:3.14-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project
COPY apps/backend/pyproject.toml apps/backend/uv.lock* ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix="/install" -e .

# Stage 2: Production
FROM python:3.14-slim AS production

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy installed dependencies from builder
COPY --from=builder /install /install

# Set Python path for installed packages
ENV PATH=/install/bin:$PATH \
    PYTHONPATH=/install/lib/python3.14/site-packages

# Copy application code
COPY apps/backend/app ./app

# Set permissions
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
