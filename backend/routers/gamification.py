"""
Gamification router for Doraemon AI Study World:
XP points, study streak, level progression, badges, student profiles, and weak-topic tracking.
"""
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from ..processors.gamification import (
    get_user_gamification_profile,
    get_student_profiles,
    create_or_switch_student_profile,
    update_student_profile_name
)

router = APIRouter(prefix="/api/gamification", tags=["gamification"])

class ProfileCreateRequest(BaseModel):
    name: str

class ProfileUpdateRequest(BaseModel):
    name: str

@router.get("/profile")
def get_profile(student_id: Optional[str] = None):
    """Retrieves full gamification profile, XP stats, streak, badges, and weak topics."""
    return get_user_gamification_profile(student_id)

@router.get("/profiles")
def list_profiles():
    """Lists all saved student profiles."""
    return get_student_profiles()

@router.post("/profiles")
def create_profile(payload: ProfileCreateRequest):
    """Creates a new student profile or switches to an existing one."""
    return create_or_switch_student_profile(payload.name)

@router.put("/profiles/{profile_id}")
def update_profile(profile_id: str, payload: ProfileUpdateRequest):
    """Updates a student's profile name."""
    return update_student_profile_name(profile_id, payload.name)
