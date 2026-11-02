"""
Gadgets router for Doraemon AI Study World:
- Anywhere Door (Rapid Topic Navigator & Global Index)
- Memory Bread (Flashcard Deck & Revision Cheat Sheets)
- Time Machine (Timed Exam Simulator & Mock Tests)
"""
from typing import Optional
from fastapi import APIRouter, Query
from ..gadgets.gadget_service import (
    get_anywhere_door_directory, 
    get_memory_bread_cards, 
    generate_time_machine_mock_exam
)

router = APIRouter(prefix="/api/gadgets", tags=["gadgets"])

@router.get("/anywhere-door")
def anywhere_door(q: str = Query("", description="Search term for topics or courses")):
    """Anywhere Door: returns directory of all topics across courses for instant teleportation."""
    return get_anywhere_door_directory(q)

@router.get("/memory-bread")
def memory_bread(
    course_id: Optional[str] = Query(None),
    topic_id: Optional[str] = Query(None)
):
    """Memory Bread: returns interactive flashcard deck for instant revision."""
    return get_memory_bread_cards(course_id, topic_id)

@router.get("/time-machine/exam")
def time_machine_exam(
    course_id: str = Query(..., description="Course ID to generate mock exam for"),
    duration_minutes: int = Query(15, description="Exam duration in minutes")
):
    """Time Machine: generates a timed practice mock examination."""
    return generate_time_machine_mock_exam(course_id, duration_minutes)
