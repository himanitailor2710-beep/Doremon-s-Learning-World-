"""
Doraemon Learning Gadgets Service:
- Anywhere Door (Rapid Topic Navigator & Global Index)
- Memory Bread (Flashcard Deck & Revision Cheat Sheets)
- Take-copter (Concept Explorer & Visual Mindmap)
- Time Machine (Timed Exam Simulator & Mock Tests)
- Small Light (Simplify Mode / ELI5 Engine)
- Quiz Gadget (Gamified Assessment Engine)
"""
import json
import random
import sqlite3
from typing import List, Dict, Any, Optional
from ..database import get_db

def get_anywhere_door_directory(query: str = "") -> List[Dict[str, Any]]:
    """
    Anywhere Door - returns searchable directory of all courses, sessions, and topics
    allowing one-click teleportation to any concept.
    """
    conn = get_db()
    cursor = conn.cursor()

    sql = """
    SELECT 
        c.id as course_id, c.title as course_title, c.file_type,
        s.id as session_id, s.title as session_title,
        t.id as topic_id, t.title as topic_title, t.source_pages_json, t.importance, t.is_completed
    FROM topics t
    JOIN sessions s ON t.session_id = s.id
    JOIN courses c ON t.course_id = c.id
    """
    params = []
    if query:
        sql += " WHERE t.title LIKE ? OR s.title LIKE ? OR c.title LIKE ?"
        like_q = f"%{query}%"
        params = [like_q, like_q, like_q]

    sql += " ORDER BY c.created_at DESC, s.order_index ASC, t.order_index ASC"

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "course_id": r["course_id"],
            "course_title": r["course_title"],
            "file_type": r["file_type"],
            "session_id": r["session_id"],
            "session_title": r["session_title"],
            "topic_id": r["topic_id"],
            "topic_title": r["topic_title"],
            "source_pages": json.loads(r["source_pages_json"] or "[]"),
            "importance": r["importance"],
            "is_completed": bool(r["is_completed"])
        })
    return results

def get_memory_bread_cards(course_id: Optional[str] = None, topic_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Memory Bread - generates a deck of revision flashcards with definitions, key formulas,
    and bite-sized exam facts to ingest before exams!
    """
    conn = get_db()
    cursor = conn.cursor()

    sql = """
    SELECT l.id, l.topic_id, l.title, l.source_pages_json, l.simple_definition, 
           l.terminology_json, l.formulas_json, l.revision_summary, c.title as course_title,
           c.file_type
    FROM lessons l
    JOIN courses c ON l.course_id = c.id
    """
    params = []
    clauses = []
    if course_id:
        clauses.append("l.course_id = ?")
        params.append(course_id)
    if topic_id:
        clauses.append("l.topic_id = ?")
        params.append(topic_id)
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    cards = []
    card_id = 1
    for r in rows:
        unit_label = "Slide" if r["file_type"] == "pptx" else "Page"
        sources = json.loads(r["source_pages_json"] or "[]")
        source_str = f"{unit_label} {sources[0]}" if sources else "Notes"

        # Card 1: Definition Card
        if r["simple_definition"]:
            cards.append({
                "id": f"mb_{card_id}",
                "topic_title": r["title"],
                "course_title": r["course_title"],
                "source_ref": source_str,
                "card_type": "Definition",
                "front": f"What is the definition of {r['title']}?",
                "back": r["simple_definition"]
            })
            card_id += 1

        # Card 2: Terminology Cards
        terms = json.loads(r["terminology_json"] or "[]")
        for t in terms[:2]:
            cards.append({
                "id": f"mb_{card_id}",
                "topic_title": r["title"],
                "course_title": r["course_title"],
                "source_ref": source_str,
                "card_type": "Term",
                "front": f"Explain Term: '{t['term']}'",
                "back": t["definition"]
            })
            card_id += 1

        # Card 3: Formula Card (if any)
        formulas = json.loads(r["formulas_json"] or "[]")
        for f in formulas[:1]:
            cards.append({
                "id": f"mb_{card_id}",
                "topic_title": r["title"],
                "course_title": r["course_title"],
                "source_ref": source_str,
                "card_type": "Formula",
                "front": f"What is the key formula/metric for {r['title']}?",
                "back": f"{f['formula']}\n\nVariables: {f['variables']}\n\nExample: {f['solved_example']}"
            })
            card_id += 1

    return cards

def generate_time_machine_mock_exam(course_id: str, duration_minutes: int = 15) -> Dict[str, Any]:
    """
    Time Machine - Timed exam simulator.
    Pulls questions across all topics of a course, configures a countdown timer,
    and simulates a university examination test.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT q.id as quiz_id, q.topic_id, q.questions_json, t.title as topic_title
    FROM quizzes q
    JOIN topics t ON q.topic_id = t.id
    WHERE q.course_id = ?
    """, (course_id,))
    rows = cursor.fetchall()
    conn.close()

    all_questions = []
    for r in rows:
        qs = json.loads(r["questions_json"] or "[]")
        for q in qs:
            q_copy = dict(q)
            q_copy["topic_title"] = r["topic_title"]
            q_copy["quiz_id"] = r["quiz_id"]
            q_copy["topic_id"] = r["topic_id"]
            all_questions.append(q_copy)

    # Shuffle and pick up to 8 questions
    random.seed()
    random.shuffle(all_questions)
    selected = all_questions[:min(8, len(all_questions))]

    return {
        "exam_id": f"mock_exam_{course_id[:8]}",
        "course_id": course_id,
        "duration_minutes": duration_minutes,
        "total_questions": len(selected),
        "total_marks": len(selected) * 10,
        "questions": selected,
        "rules": [
            "Each question carries 10 points.",
            "Timer will countdown automatically in Time Machine mode.",
            "Review your answers before the clock hits zero to earn the Time Traveler badge!"
        ]
    }
