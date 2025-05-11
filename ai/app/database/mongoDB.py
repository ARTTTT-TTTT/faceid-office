from pymongo.mongo_client import MongoClient
from app.constants.settings import settings

client = MongoClient(settings.MONGO_DB_URI)

db = client[settings.MONGO_DB_NAME]

users_collection = db[settings.MONGO_DB_USERS_COLLECTION]
user_logs_collection = db[settings.MONGO_DB_USER_LOGS_COLLECTION]
