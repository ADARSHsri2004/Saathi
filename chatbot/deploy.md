



# build command

pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma

# start command

uvicorn main:app --host 0.0.0.0 --port $PORT