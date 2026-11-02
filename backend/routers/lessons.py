"""
Lessons router for Doraemon AI Study World.
Serves full rich lessons including Hinglish, Indian examples, Mermaid flowcharts,
formulas, and marks topic completion.
"""
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..database import get_db
from ..processors.gamification import record_lesson_completion

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

class CompleteLessonRequest(BaseModel):
    course_id: str

@router.get("/{topic_id}")
def get_lesson_by_topic(topic_id: str):
    """Returns the full lesson content for a given topic."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT l.*, t.title as topic_title, t.importance, c.title as course_title, c.file_type
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    JOIN courses c ON l.course_id = c.id
    WHERE l.topic_id = ?
    """, (topic_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Lesson not found for this topic")

    unit_label = "Slide" if row["file_type"] == "pptx" else "Page"

    return {
        "id": row["id"],
        "topic_id": row["topic_id"],
        "course_id": row["course_id"],
        "course_title": row["course_title"],
        "title": row["title"],
        "importance": row["importance"],
        "unit_label": unit_label,
        "source_pages": json.loads(row["source_pages_json"] or "[]"),
        "simple_definition": row["simple_definition"],
        "easy_english": row["easy_english"],
        "hinglish": row["hinglish"],
        "step_by_step": json.loads(row["step_by_step_json"] or "[]"),
        "key_points": json.loads(row["key_points_json"] or "[]"),
        "real_life_examples": json.loads(row["real_life_examples_json"] or "[]"),
        "indian_examples": json.loads(row["indian_examples_json"] or "[]"),
        "terminology": json.loads(row["terminology_json"] or "[]"),
        "formulas": json.loads(row["formulas_json"] or "[]"),
        "diagram": json.loads(row["diagrams_json"] or "{}"),
        "comparisons": json.loads(row["comparisons_json"] or "{}"),
        "exam_notes": row["exam_notes"],
        "short_questions": json.loads(row["short_questions_json"] or "[]"),
        "long_questions": json.loads(row["long_questions_json"] or "[]"),
        "revision_summary": row["revision_summary"],
        "simplified_mode": json.loads(row["simplified_mode_json"] or "{}"),
        "is_completed": bool(row["is_completed"])
    }

@router.post("/{topic_id}/complete")
def complete_lesson(topic_id: str, payload: CompleteLessonRequest):
    """Marks lesson completed, awards XP, and checks for badge unlocking."""
    result = record_lesson_completion(topic_id, payload.course_id)
    return result
