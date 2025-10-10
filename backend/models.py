from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class Role(str, enum.Enum):
    manager = "manager"
    employee = "employee"

class Status(str, enum.Enum):
    in_progress = "in_progress"
    done = "done"
    later = "later"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(Role), nullable=False)

    created_tasks = relationship("Task", back_populates="creator", foreign_keys="[Task.creator_id]")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="[Task.assignee_id]")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String)
    priority = Column(Integer, nullable=False)
    status = Column(SQLAlchemyEnum(Status), nullable=False)

    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    creator = relationship("User", back_populates="created_tasks", foreign_keys=[creator_id])
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assignee_id])
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    task = relationship("Task", back_populates="attachments")