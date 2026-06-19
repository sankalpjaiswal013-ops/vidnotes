from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routers.auth import get_current_user
from database import get_db
import models
import schemas
import json
import urllib.request
from services.transcript_service import extract_video_id, get_transcript
from services.ai_service import generate_notes

router = APIRouter(prefix="/api/process", tags=["process"])

def get_video_metadata(url: str):
    try:
        oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
        with urllib.request.urlopen(oembed_url) as response:
            data = json.loads(response.read().decode())
            return {
                "title": data.get("title", "Unknown Title"),
                "channel": data.get("author_name", "Unknown Channel"),
                "thumbnail": data.get("thumbnail_url", ""),
                "duration": "Unknown" 
            }
    except Exception as e:
        print(f"oEmbed error: {e}")
        return {
            "title": "YouTube Video",
            "channel": "Unknown",
            "thumbnail": "",
            "duration": "Unknown"
        }

@router.post("", response_model=schemas.FullVideoResponse)
def process_video(request: schemas.VideoRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        video_id = extract_video_id(request.url)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # Check cache
    cached_video = db.query(models.Video).filter(models.Video.video_id == video_id).first()
    if cached_video:
        return schemas.FullVideoResponse(
            video_id=cached_video.video_id,
            metadata=schemas.VideoMetadata(
                title=cached_video.title,
                channel=cached_video.channel,
                thumbnail=cached_video.thumbnail,
                duration=cached_video.duration
            ),
            content=schemas.ProcessedContent(
                article=json.loads(cached_video.article_json),
                flashcards=json.loads(cached_video.flashcards_json),
                quiz=json.loads(cached_video.quiz_json)
            )
        )

    # 1. Get metadata
    metadata = get_video_metadata(request.url)

    # 2. Get Transcript
    transcript_text = get_transcript(video_id)

    # 3. Process with AI
    ai_result = generate_notes(transcript_text)

    # 4. Save to Database
    new_video = models.Video(
        video_id=video_id,
        title=metadata["title"],
        channel=metadata["channel"],
        thumbnail=metadata["thumbnail"],
        duration=metadata["duration"],
        article_json=json.dumps(ai_result["article"]),
        flashcards_json=json.dumps(ai_result["flashcards"]),
        quiz_json=json.dumps(ai_result["quiz"])
    )
    db.add(new_video)
    db.commit()

    return schemas.FullVideoResponse(
        video_id=video_id,
        metadata=schemas.VideoMetadata(**metadata),
        content=schemas.ProcessedContent(**ai_result)
    )

@router.get("/{video_id}", response_model=schemas.FullVideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cached_video = db.query(models.Video).filter(models.Video.video_id == video_id).first()
    if not cached_video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    return schemas.FullVideoResponse(
        video_id=cached_video.video_id,
        metadata=schemas.VideoMetadata(
            title=cached_video.title,
            channel=cached_video.channel,
            thumbnail=cached_video.thumbnail,
            duration=cached_video.duration
        ),
        content=schemas.ProcessedContent(
            article=json.loads(cached_video.article_json),
            flashcards=json.loads(cached_video.flashcards_json),
            quiz=json.loads(cached_video.quiz_json)
        )
    )
