from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..security import get_current_user


router = APIRouter(prefix="/tasks", tags=["Tasks"])


#  create task

@router.post("/", response_model=TaskResponse)
async def create_task(
    data: TaskCreate,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    task = Task(
        title=data.title,
        description=data.description,
        user_id=user_id
    )

    db.add(task)

    await db.commit()
    await db.refresh(task)

    return task


#  get users tasks

@router.get("/", response_model=list[TaskResponse])
async def get_tasks(
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task)
        .where(Task.user_id == user_id)    #means users only see their own tasks
        .order_by(Task.created_at.desc())
    )

    return result.scalars().all()



#  get one task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )


        # A user cannot simply change:  /tasks/10      and access another user's task.
    )

    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task



#  update tasks

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
    )

    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if data.title is not None:
        task.title = data.title

    if data.description is not None:
        task.description = data.description

    if data.completed is not None:
        task.completed = data.completed

    await db.commit()
    await db.refresh(task)

    return task



#  delete tasks

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
    )

    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    await db.delete(task)
    await db.commit()

    return {"message": "Task deleted successfully"}