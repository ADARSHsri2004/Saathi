import os
# Force import from the local generated client we will set up in step 4
try:
    from prisma_client import Prisma
except ImportError:
    from prisma import Prisma

from dotenv import load_dotenv

load_dotenv()

db = Prisma(
    datasource={
        'url': os.getenv("DATABASE_URL")
    }
)

async def connect_db():
    if not db.is_connected():
        try:
            # Add a 10-second timeout. If it fails, the app still lives 
            # so we can see the real error in the logs.
            await db.connect(timeout=10)
            print("✅ Database connected successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            # Do not raise the error here; let FastAPI start so Render 
            # doesn't kill the process for a port timeout.

async def disconnect_db():
    if db.is_connected():
        await db.disconnect()