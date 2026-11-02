"""
Real AI Tutor router for Doraemon AI Study World.
Retrieval-Augmented Generation (RAG), strict slide/page citations,
and conversational tutoring.
"""
import uuid
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_db
from ..processors.rag_service import answer_tutor_query

router = APIRouter(prefix="/api/tutor", tags=["tutor"])

class TutorChatRequest(BaseModel):
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    message: str

@router.post("/chat")
async def chat_with_tutor(payload: TutorChatRequest):
    """
    RAG-grounded AI Tutor endpoint.
    Retrieves relevant slide/page chunks, formats grounded citations,
    and returns verified answers.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Fetch settings
    cursor.execute("SELECT gemini_api_key, model_name FROM app_settings WHERE id = 'global_settings'")
    settings_row = cursor.fetchone()
    api_key = settings_row["gemini_api_key"] if settings_row else ""
    model_name = settings_row["model_name"] if settings_row else "gemini-1.5-flash"

    # Save user message
    msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
    INSERT INTO tutor_chats (id, course_id, topic_id, role, content)
    VALUES (?, ?, ?, 'user', ?)
    """, (msg_id, payload.course_id, payload.topic_id, payload.message))
    conn.commit()

    # Answer query via RAG service
    rag_result = await answer_tutor_query(
        course_id=payload.course_id,
        topic_id=payload.topic_id,
        user_query=payload.message,
        api_key=api_key,
        model_name=model_name
    )

    # Save tutor response
    bot_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
    INSERT INTO tutor_chats (id, course_id, topic_id, role, content, citations_json, grounded_sources_json)
    VALUES (?, ?, ?, 'tutor', ?, ?, ?)
    """, (
        bot_msg_id, 
        payload.course_id, 
        payload.topic_id, 
        rag_result["answer"], 
        json.dumps(rag_result["citations"]), 
        json.dumps(rag_result["source_snippets"])
    ))
    conn.commit()
    conn.close()

    return {
        "reply": rag_result["answer"],
        "citations": rag_result["citations"],
        "grounded_in_materials": rag_result["grounded_in_materials"],
        "source_snippets": rag_result["source_snippets"]
    }

@router.get("/history")
def get_chat_history(course_id: Optional[str] = None, topic_id: Optional[str] = None):
    """Retrieves previous chat messages for this course/topic."""
    conn = get_db()
    cursor = conn.cursor()

    sql = "SELECT * FROM tutor_chats"
    params = []
    clauses = []
    if course_id:
        clauses.append("course_id = ?")
        params.append(course_id)
    if topic_id:
        clauses.append("topic_id = ?")
        params.append(topic_id)
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)

    sql += " ORDER BY created_at ASC LIMIT 40"
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "id": r["id"],
            "role": r["role"],
            "content": r["content"],
            "citations": json.loads(r["citations_json"] or "[]"),
            "source_snippets": json.loads(r["grounded_sources_json"] or "[]"),
            "created_at": r["created_at"]
        })
    return history
