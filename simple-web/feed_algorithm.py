from datetime import datetime, timedelta
import math

# Mock representation of Twitter's Recommendation Algorithm concepts
# Inspired by open source 'the-algorithm' Heavy Ranker

def compute_recency_score(created_at: datetime) -> float:
    """
    Time decay function: newer posts get exponentially higher scores.
    Half-life of roughly 6 hours.
    """
    age_seconds = (datetime.utcnow() - created_at).total_seconds()
    half_life_seconds = 6 * 3600
    if age_seconds < 0:
        age_seconds = 0
    decay = math.pow(0.5, age_seconds / half_life_seconds)
    return decay

def compute_engagement_score(likes: int) -> float:
    """
    Logarithmic engagement score.
    """
    return math.log1p(likes)

def compute_related_score(post, current_user_id: str) -> float:
    """
    Calculates a 'Related' score based on:
    - Recency (Recent is better)
    - Engagement (Likes)
    - Affinity (Mock social proof: posts by same user get slight boost, or some mock graph distance)
    """
    recency = compute_recency_score(post.created_at)
    engagement = compute_engagement_score(post.likes)
    
    reply_count = getattr(post, 'reply_count', 0)
    views = getattr(post, 'views', 0)
    
    # New formula: (likes * 2) + (replies * 1.5) + (views * 0.1)
    # Then factored by recency
    raw_popularity = (post.likes * 2) + (reply_count * 1.5) + (views * 0.1)
    adjusted_engagement = math.log1p(raw_popularity)
    
    # Mock user-graph affinity
    affinity = 1.0
    if post.author_id == current_user_id:
        affinity = 1.2
        
    score = (adjusted_engagement * 0.4) + (recency * 0.6) * affinity
    return score

def sort_feed(posts, feed_type: str, timeframe: str = "alltime", current_user_id: str = None):
    # Filter by timeframe for popular
    if feed_type == "popular" and timeframe != "alltime":
        now = datetime.utcnow()
        if timeframe == "day":
            start_date = now - timedelta(days=1)
        elif timeframe == "week":
            start_date = now - timedelta(weeks=1)
        elif timeframe == "month":
            start_date = now - timedelta(days=30)
        elif timeframe == "year":
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=3650) # 10 years
            
        posts = [p for p in posts if p.created_at >= start_date]

    # Sort based on feed_type
    if feed_type == "latest":
        posts.sort(key=lambda x: x.created_at, reverse=False)
    elif feed_type == "popular":
        # Popular using the new combined metrics: likes*2 + replies*1.5 + views*0.1
        posts.sort(key=lambda x: (x.likes * 2) + (getattr(x, 'reply_count', 0) * 1.5) + (getattr(x, 'views', 0) * 0.1), reverse=True)
    elif feed_type == "related":
        # Related uses the 'the-algorithm' inspired scoring
        posts.sort(key=lambda x: compute_related_score(x, current_user_id), reverse=True)
    else:
        # Default latest
        posts.sort(key=lambda x: x.created_at, reverse=False)
        
    return posts
