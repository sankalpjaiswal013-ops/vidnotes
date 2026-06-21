from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/data")
def get_admin_data(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    videos = db.query(models.Video).all()
    
    return {
        "users": [{"id": u.id, "email": u.email, "is_active": u.is_active} for u in users],
        "videos": [{"id": v.id, "video_id": v.video_id, "title": v.title, "channel": v.channel} for v in videos]
    }
