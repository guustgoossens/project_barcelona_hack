# NeuralReach inference service, built for NVIDIA B200 (Blackwell, sm_100).
#
# Notes from the validated Northflank setup:
# - Stock torch wheels do not support Blackwell; we install the PyTorch
#   nightly cu130 build, which exposes sm_100.
# - TRIBE v2 text preprocessing needs spaCy's en_core_web_lg model.
# - LLaMA 3.2-3B is gated — set HF_TOKEN in the runtime env.
# - Mount a persistent volume at /app/cache so TRIBE / LLaMA / V-JEPA2 /
#   W2V-BERT weights survive pod restarts (~5 GB first download).

FROM nvidia/cuda:13.0.0-cudnn-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TRIBE_CACHE=/app/cache \
    TRIBE_DEVICE=cuda \
    HF_HOME=/app/cache/hf

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3.11 python3.11-venv python3-pip \
      git ffmpeg libsndfile1 ca-certificates \
      && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 \
 && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

WORKDIR /app
COPY pyproject.toml ./

# Step 1: install app deps (everything except torch). tribev2 pulls its own
# requirements; any transient torch it installs gets overwritten in step 2.
RUN python -m pip install --upgrade pip \
 && python -m pip install -e .

# Step 2: replace torch with the Blackwell-capable nightly cu130 build.
RUN python -m pip uninstall -y torch torchvision torchaudio \
 && python -m pip install --pre \
      torch torchvision torchaudio \
      --index-url https://download.pytorch.org/whl/nightly/cu130

# Step 3: spaCy English large model (text preprocessing).
RUN python -m spacy download en_core_web_lg

COPY app ./app

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
