from flask import request
from functools import wraps
import time

RATE_LIMITS = {}
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60

# Simple in-memory rate limiter for demonstration

def rate_limit(endpoint_name):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr
            key = f"{endpoint_name}:{ip}"
            now = time.time()
            attempts = RATE_LIMITS.get(key, [])
            # Remove expired attempts
            attempts = [t for t in attempts if now - t < WINDOW_SECONDS]
            if len(attempts) >= MAX_ATTEMPTS:
                return {"error": "Too many requests. Please try again later."}, 429
            attempts.append(now)
            RATE_LIMITS[key] = attempts
            return func(*args, **kwargs)
        return wrapper
    return decorator
