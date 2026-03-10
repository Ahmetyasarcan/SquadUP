// mobile/src/utils/scoring.js
// ============================
// Pure scoring functions — mirrored from backend/scoring.py.
// Running the same logic client-side demonstrates FP portability.
//
// These functions are PURE:
//   - Same input → same output (deterministic)
//   - No side effects (no I/O, no state changes)
//   - All inputs explicit (no hidden globals)

// Category-to-interest mapping (immutable constant — never mutated)
const CATEGORY_INTEREST_MAP = Object.freeze({
  sports:      ['futbol', 'basketbol', 'voleybol', 'tenis', 'yüzme', 'koşu', 'fitness'],
  esports:     ['valorant', 'lol', 'cs2', 'dota2', 'fifa', 'gaming'],
  board_games: ['satranç', 'risk', 'catan', 'uno', 'monopoly', 'kutu oyunu'],
  outdoor:     ['doğa yürüyüşü', 'kamp', 'bisiklet', 'tırmanma', 'açık hava'],
});

// ---------------------------------------------------------------------------
// Pure Function 1: Interest Score
// ---------------------------------------------------------------------------
export const calculateInterestScore = (userInterests = [], activityCategory = '') => {
  const categoryPool = CATEGORY_INTEREST_MAP[activityCategory] || [];
  if (categoryPool.length === 0 || userInterests.length === 0) return 0;

  // Set intersection using filter (purely functional, no loops)
  const matched = userInterests.filter(interest => categoryPool.includes(interest));
  return Math.min(matched.length / categoryPool.length, 1.0);
};

// ---------------------------------------------------------------------------
// Pure Function 2: Competition Similarity
// ---------------------------------------------------------------------------
export const calculateCompetitionSimilarity = (userLevel = 3, activityLevel = 3) => {
  // Clamp to [1, 5]
  const cUser = Math.max(1, Math.min(5, userLevel));
  const cActivity = Math.max(1, Math.min(5, activityLevel));
  return 1.0 - Math.abs(cUser - cActivity) / 4.0;
};

// ---------------------------------------------------------------------------
// Pure Function 3: Reliability Score
// ---------------------------------------------------------------------------
export const calculateReliabilityScore = (attendedEvents = 0, joinedEvents = 0) => {
  if (joinedEvents <= 0) return 0.5; // Neutral for new users
  return Math.max(0, Math.min(1, attendedEvents / joinedEvents));
};

// ---------------------------------------------------------------------------
// Pure Function 4: Weighted Match Score
// ---------------------------------------------------------------------------
export const calculateMatchScore = (interestScore, competitionSimilarity, reliabilityScore, weights) => {
  const score =
    weights.interest    * interestScore +
    weights.competition * competitionSimilarity +
    weights.reliability * reliabilityScore;
  return Math.round(Math.max(0, Math.min(1, score)) * 10000) / 10000;
};

// ---------------------------------------------------------------------------
// Higher-Order Function: createMatchScorer
// Returns a configured scorer closure — same HOF pattern as Python backend
// ---------------------------------------------------------------------------
export const createMatchScorer = (weights = null) => {
  // Default weights (immutable object via Object.freeze)
  const resolvedWeights = Object.freeze(weights || {
    interest:    0.5,
    competition: 0.3,
    reliability: 0.2,
  });

  const totalWeight = Object.values(resolvedWeights).reduce((acc, w) => acc + w, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    throw new Error(`Weights must sum to 1.0, got ${totalWeight}`);
  }

  // The returned closure captures resolvedWeights (HOF pattern)
  return (user, activity) => {
    const iScore = calculateInterestScore(user.interests || [], activity.category || '');
    const cScore = calculateCompetitionSimilarity(user.competition_level, activity.competition_level);
    const rScore = calculateReliabilityScore(user.attended_events, user.joined_events);
    const final  = calculateMatchScore(iScore, cScore, rScore, resolvedWeights);

    // Determine match label
    const label  = final >= 0.8 ? 'perfect_match' : final >= 0.5 ? 'good_match' : 'low_match';

    return {
      final_score: final,
      label,
      breakdown: {
        interest:    { score: iScore, weight: resolvedWeights.interest,    contribution: resolvedWeights.interest    * iScore },
        competition: { score: cScore, weight: resolvedWeights.competition, contribution: resolvedWeights.competition * cScore },
        reliability: { score: rScore, weight: resolvedWeights.reliability, contribution: resolvedWeights.reliability * rScore },
      },
    };
  };
};

// Default scorer instance (default weights)
export const defaultScorer = createMatchScorer();
