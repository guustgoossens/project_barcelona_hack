"""Export fsaverage5 cortical mesh as a single GLB with 20,484 vertices.

Run once. Writes to assets/fsaverage5.glb and assets/mesh_meta.json.

    pip install nilearn trimesh numpy
    python scripts/export_mesh.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import trimesh
from nilearn import datasets, surface

OUT_DIR = Path(__file__).resolve().parent.parent / "assets"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def main() -> None:
    fs = datasets.fetch_surf_fsaverage("fsaverage5")

    lh_coords, lh_faces = surface.load_surf_mesh(fs["pial_left"])
    rh_coords, rh_faces = surface.load_surf_mesh(fs["pial_right"])

    lh_n = lh_coords.shape[0]
    rh_n = rh_coords.shape[0]
    assert lh_n + rh_n == 20484, (lh_n, rh_n)

    coords = np.concatenate([lh_coords, rh_coords], axis=0).astype(np.float32)
    faces = np.concatenate(
        [lh_faces, rh_faces + lh_n],  # offset rh indices
        axis=0,
    ).astype(np.int32)

    # Neutral vertex color; frontend rewrites per timestep.
    colors = np.tile(np.array([180, 180, 200, 255], dtype=np.uint8), (coords.shape[0], 1))

    mesh = trimesh.Trimesh(
        vertices=coords,
        faces=faces,
        vertex_colors=colors,
        process=False,  # preserve vertex order; TRIBE output is indexed by it
    )
    glb_path = OUT_DIR / "fsaverage5.glb"
    mesh.export(glb_path)

    meta = {
        "vertex_count": int(coords.shape[0]),
        "lh_vertex_count": int(lh_n),
        "rh_vertex_count": int(rh_n),
        "hemisphere_split_index": int(lh_n),
        "bounding_box": {
            "min": coords.min(axis=0).tolist(),
            "max": coords.max(axis=0).tolist(),
        },
        "fps": 1,
        "hemodynamic_offset_s": 5,
    }
    (OUT_DIR / "mesh_meta.json").write_text(json.dumps(meta, indent=2))
    print(f"wrote {glb_path} ({coords.shape[0]} verts, {faces.shape[0]} faces)")


if __name__ == "__main__":
    main()
