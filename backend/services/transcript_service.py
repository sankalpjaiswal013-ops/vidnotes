from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import re
import urllib.parse
from fastapi import HTTPException

def extract_video_id(url: str) -> str:
    """Extracts the YouTube video ID from various URL formats."""
    parsed_url = urllib.parse.urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            p = urllib.parse.parse_qs(parsed_url.query)
            return p['v'][0]
        if parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
        if parsed_url.path.startswith('/v/'):
            return parsed_url.path.split('/')[2]
        if parsed_url.path.startswith('/shorts/'):
            return parsed_url.path.split('/')[2]
    raise ValueError("Invalid YouTube URL")

def get_transcript(video_id: str) -> str:
    """Fetches the transcript using youtube-transcript-api."""
    try:
        # Fetch transcript, trying English first, then others using the new API format
        youtube_api = YouTubeTranscriptApi()
        transcript = youtube_api.fetch(video_id, languages=['en', 'en-US', 'en-GB', 'hi', 'es', 'fr', 'de'])
        
        formatter = TextFormatter()
        text_formatted = formatter.format_transcript(transcript)
        return text_formatted
    except Exception as e:
        print(f"Transcript Error: {e}")
        error_msg = str(e).lower()
        if "disabled" in error_msg or "no transcripts" in error_msg or "could not retrieve a transcript" in error_msg:
            raise HTTPException(status_code=400, detail="This specific YouTube video has captions completely disabled. Please try a different video (like a TED Talk or tutorial) that has subtitles enabled!")
        raise HTTPException(status_code=400, detail=f"Could not retrieve captions: {str(e)}")
