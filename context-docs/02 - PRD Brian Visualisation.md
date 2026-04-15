# PRD: Brain Activation Visualizer

## What
Web app that takes video/audio/text input, runs Meta TRIBE v2 inference, and renders predicted fMRI brain activation on a 3D cortical mesh in the browser.

## Why
[Latted shipped this](https://www.latted.com/brain) as a product feature. The entire stack is open-source (CC-BY-NC-4.0). No proprietary tech — just glue code and a good UI.

---

## Architecture

```
[User uploads media] → [Backend API] → [TRIBE v2 inference] → [Activation matrix]
                                                                       ↓
                              [Browser] ← [JSON (T × 20484)] ← [Response]
                                 ↓
                     [Three.js renders fsaverage5 mesh with vertex colors]
```

## Components

### 1. Backend (Python API)
- **Framework:** FastAPI
- **Model:** [`facebook/tribev2`](https://huggingface.co/facebook/tribev2) from HuggingFace (~1 GB weights)
- **Input:** Video (.mp4), audio (.wav/.mp3), or text file
- **Processing:**
  ```python
  from tribev2 import TribeModel
  model = TribeModel.from_pretrained("facebook/tribev2", cache_folder="./cache")
  df = model.get_events_dataframe(video_path="input.mp4")
  preds, segments = model.predict(events=df)
  # preds.shape = (n_timesteps, 20484)
  ```
- **Output:** JSON array of shape `(T, 20484)` — one activation value per vertex per second
- **Infra:** Needs GPU. Model is small — a single T4/A10 instance is fine.
- **Dependency:** [LLaMA 3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B) is gated on HuggingFace — accept Meta's license + set HF token.

### 2. Brain Mesh (one-time export)
- **Source:** fsaverage5 from FreeSurfer/nilearn — standard neuroscience template, 20,484 vertices
- **Extract:**
  ```python
  from nilearn.datasets import fetch_surf_fsaverage
  mesh = fetch_surf_fsaverage("fsaverage5")
  # mesh['pial_left'], mesh['pial_right'] → coords + faces
  ```
- **Convert:** Export to `.glb` via trimesh or pyvista. Ship as static asset.

### 3. Frontend (React + Three.js)
- Load `.glb` brain mesh as `BufferGeometry`
- Receive `(T, 20484)` activation matrix from API
- Per frame (1 fps): map activation values → color gradient (cool→warm) → set as vertex colors
- Controls: `OrbitControls` for rotation/zoom, timeline scrubber for timestep navigation
- Optional: auto-rotate, hemisphere toggle, region labels on hover

---

## Data Flow

| Step | What happens | Latency |
|------|-------------|---------|
| Upload | User sends media file to API | ~1s |
| Feature extraction | TRIBE v2 extracts features via LLaMA 3.2 + V-JEPA2 + Wav2Vec-BERT | ~5-15s |
| Prediction | Transformer maps features → 20,484 cortical vertices at 1 Hz | ~2-5s |
| Transfer | JSON response to browser | <1s |
| Render | Three.js paints vertex colors on mesh, user scrubs timeline | Real-time |

## Key Specs
- **Vertex count:** 20,484 (fsaverage5 surface)
- **Temporal resolution:** 1 prediction per second of input
- **Hemodynamic offset:** Predictions are shifted 5s back to compensate for BOLD signal lag
- **Model size:** ~1 GB checkpoint
- **License:** CC-BY-NC-4.0 (non-commercial use only)

## Dependencies
| Component | Tech |
|-----------|------|
| Model | [`tribev2`](https://github.com/facebookresearch/tribev2) (pip install from GitHub) |
| Text encoder | [LLaMA 3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B) (gated, HuggingFace) |
| Video encoder | [V-JEPA2](https://huggingface.co/facebook/vjepa2-vitg-fpc64-256) |
| Audio encoder | [Wav2Vec-BERT](https://huggingface.co/facebook/w2v-bert-2.0) |
| Brain mesh | [nilearn](https://nilearn.github.io/) / FreeSurfer fsaverage5 |
| Backend | FastAPI, Python 3.10+ |
| Frontend | React, [Three.js](https://threejs.org/) / React Three Fiber |
| GPU | 1× T4/A10 minimum |

## Scope Cuts (v1)
- No per-subject predictions (use average subject only)
- No subcortical voxels (cortical surface only)
- No real-time streaming — upload → process → view
- No region-of-interest analysis or ICA decomposition

## Risks
- **CC-BY-NC license** — cannot monetize directly without separate commercial agreement with Meta
- **LLaMA 3.2 gating** — requires HuggingFace license acceptance, may complicate deployment
- **GPU cost** — inference needs GPU but model is small, so cost is manageable (~$0.50/hr on cloud T4)

---

## References
| Resource | Link |
|----------|------|
| TRIBE v2 GitHub repo | https://github.com/facebookresearch/tribev2 |
| TRIBE v2 HuggingFace weights | https://huggingface.co/facebook/tribev2 |
| TRIBE v2 Colab demo notebook | https://colab.research.google.com/github/facebookresearch/tribev2/blob/main/tribe_demo.ipynb |
| Meta blog post (announcement) | https://ai.meta.com/blog/tribe-v2-brain-predictive-foundation-model/ |
| Meta research paper | https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/ |
| Meta interactive demo | https://aidemos.atmeta.com/tribev2/ |
| DataCamp tutorial (end-to-end walkthrough) | https://www.datacamp.com/tutorial/tribe-v2-tutorial |
| LLaMA 3.2-3B (gated text encoder) | https://huggingface.co/meta-llama/Llama-3.2-3B |
| V-JEPA2 (video encoder) | https://huggingface.co/facebook/vjepa2-vitg-fpc64-256 |
| Wav2Vec-BERT (audio encoder) | https://huggingface.co/facebook/w2v-bert-2.0 |
| three-brain-js (WebGL brain viewer) | https://github.com/dipterix/three-brain-js |
| BrainBrowser (WebGL brain viewer) | https://github.com/aces/brainbrowser |
| Latted /brain (reference implementation) | https://www.latted.com/brain |
