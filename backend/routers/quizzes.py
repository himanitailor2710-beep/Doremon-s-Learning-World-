"""
Quizzes router for Doraemon AI Study World.
Serves topic quizzes, evaluates student submissions, awards XP,
and tracks weak topics.
"""
import json
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..database import get_db
from ..processors.gamification import record_quiz_submission

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

class QuizSubmission(BaseModel):
    course_id: str
    topic_id: str
    answers: List[int]

@router.get("/{topic_id}")
def get_quiz_for_topic(topic_id: str):
    """Retrieves practice quiz questions for a topic."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT q.id, q.topic_id, q.course_id, q.title, q.questions_json, t.title as topic_title
    FROM quizzes q
    JOIN topics t ON q.topic_id = t.id
    WHERE q.topic_id = ?
    """, (topic_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Quiz not found for this topic")

    questions = json.loads(row["questions_json"] or "[]")

    # Hide correct_index and explanation for taking the quiz,
    # or return them for frontend interactive grading
    return {
        "id": row["id"],
        "topic_id": row["topic_id"],
        "course_id": row["course_id"],
        "title": row["title"],
        "topic_title": row["topic_title"],
        "questions": questions
    }

@router.post("/{quiz_id}/submit")
def submit_quiz_answers(quiz_id: str, payload: QuizSubmission):
    """Submits answers, grades quiz, updates XP, streaks, and weak-topic tracking."""
    result = record_quiz_submission(
        quiz_id=quiz_id,
        topic_id=payload.topic_id,
        course_id=payload.course_id,
        answers=payload.answers
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
