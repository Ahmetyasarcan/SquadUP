"""
scoring.py - Pure Scoring Functions for SquadUp
================================================
All functions in this module are PURE:
  - Same input always returns same output (deterministic)
  - No side effects (no I/O, no state mutation, no global changes)
  - No hidden dependencies (all inputs are explicit parameters)

This demonstrates Functional Programming (FP) principles for the academic project.
"""

from typing import List, Dict, Callable

# ---------------------------------------------------------------------------
# Category-to-interest mapping (pure data, never mutated)
# Keys: English category codes stored in DB
# Values: Turkish interest tags that users can select
# ---------------------------------------------------------------------------
CATEGORY_INTEREST_MAP: Dict[str, List[str]] = {
    "sports": ["futbol", "basketbol", "voleybol", "tenis", "yüzme", "koşu", "fitness"],
    "esports": ["valorant", "lol", "cs2", "dota2", "fifa", "gaming"],
    "board_games": ["satranç", "risk", "catan", "uno", "monopoly", "kutu oyunu"],
    "outdoor": ["doğa yürüyüşü", "kamp", "bisiklet", "tırmanma", "açık hava"],
}


# ---------------------------------------------------------------------------
# Pure Function 1: Interest Score
# Calculates overlap between user interests and the activity category.
# ---------------------------------------------------------------------------
def calculate_interest_score(user_interests: List[str], activity_category: str) -> float:
    """
    Pure function: computes how well user interests align with an activity category.

    Args:
        user_interests: List of interest tags (e.g., ['futbol', 'valorant'])
        activity_category: English category key (e.g., 'sports')

    Returns:
        float in [0.0, 1.0] — 1.0 means perfect interest match
    """
    # Guard: unknown category → no match
    category_interests = CATEGORY_INTEREST_MAP.get(activity_category, [])
    if not category_interests:
        return 0.0

    # Guard: user has no interests → no match
    if not user_interests:
        return 0.0

    # Intersection of user interests with the category's interest pool
    matched = set(user_interests) & set(category_interests)
    # Normalize: matched / total possible for this category (capped at 1.0)
    score = len(matched) / len(category_interests)
    return min(score, 1.0)


# ---------------------------------------------------------------------------
# Pure Function 2: Competition Similarity
# Measures how close the user's skill level is to the activity's required level.
# ---------------------------------------------------------------------------
def calculate_competition_similarity(user_level: int, activity_level: int) -> float:
    """
    Pure function: computes similarity between user and activity competition levels.

    Formula: 1 - |userLevel - activityLevel| / 4
    Scale: both levels are integers in range [1, 5], so max diff is 4.

    Args:
        user_level: User's self-reported skill level (1-5)
        activity_level: Activity's required skill level (1-5)

    Returns:
        float in [0.0, 1.0] — 1.0 means identical skill level
    """
    # Clamp values to valid range [1, 5]
    clamped_user = max(1, min(5, user_level))
    clamped_activity = max(1, min(5, activity_level))

    difference = abs(clamped_user - clamped_activity)
    return 1.0 - (difference / 4.0)


# ---------------------------------------------------------------------------
# Pure Function 3: Reliability Score
# Measures how often a user actually attends events they join.
# ---------------------------------------------------------------------------
def calculate_reliability_score(attended_events: int, joined_events: int) -> float:
    """
    Pure function: computes user reliability from attendance history.

    Formula: attended_events / joined_events
    A reliable user attends every event they join → score = 1.0

    Args:
        attended_events: How many events the user actually attended
        joined_events: How many events the user signed up for

    Returns:
        float in [0.0, 1.0] — higher means more reliable
    """
    # Guard: no history → neutral reliability (0.5 to avoid penalizing new users)
    if joined_events <= 0:
        return 0.5

    score = attended_events / joined_events
    # Clamp to [0.0, 1.0] (attended cannot exceed joined, but defensive coding)
    return max(0.0, min(1.0, score))


# ---------------------------------------------------------------------------
# Pure Function 4: Weighted Match Score (core composition)
# ---------------------------------------------------------------------------
def calculate_match_score(
    interest_score: float,
    competition_similarity: float,
    reliability_score: float,
    weights: Dict[str, float],
) -> float:
    """
    Pure function: combines three sub-scores into a single match score.

    Formula: w1*interestScore + w2*competitionSimilarity + w3*reliabilityScore

    Args:
        interest_score: Result of calculate_interest_score()
        competition_similarity: Result of calculate_competition_similarity()
        reliability_score: Result of calculate_reliability_score()
        weights: Dict with keys 'interest', 'competition', 'reliability'

    Returns:
        float in [0.0, 1.0] — overall match score
    """
    score = (
        weights["interest"] * interest_score
        + weights["competition"] * competition_similarity
        + weights["reliability"] * reliability_score
    )
    return round(max(0.0, min(1.0, score)), 4)


# ---------------------------------------------------------------------------
# Pure Function 5: Score Explanation Generator
# Produces a human-readable breakdown of a match score.
# ---------------------------------------------------------------------------
def explain_match_score(
    interest_score: float,
    competition_similarity: float,
    reliability_score: float,
    final_score: float,
    weights: Dict[str, float],
) -> Dict[str, object]:
    """
    Pure function: generates an explanation dict for a match score.
    Used by the API to return structured score breakdowns.

    Returns:
        Dict containing score components and a label string.
    """
    # Determine match label based on final score
    if final_score >= 0.8:
        label = "perfect_match"
    elif final_score >= 0.5:
        label = "good_match"
    else:
        label = "low_match"

    return {
        "final_score": final_score,
        "label": label,
        "breakdown": {
            "interest": {
                "score": round(interest_score, 4),
                "weight": weights["interest"],
                "contribution": round(weights["interest"] * interest_score, 4),
            },
            "competition": {
                "score": round(competition_similarity, 4),
                "weight": weights["competition"],
                "contribution": round(weights["competition"] * competition_similarity, 4),
            },
            "reliability": {
                "score": round(reliability_score, 4),
                "weight": weights["reliability"],
                "contribution": round(weights["reliability"] * reliability_score, 4),
            },
        },
    }


# ---------------------------------------------------------------------------
# Higher-Order Function: create_match_scorer
# Returns a configured scoring function — demonstrates HOF pattern.
# ---------------------------------------------------------------------------
def create_match_scorer(weights: Dict[str, float] = None) -> Callable:
    """
    Higher-Order Function: factory that returns a configured match scorer.

    This is a key FP concept: functions as first-class values.
    The returned function is a closure that "remembers" the weights.

    Args:
        weights: Optional custom weight dict. Defaults to {interest:0.5, competition:0.3, reliability:0.2}

    Returns:
        A pure function: (user: dict, activity: dict) -> dict
    """
    # Default weights (immutable default via None pattern)
    resolved_weights = weights or {
        "interest": 0.5,
        "competition": 0.3,
        "reliability": 0.2,
    }

    # Validate weights sum to ~1.0 (allow float imprecision)
    total = sum(resolved_weights.values())
    if not (0.99 <= total <= 1.01):
        raise ValueError(f"Weights must sum to 1.0, got {total}")

    # The closure: captures resolved_weights, takes user + activity dicts
    def score_match(user: Dict, activity: Dict) -> Dict:
        """
        Pure scoring closure. Computes full match score for a user-activity pair.

        Args:
            user: Dict with keys: interests (list), competition_level (int),
                  attended_events (int), joined_events (int)
            activity: Dict with keys: category (str), competition_level (int)

        Returns:
            Dict with final_score, label, and breakdown
        """
        # Compute each sub-score using pure functions
        i_score = calculate_interest_score(
            user.get("interests", []),
            activity.get("category", ""),
        )
        c_score = calculate_competition_similarity(
            user.get("competition_level", 3),
            activity.get("competition_level", 3),
        )
        r_score = calculate_reliability_score(
            user.get("attended_events", 0),
            user.get("joined_events", 0),
        )

        # Combine into final weighted score
        final = calculate_match_score(i_score, c_score, r_score, resolved_weights)

        # Return full explanation
        return explain_match_score(i_score, c_score, r_score, final, resolved_weights)

    return score_match


# ---------------------------------------------------------------------------
# Default scorer instance (used throughout the app)
# ---------------------------------------------------------------------------
DEFAULT_SCORER = create_match_scorer()
