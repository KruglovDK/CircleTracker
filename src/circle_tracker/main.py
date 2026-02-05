from contextlib import asynccontextmanager

from fastapi import FastAPI

from circle_tracker.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    await db.init_pool()
    yield
    await db.close_pool()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "OK"}
