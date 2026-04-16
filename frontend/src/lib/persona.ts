// Big Five (OCEAN) → brain score persona weighting.
// Smoothly interpolates weights based on trait intensity.

export type Ocean = {
  o: number; // Openness
  c: number; // Conscientiousness
  e: number; // Extraversion
  a: number; // Agreeableness
  n: number; // Neuroticism
};

export type BrainScores = {
  attention: number;
  curiosity: number;
  trust: number;
  motivation: number;
  resistance: number;
  overall: number;
};

// Smooth weight: trait=0.3 → weight=1.0 (no effect), trait=0.8 → max multiplier.
function traitWeight(trait: number, maxMultiplier: number): number {
  const t = Math.max(0, Math.min(1, (trait - 0.3) / 0.5));
  return 1 + (maxMultiplier - 1) * t;
}

/**
 * Apply Big Five persona weights to raw TRIBE v2 brain scores.
 *
 * High Openness     → Curiosity ×2.0
 * High Conscientiousness → Attention ×1.5
 * High Extraversion → Motivation ×2.0
 * High Agreeableness → Trust ×1.5
 * High Neuroticism  → Resistance ×3.0 (penalty amplifier)
 */
export function applyPersonaWeights(
  base: BrainScores,
  ocean: Ocean,
): BrainScores {
  const attention = base.attention * traitWeight(ocean.c, 1.5);
  const curiosity = base.curiosity * traitWeight(ocean.o, 2.0);
  const trust = base.trust * traitWeight(ocean.a, 1.5);
  const motivation = base.motivation * traitWeight(ocean.e, 2.0);
  const resistance = base.resistance * traitWeight(ocean.n, 3.0);
  const overall = attention + curiosity + trust + motivation - resistance;

  return { attention, curiosity, trust, motivation, resistance, overall };
}
