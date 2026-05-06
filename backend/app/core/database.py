from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]
    # Verify connection
    await db.command('ping')
    print("[OK] Connected to MongoDB")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("[OK] Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase | None:
    return db
