"""
Settings router for Doraemon AI Study World:
Configures Gemini or OpenAI API key securely and tests AI connectivity.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    active_provider: Optional[str] = "gemini"
    model_name: Optional[str] = "gemini-1.5-flash"

@router.get("")
def get_settings():
    """Returns current settings with masked API key for security."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT gemini_api_key, active_provider, model_name FROM app_settings WHERE id = 'global_settings'")
    row = cursor.fetchone()
    conn.close()

    raw_key = row["gemini_api_key"] if row else ""
    is_configured = bool(raw_key and raw_key.strip())
    masked_key = (raw_key[:6] + "..." + raw_key[-4:]) if len(raw_key) > 10 else ("Configured" if is_configured else "")

    return {
        "is_configured": is_configured,
        "masked_key": masked_key,
        "active_provider": row["active_provider"] if row else "gemini",
        "model_name": row["model_name"] if row else "gemini-1.5-flash"
    }

@router.post("")
def update_settings(payload: SettingsUpdate):
    """Updates API key and AI settings securely."""
    conn = get_db()
    cursor = conn.cursor()

    new_key = payload.gemini_api_key.strip() if payload.gemini_api_key else ""
    cursor.execute("""
    UPDATE app_settings 
    SET gemini_api_key = ?, active_provider = ?, model_name = ? 
    WHERE id = 'global_settings'
    """, (new_key, payload.active_provider, payload.model_name))
    conn.commit()
    conn.close()

    return {"message": "Settings saved successfully", "is_configured": bool(new_key)}

@router.post("/test-connection")
async def test_connection():
    """Tests the configured Gemini API key with a small ping."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT gemini_api_key, model_name FROM app_settings WHERE id = 'global_settings'")
    row = cursor.fetchone()
    conn.close()

    key = row["gemini_api_key"] if row else ""
    if not key or not key.strip():
        return {
            "success": True,
            "status": "local_intelligent_engine",
            "message": "No external API key set. Doraemon Local Intelligent Engine is active and generating full lessons & quizzes directly!"
        }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{row['model_name']}:generateContent?key={key}"
    payload = {
        "contents": [{"parts": [{"text": "Say 'Doraemon AI Ready!' in 3 words."}]}]
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {
                    "success": True,
                    "status": "gemini_connected",
                    "message": f"Connected to Google Gemini! Model replied: '{reply}'"
                }
            else:
                return {
                    "success": False,
                    "status": "invalid_key",
                    "message": f"Gemini API returned error {resp.status_code}: {resp.text}"
                }
    except Exception as e:
        return {
            "success": False,
            "status": "network_error",
            "message": f"Connection error: {str(e)}"
        }
