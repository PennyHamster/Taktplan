from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud, models
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter()

@router.post("/api/tasks/{task_id}/attachments", response_model=schemas.Attachment, status_code=status.HTTP_201_CREATED)
def create_attachment_for_task(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = crud.tasks.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != models.Role.manager and db_task.assignee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add attachments to this task")

    # Security checks for file uploads
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and PDF are allowed.")

    # 2MB size limit
    if file.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the limit of 2MB.")

    return crud.attachments.create_attachment(db=db, task_id=task_id, file=file)