import os
from prisma import Prisma
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env") # Points to the .env in the backend root

db = Prisma(
    datasource={
        'url': os.getenv("DATABASE_URL")
    }
)

async def connect_db():
    if not db.is_connected():
        await db.connect()

async def disconnect_db():
    if db.is_connected():
        await db.disconnect()