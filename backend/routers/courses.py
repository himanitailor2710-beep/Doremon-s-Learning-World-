"""
Courses router for Doraemon AI Study World.
Handles file uploads (PPTX, PDF), multi-file processing, background pipeline,
coverage checklist, and course management.
"""
import os
import shutil
import uuid
import json
import asyncio
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form
from pydantic import BaseModel

from ..database import get_db
from ..extractors.pptx_extractor import extract_pptx
from ..extractors.pdf_extractor import extract_pdf
from ..processors.topic_detector import detect_course_structure
from ..processors.pedagogy_engine import generate_lesson, generate_document_summary, build_knowledge_graph
from ..processors.rag_service import index_course_chunks

router = APIRouter(prefix="/api/courses", tags=["courses"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_document_pipeline(
    course_id: str,
    file_path: str,
    file_type: str,
    custom_subject_name: Optional[str] = None,
    custom_session_title: Optional[str] = None
):
    """
    Background pipeline that executes:
    1. Reading (extracting slides or pages)
    2. Identifying Topics (detecting structure & coverage)
    3. Generating Lessons (deep pedagogy & quizzes)
    4. Indexing RAG chunks
    5. Ready to Learn
    """
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Step 1: Reading
        cursor.execute("""
        UPDATE courses 
        SET status = 'reading', status_message = 'Reading every slide/page and extracting content...', progress_percent = 20 
        WHERE id = ?
        """, (course_id,))
        conn.commit()

        if file_type == "pptx":
            raw_units = extract_pptx(file_path)
        elif file_type == "pdf":
            raw_units = extract_pdf(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        total_units = len(raw_units)
        if total_units == 0:
            raise ValueError("Document contains no readable slides or pages.")

        # Step 2: Identifying Topics
        status_msg = f"Analyzing {total_units} {file_type.upper()} units and structuring topics..."
        cursor.execute("""
        UPDATE courses 
        SET status = 'identifying', status_message = ?, 
            progress_percent = 45, total_slides_or_pages = ? 
        WHERE id = ?
        """, (status_msg, total_units, course_id))
        conn.commit()

        structure = detect_course_structure(raw_units, file_type)
        cursor.execute("SELECT title FROM courses WHERE id = ?", (course_id,))
        existing_row = cursor.fetchone()
        existing_title = existing_row["title"] if existing_row else None

        if custom_subject_name and custom_subject_name.strip():
            course_title = custom_subject_name.strip()
        elif existing_title and existing_title.strip() and not existing_title.startswith("Untitled"):
            course_title = existing_title.strip()
        else:
            course_title = structure["title"]

        sessions = structure["sessions"]
        if custom_session_title and custom_session_title.strip() and len(sessions) > 0:
            sessions[0]["title"] = custom_session_title.strip()

        coverage = structure["coverage_checklist"]

        # Fetch API key if configured
        cursor.execute("SELECT gemini_api_key, model_name FROM app_settings WHERE id = 'global_settings'")
        settings_row = cursor.fetchone()
        api_key = settings_row["gemini_api_key"] if settings_row else ""
        model_name = settings_row["model_name"] if settings_row else "gemini-1.5-flash"

        # Update course title and coverage data
        cursor.execute("""
        UPDATE courses 
        SET title = ?, coverage_data = ?, status = 'generating', 
            status_message = 'Generating comprehensive lessons, Indian examples, and quizzes...', progress_percent = 65
        WHERE id = ?
        """, (course_title, json.dumps(coverage), course_id))
        conn.commit()

        # Step 3: Insert sessions and topics, and generate lessons
        total_topics = sum(len(s["topics"]) for s in sessions)
        processed_topics = 0

        unit_label = "Slide" if file_type == "pptx" else "Page"

        for s_idx, session_data in enumerate(sessions):
            session_id = f"{course_id}_s{s_idx+1}"
            cursor.execute("""
            INSERT INTO sessions (id, course_id, title, order_index, description)
            VALUES (?, ?, ?, ?, ?)
            """, (session_id, course_id, session_data["title"], s_idx, session_data.get("description", "")))

            for t_idx, topic_data in enumerate(session_data["topics"]):
                topic_id = f"{session_id}_t{t_idx+1}"
                source_pages = topic_data["source_pages"]
                raw_unit = topic_data["raw_unit_data"]

                cursor.execute("""
                INSERT INTO topics (id, session_id, course_id, title, order_index, source_pages_json, summary, importance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    topic_id, 
                    session_id, 
                    course_id, 
                    topic_data["title"], 
                    t_idx, 
                    json.dumps(source_pages), 
                    topic_data["summary"], 
                    topic_data["importance"]
                ))

                # Generate lesson
                lesson_content = await generate_lesson(
                    topic_title=topic_data["title"],
                    raw_unit_data=raw_unit,
                    source_pages=source_pages,
                    unit_label=unit_label,
                    api_key=api_key,
                    model_name=model_name
                )

                lesson_id = f"lesson_{topic_id}"
                cursor.execute("""
                INSERT INTO lessons (
                    id, topic_id, course_id, title, source_pages_json, simple_definition,
                    easy_english, hinglish, step_by_step_json, key_points_json,
                    real_life_examples_json, indian_examples_json, terminology_json,
                    formulas_json, diagrams_json, comparisons_json, exam_notes,
                    short_questions_json, long_questions_json, revision_summary,
                    simplified_mode_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    lesson_id,
                    topic_id,
                    course_id,
                    topic_data["title"],
                    json.dumps(source_pages),
                    lesson_content.get("simple_definition", ""),
                    lesson_content.get("easy_english", ""),
                    lesson_content.get("hinglish", ""),
                    json.dumps(lesson_content.get("step_by_step", [])),
                    json.dumps(lesson_content.get("key_points", [])),
                    json.dumps(lesson_content.get("real_life_examples", [])),
                    json.dumps(lesson_content.get("indian_examples", [])),
                    json.dumps(lesson_content.get("terminology", [])),
                    json.dumps(lesson_content.get("formulas", [])),
                    json.dumps(lesson_content.get("diagram", {})),
                    json.dumps(lesson_content.get("comparisons", {})),
                    lesson_content.get("exam_notes", ""),
                    json.dumps(lesson_content.get("short_questions", [])),
                    json.dumps(lesson_content.get("long_questions", [])),
                    lesson_content.get("revision_summary", ""),
                    json.dumps(lesson_content.get("simplified_mode", {}))
                ))

                # Insert quiz
                quiz_id = f"quiz_{topic_id}"
                quiz_questions = lesson_content.get("quiz", [])
                cursor.execute("""
                INSERT INTO quizzes (id, topic_id, course_id, title, questions_json)
                VALUES (?, ?, ?, ?, ?)
                """, (quiz_id, topic_id, course_id, f"Quiz: {topic_data['title']}", json.dumps(quiz_questions)))

                processed_topics += 1
                progress = 65 + int((processed_topics / max(total_topics, 1)) * 30)
                cursor.execute("""
                UPDATE courses 
                SET progress_percent = ?, processed_slides_or_pages = ? 
                WHERE id = ?
                """, (progress, processed_topics, course_id))
                conn.commit()

        # Step 4: Index chunks for RAG
        index_course_chunks(course_id, raw_units, unit_label)

        # Step 5: Generate complete document summary covering all 8 points (Requirement 6 & 8)
        summary_obj = generate_document_summary(course_title, sessions, raw_units, file_type)
        cursor.execute("DELETE FROM course_summaries WHERE course_id = ?", (course_id,))
        cursor.execute("""
        INSERT INTO course_summaries (
            id, course_id, what_is_it_about, main_topics_json, what_will_learn_json,
            important_concepts_json, how_topics_connected_text, connections_json,
            understand_first_json, exam_points_json, conclusion, quick_summary,
            detailed_summary, mermaid_syntax
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"summary_{course_id}", course_id,
            summary_obj["what_is_it_about"],
            json.dumps(summary_obj["main_topics"]),
            json.dumps(summary_obj["what_will_learn"]),
            json.dumps(summary_obj["important_concepts"]),
            summary_obj["how_topics_connected"],
            json.dumps(summary_obj["connections"]),
            json.dumps(summary_obj["understand_first"]),
            json.dumps(summary_obj["exam_points"]),
            summary_obj["conclusion"],
            summary_obj["quick_summary"],
            summary_obj["detailed_summary"],
            summary_obj["mermaid_syntax"]
        ))
        conn.commit()

        # Step 6: Ready to Learn!
        cursor.execute("""
        UPDATE courses 
        SET status = 'ready', status_message = 'Ready to Learn! All topics and gadgets unlocked.', progress_percent = 100 
        WHERE id = ?
        """, (course_id,))

        cursor.execute("""
        UPDATE course_documents
        SET total_units = ?, topic_count = ?, status = 'ready'
        WHERE course_id = ? AND file_path = ?
        """, (total_units, total_topics, course_id, file_path))

        conn.commit()

    except Exception as e:
        import traceback
        traceback.print_exc()
        cursor.execute("""
        UPDATE courses 
        SET status = 'error', status_message = ? 
        WHERE id = ?
        """, (f"Processing error: {str(e)}", course_id))
        conn.commit()
    finally:
        conn.close()

@router.get("")
def list_courses():
    """Returns all courses with topic counts and progress stats."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT c.*, 
           (SELECT COUNT(*) FROM topics t WHERE t.course_id = c.id) as topic_count,
           (SELECT COUNT(*) FROM topics t WHERE t.course_id = c.id AND t.is_completed = 1) as completed_topics_count
    FROM courses c
    ORDER BY c.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    courses = []
    for r in rows:
        courses.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "filename": r["filename"],
            "file_type": r["file_type"],
            "status": r["status"],
            "status_message": r["status_message"],
            "progress_percent": r["progress_percent"],
            "total_units": r["total_slides_or_pages"],
            "topic_count": r["topic_count"],
            "completed_topics_count": r["completed_topics_count"],
            "created_at": r["created_at"]
        })
    return courses

@router.get("/{course_id}")
def get_course_detail(course_id: str):
    """Returns complete course hierarchy: Sessions -> Topics, plus Coverage Checklist."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    c_row = cursor.fetchone()
    if not c_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")

    cursor.execute("SELECT * FROM sessions WHERE course_id = ? ORDER BY order_index ASC", (course_id,))
    s_rows = cursor.fetchall()

    sessions = []
    for s in s_rows:
        cursor.execute("SELECT * FROM topics WHERE session_id = ? ORDER BY order_index ASC", (s["id"],))
        t_rows = cursor.fetchall()

        topics = []
        for t in t_rows:
            topics.append({
                "id": t["id"],
                "title": t["title"],
                "order_index": t["order_index"],
                "source_pages": json.loads(t["source_pages_json"] or "[]"),
                "summary": t["summary"],
                "importance": t["importance"],
                "is_completed": bool(t["is_completed"])
            })

        sessions.append({
            "id": s["id"],
            "title": s["title"],
            "order_index": s["order_index"],
            "description": s["description"],
            "topics": topics
        })

    coverage_data = json.loads(c_row["coverage_data"] or "[]")

    # Fetch uploaded study materials (PPTs / PDFs)
    cursor.execute("SELECT * FROM course_documents WHERE course_id = ? ORDER BY created_at ASC", (course_id,))
    doc_rows = cursor.fetchall()
    materials = []
    for d in doc_rows:
        materials.append({
            "id": d["id"],
            "course_id": d["course_id"],
            "session_id": d["session_id"],
            "filename": d["filename"],
            "file_type": d["file_type"],
            "title": d["title"] or d["filename"],
            "total_units": d["total_units"],
            "topic_count": d["topic_count"],
            "status": d["status"],
            "created_at": d["created_at"]
        })

    # Auto-seed if course_documents is empty but course has an uploaded file
    if not materials and c_row["filename"] and c_row["filename"].strip():
        total_topics_count = sum(len(s.get("topics", [])) for s in sessions)
        doc_id = f"doc_{course_id}"
        default_mat = {
            "id": doc_id,
            "course_id": course_id,
            "session_id": sessions[0]["id"] if sessions else None,
            "filename": c_row["filename"],
            "file_type": c_row["file_type"],
            "title": c_row["filename"],
            "total_units": c_row["total_slides_or_pages"],
            "topic_count": total_topics_count,
            "status": c_row["status"],
            "created_at": c_row["created_at"]
        }
        materials.append(default_mat)
        cursor.execute("""
        INSERT OR IGNORE INTO course_documents (id, course_id, session_id, filename, file_type, file_path, title, total_units, topic_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (doc_id, course_id, default_mat["session_id"], c_row["filename"], c_row["file_type"], c_row["file_path"], c_row["filename"], c_row["total_slides_or_pages"], total_topics_count, c_row["status"]))
        conn.commit()

    conn.close()

    return {
        "id": c_row["id"],
        "title": c_row["title"],
        "filename": c_row["filename"],
        "file_type": c_row["file_type"],
        "status": c_row["status"],
        "status_message": c_row["status_message"],
        "progress_percent": c_row["progress_percent"],
        "total_units": c_row["total_slides_or_pages"],
        "sessions": sessions,
        "materials": materials,
        "coverage_checklist": coverage_data
    }

@router.post("/upload")
async def upload_study_material(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    subject_name: Optional[str] = Form(None),
    session_title: Optional[str] = Form(None),
    target_course_id: Optional[str] = Form(None)
):
    """
    Accepts single or multiple PPTX/PDF files.
    Allows specifying custom subject name and session details.
    """
    created_courses = []

    for file in files:
        filename = file.filename or "unknown_file"
        ext = os.path.splitext(filename)[1].lower()

        if ext not in [".pptx", ".pdf"]:
            continue

        file_type = "pptx" if ext == ".pptx" else "pdf"
        conn = get_db()
        cursor = conn.cursor()

        if target_course_id:
            course_id = target_course_id
            cursor.execute("SELECT title FROM courses WHERE id = ?", (course_id,))
            target_row = cursor.fetchone()
            base_title = target_row["title"] if target_row else (subject_name or os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title())
            saved_file_name = f"{course_id}_{filename}"
            saved_file_path = os.path.join(UPLOAD_DIR, saved_file_name)

            with open(saved_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            cursor.execute("""
            UPDATE courses 
            SET filename = ?, file_type = ?, file_path = ?, status = 'uploading', 
                status_message = 'File received. Starting extraction pipeline...', progress_percent = 5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, (filename, file_type, saved_file_path, course_id))

            # Record in course_documents
            doc_id = f"doc_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO course_documents (id, course_id, filename, file_type, file_path, title, total_units, topic_count, status)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'uploading')
            """, (doc_id, course_id, filename, file_type, saved_file_path, filename))
        else:
            course_id = f"course_{uuid.uuid4().hex[:10]}"
            saved_file_name = f"{course_id}_{filename}"
            saved_file_path = os.path.join(UPLOAD_DIR, saved_file_name)

            with open(saved_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            if subject_name and subject_name.strip():
                base_title = subject_name.strip()
            else:
                base_title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()

            cursor.execute("""
            INSERT INTO courses (id, title, description, filename, file_type, file_path, status, status_message, progress_percent)
            VALUES (?, ?, ?, ?, ?, ?, 'uploading', 'File received. Starting extraction pipeline...', 5)
            """, (course_id, base_title, f"Extracted from {filename}", filename, file_type, saved_file_path))

            doc_id = f"doc_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO course_documents (id, course_id, filename, file_type, file_path, title, total_units, topic_count, status)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'uploading')
            """, (doc_id, course_id, filename, file_type, saved_file_path, filename))

        conn.commit()
        conn.close()

        # Trigger background processing
        background_tasks.add_task(
            process_document_pipeline,
            course_id,
            saved_file_path,
            file_type,
            subject_name,
            session_title
        )

        created_courses.append({
            "id": course_id,
            "title": base_title,
            "filename": filename,
            "file_type": file_type,
            "status": "uploading"
        })

    if not created_courses:
        raise HTTPException(status_code=400, detail="No valid .pptx or .pdf files found in upload.")

    return {
        "message": f"Successfully uploaded {len(created_courses)} document(s). Processing in background.",
        "courses": created_courses
    }

@router.post("/{course_id}/retry")
def retry_course_processing(course_id: str, background_tasks: BackgroundTasks):
    """Retries processing for a failed or stalled course."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path, file_type FROM courses WHERE id = ?", (course_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Course not found")

    file_path = row["file_path"]
    file_type = row["file_type"]

    background_tasks.add_task(process_document_pipeline, course_id, file_path, file_type)
    return {"message": "Processing restarted.", "course_id": course_id}

class CreateSubjectPayload(BaseModel):
    title: str
    description: Optional[str] = ""

@router.post("/subject")
def create_new_subject(payload: CreateSubjectPayload):
    """Creates a new empty subject cloud created by the user without predefined materials."""
    if not payload.title or not payload.title.strip():
        raise HTTPException(status_code=400, detail="Subject name is required.")
    
    subject_id = f"subj_{uuid.uuid4().hex[:10]}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO courses (id, title, description, filename, file_type, file_path, status, status_message, progress_percent, total_slides_or_pages, processed_slides_or_pages)
    VALUES (?, ?, ?, '', 'subject', '', 'ready', 'Awaiting Study Material', 100, 0, 0)
    """, (subject_id, payload.title.strip(), payload.description.strip() if payload.description else "Custom Subject"))
    conn.commit()
    conn.close()
    return {
        "id": subject_id,
        "title": payload.title.strip(),
        "description": payload.description.strip() if payload.description else "Custom Subject",
        "status": "ready",
        "total_units": 0,
        "topic_count": 0
    }

class UpdateCourseRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

@router.patch("/{course_id}")
def update_course(course_id: str, payload: UpdateCourseRequest):
    """Update course/subject title and description."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM courses WHERE id = ?", (course_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")
    
    if payload.title is not None and payload.title.strip():
        cursor.execute("UPDATE courses SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (payload.title.strip(), course_id))
    if payload.description is not None:
        cursor.execute("UPDATE courses SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (payload.description.strip(), course_id))
    
    conn.commit()
    conn.close()
    return {"message": "Subject updated successfully", "course_id": course_id}

@router.patch("/{course_id}/sessions/{session_id}")
def update_session(course_id: str, session_id: str, payload: UpdateSessionRequest):
    """Update session title and description."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM sessions WHERE id = ? AND course_id = ?", (session_id, course_id))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Session not found")
    
    if payload.title is not None and payload.title.strip():
        cursor.execute("UPDATE sessions SET title = ? WHERE id = ?", (payload.title.strip(), session_id))
    if payload.description is not None:
        cursor.execute("UPDATE sessions SET description = ? WHERE id = ?", (payload.description.strip(), session_id))
        
    conn.commit()
    conn.close()
    return {"message": "Session updated successfully", "session_id": session_id}

@router.delete("/{course_id}")
def delete_course(course_id: str):
    """Deletes a course and all associated lessons, quizzes, and chunks."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path FROM courses WHERE id = ?", (course_id,))
    row = cursor.fetchone()
    if row and os.path.exists(row["file_path"]):
        try:
            os.remove(row["file_path"])
        except Exception:
            pass

    cursor.execute("DELETE FROM document_chunks WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM quiz_attempts WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM quizzes WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM lessons WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM topics WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM sessions WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM courses WHERE id = ?", (course_id,))
    conn.commit()
    conn.close()

    return {"message": "Course deleted successfully", "course_id": course_id}

@router.delete("/{course_id}/materials/{material_id}")
def delete_course_material(course_id: str, material_id: str):
    """
    Removes a specific uploaded presentation/document (PPT or PDF) from the subject.
    Cleans up its physical file and extracted topics/lessons, while keeping the subject intact.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM course_documents WHERE course_id = ? AND id = ?", (course_id, material_id))
    doc = cursor.fetchone()

    target_path = None
    session_id = None

    if doc:
        target_path = doc["file_path"]
        session_id = doc["session_id"]
        cursor.execute("DELETE FROM course_documents WHERE id = ?", (material_id,))
    else:
        cursor.execute("SELECT file_path FROM courses WHERE id = ?", (course_id,))
        c_row = cursor.fetchone()
        if c_row:
            target_path = c_row["file_path"]

    # Remove physical file if on disk
    if target_path and os.path.exists(target_path):
        try:
            os.remove(target_path)
        except Exception:
            pass

    # If linked to a specific session, remove that session's topics and lessons
    if session_id:
        cursor.execute("SELECT id FROM topics WHERE session_id = ?", (session_id,))
        topic_ids = [r["id"] for r in cursor.fetchall()]
        for tid in topic_ids:
            cursor.execute("DELETE FROM lessons WHERE topic_id = ?", (tid,))
            cursor.execute("DELETE FROM quizzes WHERE topic_id = ?", (tid,))
            cursor.execute("DELETE FROM quiz_attempts WHERE topic_id = ?", (tid,))
        cursor.execute("DELETE FROM topics WHERE session_id = ?", (session_id,))
        cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))

    # Check remaining documents in course
    cursor.execute("SELECT COUNT(*) FROM course_documents WHERE course_id = ?", (course_id,))
    rem_docs = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM topics WHERE course_id = ?", (course_id,))
    rem_topics = cursor.fetchone()[0]

    if rem_docs == 0 or rem_topics == 0:
        # All materials removed: clear all topics/lessons/sessions, but KEEP the subject cloud intact!
        cursor.execute("DELETE FROM lessons WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM quizzes WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM quiz_attempts WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM topics WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM sessions WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM document_chunks WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM course_documents WHERE course_id = ?", (course_id,))

        cursor.execute("""
        UPDATE courses 
        SET filename = '', file_type = '', file_path = '', status = 'ready',
            status_message = 'No study materials uploaded yet.', progress_percent = 0,
            total_slides_or_pages = 0, coverage_data = '[]', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (course_id,))

    conn.commit()
    conn.close()
    return {"message": "Uploaded presentation removed successfully", "course_id": course_id, "material_id": material_id}

@router.delete("/{course_id}/document")
def delete_course_primary_document(course_id: str):
    """Alias to remove all uploaded study materials from the subject while keeping the subject cloud."""
    return delete_course_material(course_id, "primary")

@router.get("/{course_id}/raw-text")
def get_course_raw_text(course_id: str):
    """Returns all extracted raw text chunks for verification and audit."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT slide_or_page_number, header, content 
    FROM document_chunks 
    WHERE course_id = ? 
    ORDER BY slide_or_page_number ASC
    """, (course_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "unit_number": r["slide_or_page_number"],
            "header": r["header"],
            "content": r["content"]
        }
        for r in rows
    ]

@router.get("/{course_id}/summary")
def get_course_summary(course_id: str):
    """Returns the dedicated complete document summary covering all 8 points (Requirement 6 & 8)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM course_summaries WHERE course_id = ?", (course_id,))
    row = cursor.fetchone()
    
    if not row:
        # Check course detail and generate if missing
        cursor.execute("SELECT title, file_type FROM courses WHERE id = ?", (course_id,))
        c_row = cursor.fetchone()
        if not c_row:
            conn.close()
            raise HTTPException(status_code=404, detail="Course not found")
        
        cursor.execute("SELECT * FROM sessions WHERE course_id = ? ORDER BY order_index ASC", (course_id,))
        s_rows = cursor.fetchall()
        sessions = []
        for s in s_rows:
            cursor.execute("SELECT * FROM topics WHERE session_id = ? ORDER BY order_index ASC", (s["id"],))
            t_rows = cursor.fetchall()
            sessions.append({
                "id": s["id"],
                "title": s["title"],
                "topics": [{"id": t["id"], "title": t["title"], "summary": t["summary"], "importance": t["importance"]} for t in t_rows]
            })
        
        summary_obj = generate_document_summary(c_row["title"], sessions, [{"title": c_row["title"]}], c_row["file_type"] or "pptx")
        summary_id = f"summary_{course_id}"
        cursor.execute("""
        INSERT INTO course_summaries (
            id, course_id, what_is_it_about, main_topics_json, what_will_learn_json,
            important_concepts_json, how_topics_connected_text, connections_json,
            understand_first_json, exam_points_json, conclusion, quick_summary,
            detailed_summary, mermaid_syntax
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            summary_id, course_id,
            summary_obj["what_is_it_about"],
            json.dumps(summary_obj["main_topics"]),
            json.dumps(summary_obj["what_will_learn"]),
            json.dumps(summary_obj["important_concepts"]),
            summary_obj["how_topics_connected"],
            json.dumps(summary_obj["connections"]),
            json.dumps(summary_obj["understand_first"]),
            json.dumps(summary_obj["exam_points"]),
            summary_obj["conclusion"],
            summary_obj["quick_summary"],
            summary_obj["detailed_summary"],
            summary_obj["mermaid_syntax"]
        ))
        conn.commit()
        cursor.execute("SELECT * FROM course_summaries WHERE course_id = ?", (course_id,))
        row = cursor.fetchone()

    conn.close()

    return {
        "id": row["id"],
        "course_id": row["course_id"],
        "what_is_it_about": row["what_is_it_about"],
        "main_topics": json.loads(row["main_topics_json"] or "[]"),
        "what_will_learn": json.loads(row["what_will_learn_json"] or "[]"),
        "important_concepts": json.loads(row["important_concepts_json"] or "[]"),
        "how_topics_connected": row["how_topics_connected_text"],
        "connections": json.loads(row["connections_json"] or "[]"),
        "understand_first": json.loads(row["understand_first_json"] or "[]"),
        "exam_points": json.loads(row["exam_points_json"] or "[]"),
        "conclusion": row["conclusion"],
        "quick_summary": row["quick_summary"],
        "detailed_summary": row["detailed_summary"],
        "mermaid_syntax": row["mermaid_syntax"]
    }

@router.get("/knowledge-map/all")
def get_all_learning_knowledge_map():
    """Returns the comprehensive All Learning Map connecting concepts across multiple uploaded courses (Requirement 9)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM courses ORDER BY created_at DESC")
    c_rows = cursor.fetchall()

    all_nodes = []
    all_edges = []

    for c in c_rows:
        course_id = c["id"]
        course_title = c["title"]
        cursor.execute("SELECT * FROM sessions WHERE course_id = ? ORDER BY order_index ASC", (course_id,))
        s_rows = cursor.fetchall()
        sessions = []
        for s in s_rows:
            cursor.execute("SELECT * FROM topics WHERE session_id = ? ORDER BY order_index ASC", (s["id"],))
            t_rows = cursor.fetchall()
            sessions.append({
                "id": s["id"],
                "title": s["title"],
                "description": s["description"],
                "topics": [{"id": t["id"], "title": t["title"], "summary": t["summary"], "importance": t["importance"], "is_completed": bool(t["is_completed"])} for t in t_rows]
            })
        
        c_graph = build_knowledge_graph(course_id, course_title, sessions)
        all_nodes.extend(c_graph["nodes"])
        all_edges.extend(c_graph["edges"])

    # If multiple courses exist, synthesize cross-course thematic bridge edges!
    if len(c_rows) > 1:
        for i in range(len(c_rows) - 1):
            c1_id = c_rows[i]["id"]
            c2_id = c_rows[i+1]["id"]
            t1 = next((n for n in all_nodes if n.get("course_id") == c1_id and n.get("type") == "topic"), None)
            t2 = next((n for n in all_nodes if n.get("course_id") == c2_id and n.get("type") == "topic"), None)
            if t1 and t2:
                all_edges.append({
                    "source": t1["id"],
                    "target": t2["id"],
                    "relation_type": "cross_disciplinary",
                    "label": "Interdisciplinary Synergy",
                    "explanation": f"Concepts in '{t1['label']}' synthesize directly with '{t2['label']}' across academic domains."
                })

    conn.close()
    return {
        "nodes": all_nodes,
        "edges": all_edges,
        "stats": {
            "total_nodes": len(all_nodes),
            "total_edges": len(all_edges),
            "courses_count": len(c_rows)
        }
    }

@router.get("/{course_id}/knowledge-map")
def get_course_knowledge_map(course_id: str):
    """Returns an Obsidian-inspired interactive knowledge map for a single course (Requirement 9)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM courses WHERE id = ?", (course_id,))
    c_row = cursor.fetchone()
    if not c_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")
    
    cursor.execute("SELECT * FROM sessions WHERE course_id = ? ORDER BY order_index ASC", (course_id,))
    s_rows = cursor.fetchall()
    sessions = []
    for s in s_rows:
        cursor.execute("SELECT * FROM topics WHERE session_id = ? ORDER BY order_index ASC", (s["id"],))
        t_rows = cursor.fetchall()
        topics = []
        for t in t_rows:
            topics.append({
                "id": t["id"],
                "title": t["title"],
                "summary": t["summary"],
                "importance": t["importance"],
                "is_completed": bool(t["is_completed"])
            })
        sessions.append({
            "id": s["id"],
            "title": s["title"],
            "description": s["description"],
            "topics": topics
        })
    conn.close()
    return build_knowledge_graph(course_id, c_row["title"], sessions)

class CourseCreateManualRequest(BaseModel):
    title: str
    description: Optional[str] = "Custom learning course"

@router.post("/manual")
async def create_course_manual(payload: CourseCreateManualRequest):
    """Manually create a new course."""
    course_id = f"course_{uuid.uuid4().hex[:10]}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO courses (id, title, description, filename, file_type, file_path, status, status_message, progress_percent, total_slides_or_pages, processed_slides_or_pages)
    VALUES (?, ?, ?, 'manual_entry', 'custom', '', 'ready', 'Ready to Learn', 100, 1, 1)
    """, (course_id, payload.title, payload.description))
    
    # Create default session
    session_id = f"{course_id}_s1"
    cursor.execute("""
    INSERT INTO sessions (id, course_id, title, order_index, description)
    VALUES (?, ?, 'Module 1: Foundations', 1, 'Core fundamentals and key principles.')
    """, (session_id, course_id))
    
    # Create default topic
    topic_id = f"{course_id}_t1"
    cursor.execute("""
    INSERT INTO topics (id, session_id, course_id, title, order_index, source_pages_json, summary, importance)
    VALUES (?, ?, ?, 'Introduction & Core Concepts', 1, '[1]', 'Introductory overview and main objectives.', 'High')
    """, (topic_id, session_id, course_id))
    
    # Create lesson
    lesson_content = await generate_lesson(
        topic_title='Introduction & Core Concepts',
        raw_unit_data={'title': 'Introduction & Core Concepts', 'paragraphs': [f"Welcome to {payload.title}. This course establishes key concepts and practical applications."], 'bullet_points': ['Fundamental Architecture', 'Design Principles', 'Real-world Integration']},
        unit_label='Unit',
        source_pages=[1]
    )
    
    cursor.execute("""
    INSERT INTO lessons (
        id, topic_id, course_id, title, source_pages_json,
        simple_definition, easy_english, hinglish, step_by_step_json,
        key_points_json, real_life_examples_json, indian_examples_json,
        terminology_json, formulas_json, diagrams_json, comparisons_json,
        exam_notes, short_questions_json, long_questions_json,
        revision_summary, simplified_mode_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"lesson_{topic_id}", topic_id, course_id, 'Introduction & Core Concepts', '[1]',
        lesson_content.get("simple_definition", ""),
        lesson_content.get("easy_english", ""),
        lesson_content.get("hinglish", ""),
        json.dumps(lesson_content.get("step_by_step", [])),
        json.dumps(lesson_content.get("key_points", [])),
        json.dumps(lesson_content.get("real_life_examples", [])),
        json.dumps(lesson_content.get("indian_examples", [])),
        json.dumps(lesson_content.get("terminology", [])),
        json.dumps(lesson_content.get("formulas", [])),
        json.dumps(lesson_content.get("diagram", {})),
        json.dumps(lesson_content.get("comparisons", {})),
        lesson_content.get("exam_notes", ""),
        json.dumps(lesson_content.get("short_questions", [])),
        json.dumps(lesson_content.get("long_questions", [])),
        lesson_content.get("revision_summary", ""),
        json.dumps(lesson_content.get("simplified_mode", {}))
    ))
    
    # Create quiz
    cursor.execute("""
    INSERT INTO quizzes (id, topic_id, course_id, title, questions_json)
    VALUES (?, ?, ?, ?, ?)
    """, (f"quiz_{topic_id}", topic_id, course_id, 'Quiz: Introduction & Core Concepts', json.dumps(lesson_content.get("quiz", []))))
    
    conn.commit()
    conn.close()
    
    return {"message": "Course created successfully", "course_id": course_id}

class SessionCreateRequest(BaseModel):
    title: str
    description: Optional[str] = ""

@router.post("/{course_id}/sessions")
def add_course_session(course_id: str, payload: SessionCreateRequest):
    """Add a new session/chapter to a course."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM sessions WHERE course_id = ?", (course_id,))
    count = cursor.fetchone()[0]
    
    session_id = f"{course_id}_s{count+1}_{uuid.uuid4().hex[:4]}"
    cursor.execute("""
    INSERT INTO sessions (id, course_id, title, order_index, description)
    VALUES (?, ?, ?, ?, ?)
    """, (session_id, course_id, payload.title, count + 1, payload.description))
    conn.commit()
    conn.close()
    return {"message": "Session added", "session_id": session_id}

class TopicCreateRequest(BaseModel):
    title: str
    summary: Optional[str] = ""
    importance: Optional[str] = "Medium"

@router.post("/{course_id}/sessions/{session_id}/topics")
async def add_session_topic(course_id: str, session_id: str, payload: TopicCreateRequest):
    """Add a new topic to a session and generate structured lessons & quizzes."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM topics WHERE session_id = ?", (session_id,))
    count = cursor.fetchone()[0]
    
    topic_id = f"t_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO topics (id, session_id, course_id, title, order_index, source_pages_json, summary, importance)
    VALUES (?, ?, ?, ?, ?, '[]', ?, ?)
    """, (topic_id, session_id, course_id, payload.title, count + 1, payload.summary, payload.importance))
    
    lesson_content = await generate_lesson(
        topic_title=payload.title,
        raw_unit_data={'title': payload.title, 'paragraphs': [payload.summary or f"Study notes and detailed coverage for {payload.title}."], 'bullet_points': []},
        unit_label='Custom',
        source_pages=[1]
    )
    
    cursor.execute("""
    INSERT INTO lessons (
        id, topic_id, course_id, title, source_pages_json,
        simple_definition, easy_english, hinglish, step_by_step_json,
        key_points_json, real_life_examples_json, indian_examples_json,
        terminology_json, formulas_json, diagrams_json, comparisons_json,
        exam_notes, short_questions_json, long_questions_json,
        revision_summary, simplified_mode_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"lesson_{topic_id}", topic_id, course_id, payload.title, '[]',
        lesson_content.get("simple_definition", ""),
        lesson_content.get("easy_english", ""),
        lesson_content.get("hinglish", ""),
        json.dumps(lesson_content.get("step_by_step", [])),
        json.dumps(lesson_content.get("key_points", [])),
        json.dumps(lesson_content.get("real_life_examples", [])),
        json.dumps(lesson_content.get("indian_examples", [])),
        json.dumps(lesson_content.get("terminology", [])),
        json.dumps(lesson_content.get("formulas", [])),
        json.dumps(lesson_content.get("diagram", {})),
        json.dumps(lesson_content.get("comparisons", {})),
        lesson_content.get("exam_notes", ""),
        json.dumps(lesson_content.get("short_questions", [])),
        json.dumps(lesson_content.get("long_questions", [])),
        lesson_content.get("revision_summary", ""),
        json.dumps(lesson_content.get("simplified_mode", {}))
    ))
    
    cursor.execute("""
    INSERT INTO quizzes (id, topic_id, course_id, title, questions_json)
    VALUES (?, ?, ?, ?, ?)
    """, (f"quiz_{topic_id}", topic_id, course_id, f"Quiz: {payload.title}", json.dumps(lesson_content.get("quiz", []))))
    
    conn.commit()
    conn.close()
    return {"message": "Topic added successfully", "topic_id": topic_id}

async def process_session_document_pipeline(course_id: str, session_id: str, file_path: str, file_type: str, original_filename: str):
    """Processes an uploaded PPTX/PDF specifically into a given session."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE courses SET status = 'reading', status_message = ?, progress_percent = 25 WHERE id = ?",
                       (f"Reading {original_filename} for session...", course_id))
        conn.commit()

        if file_type == "pptx":
            raw_units = extract_pptx(file_path)
        elif file_type == "pdf":
            raw_units = extract_pdf(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        if not raw_units:
            raise ValueError("No readable slides or pages found in file.")

        cursor.execute("UPDATE courses SET status = 'identifying', status_message = ?, progress_percent = 50 WHERE id = ?",
                       (f"Identifying topics in {len(raw_units)} {file_type.upper()} units...", course_id))
        conn.commit()

        structure = detect_course_structure(raw_units, file_type)
        unit_label = "Slide" if file_type == "pptx" else "Page"

        # Count existing topics in this session to order properly
        cursor.execute("SELECT COUNT(*) FROM topics WHERE session_id = ?", (session_id,))
        topic_count_row = cursor.fetchone()
        existing_topic_count = topic_count_row[0] if topic_count_row else 0

        # Collect topics from structure
        extracted_topics = []
        for s in structure.get("sessions", []):
            extracted_topics.extend(s.get("topics", []))
        
        if not extracted_topics:
            clean_title = os.path.splitext(original_filename)[0].replace("_", " ").title()
            extracted_topics = [{
                "title": clean_title,
                "pages": list(range(1, min(len(raw_units) + 1, 6))),
                "importance": "High",
                "summary": f"Core principles extracted from {original_filename}"
            }]

        cursor.execute("UPDATE courses SET status = 'generating', status_message = ?, progress_percent = 70 WHERE id = ?",
                       (f"Generating lessons and quizzes for {len(extracted_topics)} topics...", course_id))
        conn.commit()

        for t_idx, topic in enumerate(extracted_topics):
            t_title = topic["title"]
            source_pages = topic.get("pages", [1])
            topic_id = f"t_{uuid.uuid4().hex[:8]}"

            # Combine text from source pages
            combined_paras = []
            combined_bullets = []
            for p_num in source_pages:
                if 1 <= p_num <= len(raw_units):
                    u = raw_units[p_num - 1]
                    combined_paras.extend(u.get("paragraphs", []))
                    combined_bullets.extend(u.get("bullet_points", []))

            raw_topic_data = {
                "title": t_title,
                "paragraphs": combined_paras[:6] if combined_paras else [f"Comprehensive coverage of {t_title}"],
                "bullet_points": combined_bullets[:8]
            }

            cursor.execute("""
            INSERT INTO topics (id, session_id, course_id, title, order_index, source_pages_json, summary, importance, is_completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
            """, (topic_id, session_id, course_id, t_title, existing_topic_count + t_idx + 1, json.dumps(source_pages), topic.get("summary", ""), topic.get("importance", "Medium")))

            lesson_content = await generate_lesson(
                topic_title=t_title,
                raw_unit_data=raw_topic_data,
                unit_label=unit_label,
                source_pages=source_pages
            )

            cursor.execute("""
            INSERT INTO lessons (
                id, topic_id, course_id, title, source_pages_json,
                simple_definition, easy_english, hinglish, step_by_step_json,
                key_points_json, real_life_examples_json, indian_examples_json,
                terminology_json, formulas_json, diagrams_json, comparisons_json,
                exam_notes, short_questions_json, long_questions_json,
                revision_summary, simplified_mode_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"lesson_{topic_id}", topic_id, course_id, t_title, json.dumps(source_pages),
                lesson_content.get("simple_definition", ""),
                lesson_content.get("easy_english", ""),
                lesson_content.get("hinglish", ""),
                json.dumps(lesson_content.get("step_by_step", [])),
                json.dumps(lesson_content.get("key_points", [])),
                json.dumps(lesson_content.get("real_life_examples", [])),
                json.dumps(lesson_content.get("indian_examples", [])),
                json.dumps(lesson_content.get("terminology", [])),
                json.dumps(lesson_content.get("formulas", [])),
                json.dumps(lesson_content.get("diagram", {})),
                json.dumps(lesson_content.get("comparisons", {})),
                lesson_content.get("exam_notes", ""),
                json.dumps(lesson_content.get("short_questions", [])),
                json.dumps(lesson_content.get("long_questions", [])),
                lesson_content.get("revision_summary", ""),
                json.dumps(lesson_content.get("simplified_mode", {}))
            ))

            cursor.execute("""
            INSERT INTO quizzes (id, topic_id, course_id, title, questions_json)
            VALUES (?, ?, ?, ?, ?)
            """, (f"quiz_{topic_id}", topic_id, course_id, f"Quiz: {t_title}", json.dumps(lesson_content.get("quiz", []))))
            conn.commit()

        # Index chunks for RAG
        index_course_chunks(course_id, raw_units, unit_label)

        cursor.execute("""
        UPDATE courses 
        SET total_slides_or_pages = total_slides_or_pages + ?,
            processed_slides_or_pages = processed_slides_or_pages + ?,
            status = 'ready',
            status_message = ?,
            progress_percent = 100
        WHERE id = ?
        """, (len(raw_units), len(raw_units), f"Ready! Added {len(extracted_topics)} topics from {original_filename}.", course_id))
        conn.commit()

    except Exception as e:
        import traceback
        traceback.print_exc()
        cursor.execute("UPDATE courses SET status = 'ready', status_message = ? WHERE id = ?",
                       (f"Warning: {str(e)}", course_id))
        conn.commit()
    finally:
        conn.close()

@router.post("/{course_id}/sessions/{session_id}/upload")
async def upload_session_file(
    course_id: str,
    session_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload PPTX or PDF directly to a session."""
    filename = file.filename or "unknown_file"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pptx", ".pdf"]:
        raise HTTPException(status_code=400, detail="Only .pptx and .pdf files are supported.")
    
    file_type = "pptx" if ext == ".pptx" else "pdf"
    saved_file_name = f"{session_id}_{uuid.uuid4().hex[:6]}_{filename}"
    saved_file_path = os.path.join(UPLOAD_DIR, saved_file_name)

    with open(saved_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    background_tasks.add_task(
        process_session_document_pipeline,
        course_id, session_id, saved_file_path, file_type, filename
    )

    return {
        "message": f"File '{filename}' received. Processing topics into session.",
        "course_id": course_id,
        "session_id": session_id,
        "filename": filename
    }

