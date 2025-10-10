from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud, models
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter()

@router.post("/api/tasks", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.tasks.create_task(db=db, task=task, creator_id=current_user.id)

@router.get("/api/tasks", response_model=List[schemas.Task])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.Role.manager:
        return crud.tasks.get_all_tasks(db, skip=skip, limit=limit)
    return crud.tasks.get_tasks_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/api/tasks/{task_id}", response_model=schemas.Task)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = crud.tasks.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != models.Role.manager and db_task.assignee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this task")

    return db_task

@router.put("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = crud.tasks.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != models.Role.manager and db_task.assignee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this task")

    return crud.tasks.update_task(db=db, task_id=task_id, task_update=task)

@router.delete("/api/tasks/{task_id}", response_model=schemas.Task)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = crud.tasks.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != models.Role.manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this task")

    return crud.tasks.delete_task(db=db, task_id=task_id)