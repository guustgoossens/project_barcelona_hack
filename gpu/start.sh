#!/bin/bash
set -e

echo "=== Installing system deps ==="
apt-get update -qq && apt-get install -y -qq ffmpeg libsndfile1 > /dev/null

echo "=== Installing Python deps ==="
pip install -q fastapi uvicorn nilearn
cd /workspace/tribev2 && pip install -q -e .

echo "=== Linking cache ==="
ln -sf /workspace/tribev2/cache /workspace/cache

echo "=== Starting server ==="
cd /workspace/project_barcelona_hack/gpu
exec python server.py
