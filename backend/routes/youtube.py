from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
import os
import json
from datetime import datetime, timezone
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/youtube", tags=["youtube"])

# YouTube OAuth2 config
YOUTUBE_CLIENT_ID = "365361016451-46v0bvb1cmf0j2is8a3orp1tucipue5n.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET = "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"
REDIRECT_URI = os.environ.get("REACT_APP_BACKEND_URL", "https://subtitle-studio-1.preview.emergentagent.com") + "/api/youtube/callback"
FRONTEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://subtitle-studio-1.preview.emergentagent.com")

SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
]

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "legyenez")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def get_flow():
    """Create OAuth2 flow"""
    client_config = {
        "web": {
            "client_id": YOUTUBE_CLIENT_ID,
            "client_secret": YOUTUBE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [REDIRECT_URI]
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES)
    flow.redirect_uri = REDIRECT_URI
    return flow

@router.get("/auth")
async def youtube_auth(user_id: str):
    """Start YouTube OAuth2 flow"""
    flow = get_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        state=user_id  # Pass user_id in state
    )
    return {"auth_url": authorization_url}

@router.get("/callback")
async def youtube_callback(code: str = None, state: str = None, error: str = None):
    """Handle YouTube OAuth2 callback"""
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/analytics?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/analytics?error=no_code")
    
    try:
        flow = get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get channel info
        youtube = build('youtube', 'v3', credentials=credentials)
        channel_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        if not channel_response.get('items'):
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/analytics?error=no_channel")
        
        channel = channel_response['items'][0]
        channel_id = channel['id']
        
        # Store credentials in database
        user_id = state  # Get user_id from state
        await db.youtube_connections.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "channel_id": channel_id,
                    "channel_title": channel['snippet']['title'],
                    "channel_thumbnail": channel['snippet']['thumbnails']['default']['url'],
                    "subscriber_count": int(channel['statistics'].get('subscriberCount', 0)),
                    "video_count": int(channel['statistics'].get('videoCount', 0)),
                    "view_count": int(channel['statistics'].get('viewCount', 0)),
                    "credentials": {
                        "token": credentials.token,
                        "refresh_token": credentials.refresh_token,
                        "token_uri": credentials.token_uri,
                        "client_id": credentials.client_id,
                        "client_secret": credentials.client_secret,
                        "scopes": credentials.scopes
                    },
                    "connected_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/analytics?youtube=connected")
        
    except Exception as e:
        print(f"YouTube callback error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/dashboard/analytics?error=auth_failed")

@router.get("/status/{user_id}")
async def youtube_status(user_id: str):
    """Check if user has connected YouTube"""
    connection = await db.youtube_connections.find_one(
        {"user_id": user_id},
        {"_id": 0, "credentials": 0}  # Don't return sensitive data
    )
    if connection:
        return {"connected": True, "channel": connection}
    return {"connected": False}

@router.delete("/disconnect/{user_id}")
async def youtube_disconnect(user_id: str):
    """Disconnect YouTube account"""
    await db.youtube_connections.delete_one({"user_id": user_id})
    return {"success": True}

def get_youtube_credentials(connection: dict):
    """Recreate credentials object from stored data"""
    creds_data = connection['credentials']
    return Credentials(
        token=creds_data['token'],
        refresh_token=creds_data['refresh_token'],
        token_uri=creds_data['token_uri'],
        client_id=creds_data['client_id'],
        client_secret=creds_data['client_secret'],
        scopes=creds_data['scopes']
    )

@router.get("/videos/{user_id}")
async def get_youtube_videos(user_id: str, max_results: int = 50):
    """Get all videos from connected YouTube channel"""
    connection = await db.youtube_connections.find_one({"user_id": user_id})
    if not connection:
        raise HTTPException(status_code=404, detail="YouTube not connected")
    
    try:
        credentials = get_youtube_credentials(connection)
        youtube = build('youtube', 'v3', credentials=credentials)
        
        # Get channel's uploads playlist
        channel_response = youtube.channels().list(
            part='contentDetails',
            mine=True
        ).execute()
        
        uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
        
        # Get videos from uploads playlist
        videos = []
        next_page_token = None
        
        while len(videos) < max_results:
            playlist_response = youtube.playlistItems().list(
                part='snippet,contentDetails',
                playlistId=uploads_playlist_id,
                maxResults=min(50, max_results - len(videos)),
                pageToken=next_page_token
            ).execute()
            
            video_ids = [item['contentDetails']['videoId'] for item in playlist_response['items']]
            
            # Get video statistics
            if video_ids:
                videos_response = youtube.videos().list(
                    part='snippet,statistics,contentDetails',
                    id=','.join(video_ids)
                ).execute()
                
                for video in videos_response['items']:
                    # Parse duration to check if it's a Short (< 60 seconds)
                    duration = video['contentDetails']['duration']
                    is_short = parse_duration_seconds(duration) <= 60
                    
                    videos.append({
                        "video_id": video['id'],
                        "title": video['snippet']['title'],
                        "description": video['snippet']['description'][:500] if video['snippet']['description'] else "",
                        "thumbnail": video['snippet']['thumbnails'].get('high', {}).get('url', ''),
                        "published_at": video['snippet']['publishedAt'],
                        "duration": duration,
                        "is_short": is_short,
                        "view_count": int(video['statistics'].get('viewCount', 0)),
                        "like_count": int(video['statistics'].get('likeCount', 0)),
                        "comment_count": int(video['statistics'].get('commentCount', 0)),
                    })
            
            next_page_token = playlist_response.get('nextPageToken')
            if not next_page_token:
                break
        
        return {"videos": videos, "total": len(videos)}
        
    except Exception as e:
        print(f"Error fetching videos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def parse_duration_seconds(duration: str) -> int:
    """Parse ISO 8601 duration to seconds"""
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds

@router.get("/analytics/{user_id}/{video_id}")
async def get_video_analytics(user_id: str, video_id: str):
    """Get detailed analytics for a specific video"""
    connection = await db.youtube_connections.find_one({"user_id": user_id})
    if not connection:
        raise HTTPException(status_code=404, detail="YouTube not connected")
    
    try:
        credentials = get_youtube_credentials(connection)
        youtube_analytics = build('youtubeAnalytics', 'v2', credentials=credentials)
        
        # Get video analytics
        response = youtube_analytics.reports().query(
            ids='channel==MINE',
            startDate='2020-01-01',
            endDate=datetime.now().strftime('%Y-%m-%d'),
            metrics='views,likes,comments,averageViewDuration,averageViewPercentage,subscribersGained',
            dimensions='video',
            filters=f'video=={video_id}'
        ).execute()
        
        if response.get('rows'):
            row = response['rows'][0]
            return {
                "video_id": video_id,
                "views": row[1] if len(row) > 1 else 0,
                "likes": row[2] if len(row) > 2 else 0,
                "comments": row[3] if len(row) > 3 else 0,
                "avg_view_duration": row[4] if len(row) > 4 else 0,
                "avg_view_percentage": row[5] if len(row) > 5 else 0,  # This is retention!
                "subscribers_gained": row[6] if len(row) > 6 else 0
            }
        
        return {"video_id": video_id, "message": "No analytics data available yet"}
        
    except Exception as e:
        print(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/bulk/{user_id}")
async def get_bulk_analytics(user_id: str):
    """Get analytics for all videos at once"""
    connection = await db.youtube_connections.find_one({"user_id": user_id})
    if not connection:
        raise HTTPException(status_code=404, detail="YouTube not connected")
    
    try:
        credentials = get_youtube_credentials(connection)
        youtube_analytics = build('youtubeAnalytics', 'v2', credentials=credentials)
        
        # Get analytics for all videos
        response = youtube_analytics.reports().query(
            ids='channel==MINE',
            startDate='2020-01-01',
            endDate=datetime.now().strftime('%Y-%m-%d'),
            metrics='views,likes,comments,averageViewDuration,averageViewPercentage,subscribersGained',
            dimensions='video',
            maxResults=200,
            sort='-views'
        ).execute()
        
        videos_analytics = []
        if response.get('rows'):
            for row in response['rows']:
                videos_analytics.append({
                    "video_id": row[0],
                    "views": row[1] if len(row) > 1 else 0,
                    "likes": row[2] if len(row) > 2 else 0,
                    "comments": row[3] if len(row) > 3 else 0,
                    "avg_view_duration_seconds": row[4] if len(row) > 4 else 0,
                    "retention_percentage": row[5] if len(row) > 5 else 0,
                    "subscribers_gained": row[6] if len(row) > 6 else 0
                })
        
        return {"analytics": videos_analytics, "total": len(videos_analytics)}
        
    except Exception as e:
        print(f"Error fetching bulk analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/{user_id}")
async def sync_youtube_data(user_id: str):
    """Sync all YouTube data to local database"""
    connection = await db.youtube_connections.find_one({"user_id": user_id})
    if not connection:
        raise HTTPException(status_code=404, detail="YouTube not connected")
    
    try:
        # Get videos
        videos_response = await get_youtube_videos(user_id, max_results=100)
        videos = videos_response['videos']
        
        # Get analytics
        analytics_response = await get_bulk_analytics(user_id)
        analytics_map = {a['video_id']: a for a in analytics_response['analytics']}
        
        # Merge and store
        synced_videos = []
        for video in videos:
            video_analytics = analytics_map.get(video['video_id'], {})
            
            merged_data = {
                **video,
                "retention_percentage": video_analytics.get('retention_percentage', 0),
                "avg_view_duration_seconds": video_analytics.get('avg_view_duration_seconds', 0),
                "subscribers_gained": video_analytics.get('subscribers_gained', 0),
                "user_id": user_id,
                "synced_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Calculate swipe rate (for shorts: if they watched past 3 seconds)
            if video['is_short']:
                duration_seconds = parse_duration_seconds(video['duration'])
                if duration_seconds > 0:
                    # Swipe rate = retention at 3 seconds (approximated from avg retention)
                    # If avg retention is 70%, swipe rate is roughly similar for shorts
                    merged_data['swipe_rate'] = video_analytics.get('retention_percentage', 0)
            
            # Store in database
            await db.youtube_videos.update_one(
                {"video_id": video['video_id'], "user_id": user_id},
                {"$set": merged_data},
                upsert=True
            )
            
            synced_videos.append(merged_data)
        
        # Update connection last sync time
        await db.youtube_connections.update_one(
            {"user_id": user_id},
            {"$set": {"last_sync": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {
            "success": True,
            "synced_count": len(synced_videos),
            "videos": synced_videos
        }
        
    except Exception as e:
        print(f"Error syncing YouTube data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/synced-videos/{user_id}")
async def get_synced_videos(user_id: str, shorts_only: bool = False):
    """Get synced videos from local database"""
    query = {"user_id": user_id}
    if shorts_only:
        query["is_short"] = True
    
    cursor = db.youtube_videos.find(query, {"_id": 0}).sort("view_count", -1)
    videos = await cursor.to_list(length=200)
    
    return {"videos": videos, "total": len(videos)}
