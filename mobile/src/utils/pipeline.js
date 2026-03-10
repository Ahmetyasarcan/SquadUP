// mobile/src/utils/pipeline.js
// ==============================
// Functional recommendation pipeline for the mobile app.
// 
// Demonstrates FUNCTION COMPOSITION using method chaining:
//   filter → map → filter → sort → slice
//
// Key FP principles shown here:
//   1. Declarative (WHAT, not HOW)
//   2. Pure functions (no mutations)
//   3. Immutability (new array at each step via spread)
//   4. Higher-order functions (filter, map take functions as args)

import { defaultScorer } from './scoring';

// ---------------------------------------------------------------------------
// Pipeline Stage 1 — filter: remove already-joined activities (pure)
// ---------------------------------------------------------------------------
const filterUnjoined = (joinedIds) => (activity) =>
  !joinedIds.includes(activity.id);

// ---------------------------------------------------------------------------
// Pipeline Stage 2 — map: enrich with score (creates NEW objects, no mutation)
// ---------------------------------------------------------------------------
const enrichWithScore = (user, scorer) => (activity) => ({
  ...activity,                              // spread = immutable copy
  match_result: scorer(user, activity),
  score: scorer(user, activity).final_score,
});

// ---------------------------------------------------------------------------
// Pipeline Stage 3 — filter: remove low-score activities (pure)
// ---------------------------------------------------------------------------
const filterByMinScore = (minScore) => (activity) =>
  activity.score >= minScore;

// ---------------------------------------------------------------------------
// Pipeline Stage 4 — sort comparator (pure — sorted() creates new array)
// ---------------------------------------------------------------------------
const byScoreDescending = (a, b) => b.score - a.score;

// ---------------------------------------------------------------------------
// Main Pipeline — the canonical recommendation flow
// This exact pattern is required in the project spec.
// ---------------------------------------------------------------------------
export const buildRecommendations = ({
  user,
  activities,
  joinedActivityIds = [],
  minScore = 0.3,
  topN = 10,
  scorer = defaultScorer,
}) => {
  /*
   * Functional pipeline: filter → map → filter → sort → slice
   * Each step returns a NEW array (immutable).
   * No loops, no mutations, fully declarative.
   */
  return activities
    .filter(filterUnjoined(joinedActivityIds))   // Stage 1: remove joined
    .map(enrichWithScore(user, scorer))           // Stage 2: add scores
    .filter(filterByMinScore(minScore))           // Stage 3: remove low scores
    .sort(byScoreDescending)                      // Stage 4: rank best first
    .slice(0, topN);                              // Stage 5: take top N
};

// ---------------------------------------------------------------------------
// Utility: compute stats from recommendation output (pure)
// ---------------------------------------------------------------------------
export const computeRecommendationStats = (recommendations) => {
  if (!recommendations.length) {
    return { count: 0, avgScore: 0, perfect: 0, good: 0 };
  }

  // Use reduce instead of a loop (functional style)
  const totals = recommendations.reduce(
    (acc, rec) => ({
      scoreSum: acc.scoreSum + rec.score,
      perfect:  acc.perfect  + (rec.match_result.label === 'perfect_match' ? 1 : 0),
      good:     acc.good     + (rec.match_result.label === 'good_match'    ? 1 : 0),
    }),
    { scoreSum: 0, perfect: 0, good: 0 }
  );

  return {
    count:    recommendations.length,
    avgScore: Math.round((totals.scoreSum / recommendations.length) * 100),
    perfect:  totals.perfect,
    good:     totals.good,
  };
};
