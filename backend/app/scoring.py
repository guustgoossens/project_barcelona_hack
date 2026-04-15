"""Reduce (T, 20484) activation matrix to ROI time-series for curiosity /
social cognition / threat.

We use the Destrieux atlas on fsaverage5 (available via nilearn) and group
parcels into three coarse regions. Values are z-scored across vertices per
timestep so the scores are comparable across inputs.
"""
from __future__ import annotations

from functools import lru_cache

import numpy as np

# Destrieux parcel names used for each target construct.
# Sources: broad consensus neuroanatomy — we keep it conservative, not clinical.
CURIOSITY_PARCELS = [
    "G_front_middle",          # lateral PFC / curiosity & novelty
    "G_front_inf-Triangul",    # IFG — language-driven salience
    "S_intrapariet_and_P_trans",
    "G_and_S_cingul-Ant",      # anterior cingulate — info-seeking
]
SOCIAL_PARCELS = [
    "G_temporal_middle",       # TPJ area
    "G_pariet_inf-Angular",    # angular gyrus / ToM
    "G_front_sup",             # dorsomedial PFC
    "S_temporal_sup",
]
THREAT_PARCELS = [
    "G_insular_short",         # anterior insula
    "S_circular_insula_ant",
    "G_front_inf-Opercular",   # inferior frontal — conflict / avoidance
    "G_and_S_cingul-Mid-Ant",
]


@lru_cache(maxsize=1)
def _label_lookup() -> dict[str, np.ndarray]:
    """Returns {parcel_name: boolean mask of length 20484}."""
    from nilearn import datasets, surface

    atlas = datasets.fetch_atlas_surf_destrieux()
    lh = np.asarray(atlas["map_left"])
    rh = np.asarray(atlas["map_right"])
    labels = [l.decode() if isinstance(l, bytes) else l for l in atlas["labels"]]
    combined = np.concatenate([lh, rh])  # 20484 total
    assert combined.shape[0] == 20484, combined.shape
    out: dict[str, np.ndarray] = {}
    for idx, name in enumerate(labels):
        out[name] = combined == idx
    return out


def _region_mean(activations: np.ndarray, parcels: list[str]) -> np.ndarray:
    lookup = _label_lookup()
    masks = [lookup[p] for p in parcels if p in lookup]
    if not masks:
        return np.zeros(activations.shape[0], dtype=np.float32)
    mask = np.logical_or.reduce(masks)
    return activations[:, mask].mean(axis=1).astype(np.float32)


def derive_scores(activations: np.ndarray) -> dict:
    """Normalize per-vertex, then compute ROI time-series + aggregates."""
    a = activations.astype(np.float32)
    # Per-timestep z-score across vertices.
    mean = a.mean(axis=1, keepdims=True)
    std = a.std(axis=1, keepdims=True) + 1e-6
    z = (a - mean) / std

    curiosity = _region_mean(z, CURIOSITY_PARCELS)
    social = _region_mean(z, SOCIAL_PARCELS)
    threat = _region_mean(z, THREAT_PARCELS)

    valence = float(curiosity.mean() - threat.mean())
    aggregate = float(curiosity.mean() + social.mean() - threat.mean())

    return {
        "curiosity": curiosity.tolist(),
        "social": social.tolist(),
        "threat": threat.tolist(),
        "valence": valence,
        "aggregate": aggregate,
    }
