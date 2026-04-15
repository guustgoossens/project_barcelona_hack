#!/bin/bash
set -e

echo "=== Installing deps ==="
pip install -q fastapi uvicorn nilearn

echo "=== Linking cache ==="
ln -sf /workspace/tribev2/cache /workspace/cache

echo "=== Starting server ==="
cd /workspace/project_barcelona_hack/gpu
exec python server.py
