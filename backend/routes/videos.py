from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Optional
import logging
from pathlib import Path
import asyncio

from models import Video, VideoGenerateRequest
from routes.auth import get_current_user
from services.video_service import VideoGenerationService
from database import db

logger = logging.getLogger(__name__)
router = APIRouter()

video_service = VideoGenerationService()

# Store for background tasks (in-memory for now, use Redis in production)
background_video_tasks = {}

@router.post("/generate")
async def generate_video(
    request: VideoGenerateRequest,
    current_user = Depends(get_current_user)
):
    """
    Generate video from script.
    Process: Script → TTS (ElevenLabs) → B-roll (Pexels) → FFmpeg Assembly → MP4
    
    Uses asyncio.create_task() for TRUE background execution.
    Returns immediately while video generates in background.
    """
    try:
        # Get script
        script = await db.scripts.find_one(
            {"id": request.script_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")
        
        # Create video record
        video = Video(
            user_id=current_user["id"],
            script_id=request.script_id,
            status="queued"
        )
        
        video_dict = video.model_dump()
        video_dict['created_at'] = video_dict['created_at'].isoformat()
        
        await db.videos.insert_one(video_dict)
        
        # Create TRUE background task using asyncio (non-blocking)
        task = asyncio.create_task(
            video_service.generate_video(
                video_id=video.id,
                script_text=script["script"],
                topic=script["topic"],
                user_id=current_user["id"],
                voice_settings=request.voice_settings,
                background_music=request.background_music,
                b_roll_search=request.b_roll_search
            )
        )
        
        # Store task reference (prevents garbage collection)
        background_video_tasks[video.id] = task
        
        # Clean up completed tasks
        def cleanup_task(video_id):
            if video_id in background_video_tasks:
                del background_video_tasks[video_id]
        
        task.add_done_callback(lambda t: cleanup_task(video.id))
        
        logger.info(f"🚀 Started TRUE background video generation {video.id} for script {request.script_id}")
        
        # Return IMMEDIATELY - video generates in background
        return {
            "id": video.id,
            "status": "queued",
            "message": "Video generation started in background"
        }
    
    except Exception as e:
        logger.error(f"Error queuing video generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[dict])
async def get_videos(current_user = Depends(get_current_user), limit: int = 50):
    """
    Get user's generated videos.
    """
    videos = await db.videos.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return videos

@router.get("/{video_id}")
async def get_video(video_id: str, current_user = Depends(get_current_user)):
    """
    Get video status and details.
    """
    video = await db.videos.find_one(
        {"id": video_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return video

@router.get("/{video_id}/download")
async def download_video(video_id: str, current_user = Depends(get_current_user)):
    """
    Download completed video file.
    """
    video = await db.videos.find_one(
        {"id": video_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Video is not ready yet")
    
    video_path = Path(video.get("video_url"))
    
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=f"legyenez_{video_id[:8]}.mp4"
    )