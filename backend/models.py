from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, unique=True, index=True)
    title = Column(String)
    channel = Column(String)
    thumbnail = Column(String)
    duration = Column(String)
    article_json = Column(Text) # Store JSON as string
    flashcards_json = Column(Text)
    quiz_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
