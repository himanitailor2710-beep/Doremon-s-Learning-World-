"""
Gamification Engine for Doraemon AI Study World:
XP calculation, Level progression, Anti-exploit duplicate protection,
Daily streaks, Badges, and Weak Topic tracking.
"""
import json
import sqlite3
import re
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from ..database import get_db

ALL_BADGES = {
    "Novice Gadgeteer": {"name": "Novice Gadgeteer", "description": "Joined Doraemon AI Study World & checked your pocket.", "icon": "🎒"},
    "Pocket Explorer": {"name": "Pocket Explorer", "description": "Completed your very first topic lesson!", "icon": "🌟"},
    "Anywhere Voyager": {"name": "Anywhere Voyager", "description": "Teleported across multiple study modules.", "icon": "🚪"},
    "Memory Bread Master": {"name": "Memory Bread Master", "description": "Aced revision with Memory Bread flashcards.", "icon": "🍞"},
    "Take-copter Ace": {"name": "Take-copter Ace", "description": "Explored visual concept roadmaps from high above.", "icon": "🚁"},
    "Time Traveler": {"name": "Time Traveler", "description": "Finished a timed examination in the Time Machine.", "icon": "⏳"},
    "Quiz Prodigy": {"name": "Quiz Prodigy", "description": "Scored a perfect 100% on a practice quiz!", "icon": "🎯"},
    "Streak Star": {"name": "Streak Star", "description": "Consistent learner studying daily.", "icon": "🔥"}
}

def get_student_profiles() -> List[Dict[str, Any]]:
    """Returns all registered student profiles."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, name, total_xp, level, current_streak, last_active_date,
           completed_topics_json, weak_topics_json, badges_json, created_at
    FROM student_profiles
    ORDER BY created_at ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    profiles = []
    for r in rows:
        completed = json.loads(r["completed_topics_json"] or "[]")
        profiles.append({
            "id": r["id"],
            "name": r["name"],
            "total_xp": r["total_xp"],
            "level": r["level"],
            "current_streak": r["current_streak"],
            "completed_topics_count": len(completed),
            "created_at": r["created_at"]
        })
    return profiles

def create_or_switch_student_profile(name: str) -> Dict[str, Any]:
    """Creates a new student profile if not exists, or returns existing profile."""
    name_clean = name.strip() or "Himani"
    slug = re.sub(r'[^a-zA-Z0-9]', '_', name_clean.lower())
    profile_id = f"student_{slug}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_profiles WHERE id = ? OR LOWER(name) = ?", (profile_id, name_clean.lower()))
    row = cursor.fetchone()

    if not row:
        cursor.execute("""
        INSERT INTO student_profiles (id, name, total_xp, level, current_streak, last_active_date, completed_topics_json, weak_topics_json, badges_json)
        VALUES (?, ?, 150, 1, 1, date('now'), '[]', '[]', '["Novice Gadgeteer", "Pocket Explorer"]')
        """, (profile_id, name_clean))
        conn.commit()
        cursor.execute("SELECT * FROM student_profiles WHERE id = ?", (profile_id,))
        row = cursor.fetchone()

    conn.close()
    return {
        "id": row["id"],
        "name": row["name"],
        "total_xp": row["total_xp"],
        "level": row["level"],
        "current_streak": row["current_streak"]
    }

def update_student_profile_name(profile_id: str, new_name: str) -> Dict[str, Any]:
    """Updates the display name of a student profile."""
    new_name_clean = new_name.strip() or "Himani"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE student_profiles SET name = ? WHERE id = ?", (new_name_clean, profile_id))
    conn.commit()
    conn.close()
    return {"id": profile_id, "name": new_name_clean}

def get_user_gamification_profile(profile_id: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves user's XP, level, streak, badges, and weak topics."""
    conn = get_db()
    cursor = conn.cursor()

    row = None
    student_name = "Himani"

    if profile_id:
        cursor.execute("""
        SELECT id, name, total_xp, level, current_streak, last_active_date, 
               completed_topics_json, weak_topics_json, badges_json
        FROM student_profiles 
        WHERE id = ? OR name = ?
        """, (profile_id, profile_id))
        row = cursor.fetchone()
        if row:
            student_name = row["name"]

    if not row:
        cursor.execute("""
        SELECT total_xp, level, current_streak, last_active_date, 
               completed_topics_json, weak_topics_json, badges_json
        FROM user_progress 
        WHERE id = 'current_user'
        """)
        row = cursor.fetchone()

    if not row:
        conn.close()
        return {
            "student_name": "Himani",
            "student_id": "student_himani",
            "total_xp": 150,
            "level": 1,
            "current_streak": 1,
            "completed_topics": [],
            "weak_topics": [],
            "badges": ["Novice Gadgeteer", "Pocket Explorer"]
        }

    total_xp = row["total_xp"]
    level = 1 + (total_xp // 250)
    current_streak = row["current_streak"]
    last_active_str = row["last_active_date"]
    completed_topics = json.loads(row["completed_topics_json"] or "[]")
    weak_topics = json.loads(row["weak_topics_json"] or "[]")
    badges = json.loads(row["badges_json"] or "[]")

    # Update streak if needed
    today_str = str(date.today())
    if last_active_str != today_str:
        try:
            last_date = datetime.strptime(last_active_str, "%Y-%m-%d").date()
            if today_str == str(last_date + timedelta(days=1)):
                current_streak += 1
            elif (date.today() - last_date).days > 1:
                current_streak = 1
        except Exception:
            current_streak = 1

        cursor.execute("""
        UPDATE user_progress 
        SET current_streak = ?, last_active_date = ?, level = ? 
        WHERE id = 'current_user'
        """, (current_streak, today_str, level))
        if profile_id:
            cursor.execute("""
            UPDATE student_profiles
            SET current_streak = ?, last_active_date = ?, level = ?
            WHERE id = ?
            """, (current_streak, today_str, level, profile_id))
        conn.commit()

    conn.close()

    # Calculate XP to next level
    xp_in_current_level = total_xp % 250
    next_level_xp = 250

    return {
        "student_name": student_name,
        "student_id": profile_id or "student_himani",
        "total_xp": total_xp,
        "level": level,
        "xp_in_current_level": xp_in_current_level,
        "next_level_xp": next_level_xp,
        "current_streak": current_streak,
        "completed_topics_count": len(completed_topics),
        "completed_topics": completed_topics,
        "weak_topics": weak_topics,
        "badges": badges,
        "available_badges": list(ALL_BADGES.values())
    }

def record_lesson_completion(topic_id: str, course_id: str) -> Dict[str, Any]:
    """
    Marks a lesson as completed. Awards +50 XP only once (anti-exploit).
    Unlocks badges if eligible.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT completed_topics_json, total_xp, badges_json FROM user_progress WHERE id = 'current_user'")
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {"xp_awarded": 0, "already_completed": True}

    completed_list = json.loads(row["completed_topics_json"] or "[]")
    badges_list = json.loads(row["badges_json"] or "[]")
    total_xp = row["total_xp"]

    already_done = topic_id in completed_list
    xp_awarded = 0
    new_badge = None

    if not already_done:
        xp_awarded = 50
        completed_list.append(topic_id)
        total_xp += xp_awarded
        new_level = 1 + (total_xp // 250)

        # Update topic is_completed
        cursor.execute("UPDATE topics SET is_completed = 1 WHERE id = ?", (topic_id,))
        cursor.execute("UPDATE lessons SET is_completed = 1 WHERE topic_id = ?", (topic_id,))

        # Badge check: Pocket Explorer
        if "Pocket Explorer" not in badges_list:
            badges_list.append("Pocket Explorer")
            new_badge = "Pocket Explorer"

        # Badge check: Anywhere Voyager
        if len(completed_list) >= 3 and "Anywhere Voyager" not in badges_list:
            badges_list.append("Anywhere Voyager")
            new_badge = "Anywhere Voyager"

        cursor.execute("""
        UPDATE user_progress 
        SET total_xp = ?, level = ?, completed_topics_json = ?, badges_json = ? 
        WHERE id = 'current_user'
        """, (total_xp, new_level, json.dumps(completed_list), json.dumps(badges_list)))
        conn.commit()

    conn.close()

    return {
        "success": True,
        "already_completed": already_done,
        "xp_awarded": xp_awarded,
        "total_xp": total_xp,
        "new_badge": new_badge
    }

def record_quiz_submission(
    quiz_id: str, 
    topic_id: str, 
    course_id: str, 
    answers: List[int]
) -> Dict[str, Any]:
    """
    Evaluates quiz answers, calculates score, updates weak topics,
    and awards XP persistently.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT questions_json FROM quizzes WHERE id = ?", (quiz_id,))
    q_row = cursor.fetchone()
    if not q_row:
        conn.close()
        return {"error": "Quiz not found"}

    questions = json.loads(q_row["questions_json"] or "[]")
    total_q = len(questions)
    correct_count = 0
    evaluation_details = []

    for idx, q in enumerate(questions):
        correct_idx = q.get("correct_index", 0)
        user_idx = answers[idx] if idx < len(answers) else -1
        is_correct = (user_idx == correct_idx)
        if is_correct:
            correct_count += 1

        evaluation_details.append({
            "question_index": idx,
            "question": q.get("question"),
            "options": q.get("options"),
            "user_index": user_idx,
            "correct_index": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    score_pct = int((correct_count / total_q) * 100) if total_q > 0 else 0

    # XP rules: 10 XP per correct question + 20 bonus for 100%
    xp_earned = (correct_count * 10) + (20 if score_pct == 100 else 0)

    # Fetch user progress
    cursor.execute("SELECT total_xp, weak_topics_json, badges_json FROM user_progress WHERE id = 'current_user'")
    u_row = cursor.fetchone()
    weak_topics = json.loads(u_row["weak_topics_json"] or "[]")
    badges_list = json.loads(u_row["badges_json"] or "[]")
    total_xp = u_row["total_xp"] + xp_earned
    new_level = 1 + (total_xp // 250)

    # Fetch topic title for weak topic record
    cursor.execute("SELECT title FROM topics WHERE id = ?", (topic_id,))
    t_row = cursor.fetchone()
    topic_title = t_row["title"] if t_row else "Concept"

    new_badge = None
    if score_pct == 100 and "Quiz Prodigy" not in badges_list:
        badges_list.append("Quiz Prodigy")
        new_badge = "Quiz Prodigy"

    # Weak topic tracking:
    # If score < 70%, add to weak topics; if >= 80%, remove if present
    if score_pct < 70:
        # Check if already in weak topics
        existing = next((w for w in weak_topics if w["topic_id"] == topic_id), None)
        if not existing:
            weak_topics.append({
                "topic_id": topic_id,
                "topic_title": topic_title,
                "course_id": course_id,
                "last_score": score_pct,
                "date": str(date.today()),
                "status": "Needs Revision"
            })
        else:
            existing["last_score"] = score_pct
            existing["status"] = "Needs Revision"
    elif score_pct >= 80:
        weak_topics = [w for w in weak_topics if w["topic_id"] != topic_id]

    # Save attempt
    attempt_id = f"attempt_{quiz_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    cursor.execute("""
    INSERT INTO quiz_attempts (id, quiz_id, topic_id, course_id, score, total_questions, answers_json, xp_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (attempt_id, quiz_id, topic_id, course_id, correct_count, total_q, json.dumps(answers), xp_earned))

    # Update user progress
    cursor.execute("""
    UPDATE user_progress 
    SET total_xp = ?, level = ?, weak_topics_json = ?, badges_json = ? 
    WHERE id = 'current_user'
    """, (total_xp, new_level, json.dumps(weak_topics), json.dumps(badges_list)))

    conn.commit()
    conn.close()

    return {
        "score_percent": score_pct,
        "correct_count": correct_count,
        "total_questions": total_q,
        "xp_earned": xp_earned,
        "new_badge": new_badge,
        "evaluation": evaluation_details,
        "weak_topic_status": "Added to Weak Topics (Review with Memory Bread!)" if score_pct < 70 else "Mastered!"
    }
