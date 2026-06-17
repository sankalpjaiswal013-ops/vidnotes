from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Video Processing Schemas ---
class VideoRequest(BaseModel):
    url: str
    language: Optional[str] = "english"
    level: Optional[str] = "detailed"

class Section(BaseModel):
    heading: str
    content: str

class Article(BaseModel):
    sections: List[Section]
    key_takeaways: List[str]

class Flashcard(BaseModel):
    front: str
    back: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class ProcessedContent(BaseModel):
    article: Article
    flashcards: List[Flashcard]
    quiz: List[QuizQuestion]

class VideoMetadata(BaseModel):
    title: str
    channel: str
    thumbnail: str
    duration: str

class FullVideoResponse(BaseModel):
    video_id: str
    metadata: VideoMetadata
    content: ProcessedContent
