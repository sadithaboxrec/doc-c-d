from fastapi import FastAPI

from app.database import Base, engine

#  routers and registration
from .routes.auth import router as auth_router
#  tasks registration
from .routes.tasks import router as task_router


app = FastAPI(title="Task Manager API")

@app.on_event("startup")
async def startup():
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
@app.get("/")
async def root():
    return {"message": "Task Manager API is running"}


#  auth registration
app.include_router(auth_router)

#  task registration
app.include_router(task_router)