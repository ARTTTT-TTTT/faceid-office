import redis
from app.constants.app_config import settings

try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0, decode_responses=True
    )

    if redis_client.ping():
        print("🚀 Connected to Redis")
except redis.ConnectionError as e:
    print(f"❌ Redis connection error: {e}")
