from sqlalchemy.orm import Session
from .. import models, schemas
import shutil
from fastapi import UploadFile
import os
import uuid

UPLOAD_DIR = "backend/uploads"

def create_attachment(db: Session, task_id: int, file: UploadFile):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_attachment = models.Attachment(
        task_id=task_id,
        file_name=file.filename,
        file_path=file_path
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment