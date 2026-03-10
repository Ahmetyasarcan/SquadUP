"""
recommendations.py - Functional Recommendation Pipeline for SquadUp
====================================================================
This module demonstrates FUNCTIONAL COMPOSITION:
  - Each step is a pure transformation
  - Pipeline: filter → map → filter → sort
  - No loops (uses Python's functional tools: filter, map, sorted)
  - No mutations (creates new lists at each step)

Key FP concepts demonstrated:
  1. Pure functions (no side effects)
  2. Function composition (chaining transformations)
  3. Declarative style (what to do, not how)
  4. Immutability (new list at each pipeline stage)
"""

from typing import List, Dict, Callable, Optional
from functools import reduce
from scoring import create_match_scorer, DEFAULT_SCORER


# ---------------------------------------------------------------------------
# Pipeline Stage 1: Filter — remove activities the user already joined
# ---------------------------------------------------------------------------
def filter_unjoined_activities(
    activities: List[Dict], joined_activity_ids: List[str]
) -> List[Dict]:
    """
    Pure function: filters out activities the user has already joined.

    Args:
        activities: All available activities (list of dicts, not mutated)
        joined_activity_ids: IDs of activities the user already joined

    Returns:
        New list containing only activities the user hasn't joined yet
    """
    # Convert to set for O(1) lookup — pure operation (no mutation)
    joined_set = set(joined_activity_ids)
    # filter() is a lazy functional iterator; list() materializes it
    return list(filter(lambda a: a["id"] not in joined_set, activities))


# ---------------------------------------------------------------------------
# Pipeline Stage 2: Map — enrich each activity with a match score
# ---------------------------------------------------------------------------
def map_activities_with_scores(
    activities: List[Dict],
    user: Dict,
    scorer: Callable = DEFAULT_SCORER,
) -> List[Dict]:
    """
    Pure function: enriches each activity dict with a computed match score.

    Uses map() — declarative, no loops. Creates new dicts (immutable pattern).

    Args:
        activities: Activities to score (not mutated)
        user: User profile dict
        scorer: Scoring function returned by create_match_scorer()

    Returns:
        New list of activity dicts, each with added 'match_result' field
    """
    def enrich_activity(activity: Dict) -> Dict:
        """Pure inner function: returns a NEW dict with score data added."""
        match_result = scorer(user, activity)
        # Spread operator equivalent: create new dict, never mutate original
        return {**activity, "match_result": match_result, "score": match_result["final_score"]}

    return list(map(enrich_activity, activities))


# ---------------------------------------------------------------------------
# Pipeline Stage 3: Filter — remove low-scoring activities
# ---------------------------------------------------------------------------
def filter_by_minimum_score(
    scored_activities: List[Dict], min_score: float = 0.3
) -> List[Dict]:
    """
    Pure function: removes activities below the minimum match threshold.

    Args:
        scored_activities: Activities with 'score' field (output of stage 2)
        min_score: Minimum acceptable score (default 0.3)

    Returns:
        New list with only activities meeting the score threshold
    """
    return list(filter(lambda a: a["score"] >= min_score, scored_activities))


# ---------------------------------------------------------------------------
# Pipeline Stage 4: Sort — rank by score descending
# ---------------------------------------------------------------------------
def sort_by_score_descending(scored_activities: List[Dict]) -> List[Dict]:
    """
    Pure function: sorts activities by match score, highest first.

    sorted() returns a NEW list — original is not mutated (immutable pattern).

    Args:
        scored_activities: Activities with 'score' field

    Returns:
        New sorted list (descending by score)
    """
    return sorted(scored_activities, key=lambda a: a["score"], reverse=True)


# ---------------------------------------------------------------------------
# Pipeline Stage 5: Limit — take top N results
# ---------------------------------------------------------------------------
def take_top_n(activities: List[Dict], n: int = 10) -> List[Dict]:
    """
    Pure function: returns the first N items (slice creates a new list).

    Args:
        activities: Sorted activity list
        n: Maximum number of results to return

    Returns:
        New list with at most n activities
    """
    return activities[:n]


# ---------------------------------------------------------------------------
# Composed Pipeline: Full Recommendation Flow
# filter → map → filter → sort → slice
# ---------------------------------------------------------------------------
def build_recommendations(
    user: Dict,
    activities: List[Dict],
    joined_activity_ids: Optional[List[str]] = None,
    min_score: float = 0.3,
    top_n: int = 10,
    scorer: Callable = DEFAULT_SCORER,
) -> List[Dict]:
    """
    Main recommendation pipeline — composes all pure stages in sequence.

    This is the primary entry point for generating recommendations.
    Demonstrates FUNCTION COMPOSITION: each stage's output feeds the next.

    Pipeline:
        all_activities
        → [filter] remove already-joined
        → [map]    attach match scores
        → [filter] remove low scores
        → [sort]   rank best first
        → [slice]  take top N

    Args:
        user: User profile dict
        activities: All available activities
        joined_activity_ids: IDs the user has already joined (default: empty)
        min_score: Minimum score threshold (default: 0.3)
        top_n: Maximum recommendations to return (default: 10)
        scorer: Configured scoring function (default: DEFAULT_SCORER)

    Returns:
        List of scored and ranked activity dicts
    """
    ids_to_exclude = joined_activity_ids or []

    # Stage 1 — Pure filter: remove joined activities
    available = filter_unjoined_activities(activities, ids_to_exclude)

    # Stage 2 — Pure map: enrich with scores
    scored = map_activities_with_scores(available, user, scorer)

    # Stage 3 — Pure filter: remove low scores
    qualified = filter_by_minimum_score(scored, min_score)

    # Stage 4 — Pure sort: rank descending
    ranked = sort_by_score_descending(qualified)

    # Stage 5 — Pure slice: limit results
    top = take_top_n(ranked, top_n)

    return top


# ---------------------------------------------------------------------------
# Alternative: Pipeline using functools.reduce (demonstrating FP composition)
# ---------------------------------------------------------------------------
def build_recommendations_with_reduce(
    user: Dict,
    activities: List[Dict],
    joined_activity_ids: Optional[List[str]] = None,
    min_score: float = 0.3,
    top_n: int = 10,
    scorer: Callable = DEFAULT_SCORER,
) -> List[Dict]:
    """
    Alternative pipeline using reduce() to compose transformations.

    Demonstrates how reduce() can chain a list of transformations.
    Each 'step' is a tuple of (function, args).

    This is more advanced FP — used for academic demonstration.
    """
    ids_to_exclude = joined_activity_ids or []

    # Define the pipeline as a list of (transform_fn, extra_args) pairs
    pipeline_steps = [
        (filter_unjoined_activities, (ids_to_exclude,)),
        (map_activities_with_scores, (user, scorer)),
        (filter_by_minimum_score, (min_score,)),
        (sort_by_score_descending, ()),
        (lambda acts, n=top_n: take_top_n(acts, n), ()),
    ]

    # reduce() applies each transformation in sequence
    result = reduce(
        lambda current_list, step: step[0](current_list, *step[1]),
        pipeline_steps,
        activities,
    )

    return result


# ---------------------------------------------------------------------------
# Utility: compute stats for a batch of recommendations (pure)
# ---------------------------------------------------------------------------
def compute_recommendation_stats(recommendations: List[Dict]) -> Dict:
    """
    Pure function: computes summary statistics for a recommendation batch.

    Args:
        recommendations: Output of build_recommendations()

    Returns:
        Dict with count, average score, perfect/good/low match counts
    """
    if not recommendations:
        return {"count": 0, "avg_score": 0.0, "perfect": 0, "good": 0, "low": 0}

    scores = [r["score"] for r in recommendations]
    labels = [r["match_result"]["label"] for r in recommendations]

    return {
        "count": len(recommendations),
        "avg_score": round(sum(scores) / len(scores), 4),
        "perfect": labels.count("perfect_match"),
        "good": labels.count("good_match"),
        "low": labels.count("low_match"),
    }
