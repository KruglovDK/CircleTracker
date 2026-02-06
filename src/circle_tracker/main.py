from contextlib import asynccontextmanager

from fastapi import FastAPI

from circle_tracker.auth.router import router as auth_router
from circle_tracker.database import db
from circle_tracker.users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    await db.init_pool()
    yield
    await db.close_pool()

app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(users_router)

@app.get("/health")
async def health_check():
    return {"status": "OK"}
