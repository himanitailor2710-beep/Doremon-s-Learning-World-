"""
Topic Detector and Course Structure Organizer for Doraemon AI Study World.
Guarantees 100% coverage of all slides and pages without silent omissions.
Generates a complete coverage checklist and structured sessions/topics hierarchy.
"""
import re
from typing import List, Dict, Any, Tuple

def clean_title(text: str) -> str:
    text = re.sub(r"^(slide|page)\s*\d+[:\-]?\s*", "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"^(session|module|chapter|unit)\s*\d+[:\-]?\s*", "", text, flags=re.IGNORECASE).strip()
    return text if text else "Concept Overview"

def detect_course_structure(
    raw_units: List[Dict[str, Any]], 
    file_type: str = "pptx"
) -> Dict[str, Any]:
    """
    Takes extracted units (slides or pages) and organizes them into:
    - Course Title
    - Sessions (Modules)
    - Topics & Subtopics
    - Coverage Checklist mapping every slide/page number to its assigned lesson
    """
    unit_label = "Slide" if file_type.lower() == "pptx" else "Page"
    total_units = len(raw_units)

    if not raw_units:
        return {
            "title": "Untitled Course",
            "sessions": [],
            "coverage_checklist": [],
            "total_units": 0
        }

    # Inferred Course Title from first slide/page or filename
    first_unit = raw_units[0]
    candidate_course_title = first_unit.get("title", "").strip()
    if not candidate_course_title or candidate_course_title.lower().startswith(("slide 1", "page 1", "untitled")):
        # Check first paragraph
        paras = first_unit.get("paragraphs", [])
        candidate_course_title = paras[0] if paras else "Comprehensive Study Course"

    # Identify sessions/modules:
    # A session can be explicitly flagged by "Module", "Session", "Chapter", "Part", "Unit"
    # Or grouped in chunks of 3-6 slides/pages for optimal pedagogy.
    sessions = []
    coverage_checklist = []
    
    current_session = {
        "title": "Module 1: Foundations & Core Concepts",
        "description": "Essential groundwork, definitions, and principles.",
        "topics": []
    }
    
    session_counter = 1
    
    for idx, unit in enumerate(raw_units, start=1):
        raw_title = unit.get("title", "").strip()
        paragraphs = unit.get("paragraphs", [])
        bullets = unit.get("bullet_points", [])
        tables = unit.get("tables", [])
        full_text = unit.get("full_text", "")

        # Check if this slide looks like a new Section Divider / Module Header
        is_module_header = bool(
            re.search(r"^(module|session|chapter|unit|part)\s*(\d+|[IVXLC]+)[:\-\s]", raw_title, re.IGNORECASE) or
            ("agenda" in raw_title.lower() and idx > 1) or
            ("overview" in raw_title.lower() and idx > 4) or
            (len(paragraphs) == 0 and len(bullets) <= 2 and len(raw_title) > 0 and idx > 1 and (idx - 1) % 4 == 0)
        )

        if is_module_header and current_session["topics"]:
            sessions.append(current_session)
            session_counter += 1
            mod_title = raw_title if len(raw_title) < 60 else f"Module {session_counter}: Advanced Topics"
            current_session = {
                "title": f"Module {session_counter}: {clean_title(mod_title)}",
                "description": f"Comprehensive study of {clean_title(mod_title)} and related applications.",
                "topics": []
            }

        # Topic Title
        topic_title = clean_title(raw_title)
        if topic_title.lower() in ["agenda", "table of contents", "outline"] and idx == 1:
            topic_title = "Course Syllabus & Roadmap"

        # Check for subtopics / key points
        subtopics = []
        for bullet in bullets[:6]:
            if len(bullet) > 4 and len(bullet) < 90:
                subtopics.append(bullet)

        # Importance estimation
        text_length = len(full_text)
        importance = "High" if (tables or len(bullets) >= 4 or "important" in full_text.lower() or "formula" in full_text.lower()) else "Medium"
        if idx == 1 and total_units > 1:
            importance = "Overview"

        topic_entry = {
            "title": topic_title,
            "source_pages": [idx],
            "summary": f"In-depth analysis of {topic_title} based on {unit_label} {idx}.",
            "importance": importance,
            "subtopics": subtopics,
            "raw_unit_data": unit
        }

        current_session["topics"].append(topic_entry)

        # Coverage checklist item
        coverage_checklist.append({
            "unit_number": idx,
            "unit_label": f"{unit_label} {idx}",
            "title": raw_title or f"{unit_label} {idx}",
            "topic_assigned": topic_title,
            "session_name": current_session["title"],
            "status": "Processed & Converted",
            "extracted_items": {
                "paragraphs_count": len(paragraphs),
                "bullets_count": len(bullets),
                "tables_count": len(tables),
                "has_notes": bool(unit.get("notes"))
            }
        })

    if current_session["topics"]:
        sessions.append(current_session)

    # Ensure at least one session exists
    if not sessions:
        sessions.append(current_session)

    return {
        "title": candidate_course_title,
        "sessions": sessions,
        "coverage_checklist": coverage_checklist,
        "total_units": total_units,
        "unit_label": unit_label
    }
