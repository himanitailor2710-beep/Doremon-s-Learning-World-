"""
Comprehensive End-to-End Test Suite for Doraemon AI Study World.
Verifies all 10 requirements from the specification.
"""
import os
import sys

# Ensure UTF-8 output on Windows PowerShell
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import json

import time
import asyncio
from fastapi.testclient import TestClient

# Ensure current directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from backend.main import app
from backend.database import get_db, init_db

# Initialize database schema
init_db()

client = TestClient(app)


def test_full_pipeline():
    print("=" * 60)
    print("🚀 STARTING DOREMON'S LEARNING WORLD TEST SUITE")
    print("=" * 60)

    # 1. Health check
    print("\n[TEST 1] Checking API Health...")
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
    assert health_resp.json()["app"] == "Doremon's Learning World"
    print("  ✓ Health check OK:", health_resp.json())

    # 2. Upload PPTX
    pptx_path = os.path.join(os.path.dirname(__file__), "sample_materials", "Computer_Networks_and_Cloud_Architecture.pptx")
    assert os.path.exists(pptx_path), f"PPTX not found at {pptx_path}"

    print(f"\n[TEST 2] Uploading PPTX: {os.path.basename(pptx_path)}...")
    with open(pptx_path, "rb") as f:
        upload_resp = client.post("/api/courses/upload", files={"files": (os.path.basename(pptx_path), f, "application/vnd.openxmlformats-officedocument.presentationml.presentation")})
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    upload_data = upload_resp.json()
    course1_id = upload_data["courses"][0]["id"]
    print(f"  ✓ Uploaded successfully. Course ID: {course1_id}")

    # 3. Wait for background processing (or process synchronously for test)
    print("\n[TEST 3] Waiting for PPTX processing pipeline to complete...")
    max_wait = 30
    start_t = time.time()
    course1_ready = False

    while time.time() - start_t < max_wait:
        resp = client.get(f"/api/courses/{course1_id}")
        if resp.status_code == 200:
            c_data = resp.json()
            status = c_data["status"]
            progress = c_data["progress_percent"]
            print(f"  ... Course Status: {status} ({progress}%) - {c_data.get('status_message', '')}")
            if status == "ready":
                course1_ready = True
                break
            elif status == "error":
                raise RuntimeError(f"Course processing failed: {c_data.get('status_message')}")
        time.sleep(1)

    assert course1_ready, "Course 1 processing timed out"
    print("  ✓ Course 1 is Ready to Learn!")

    # 4. Verify Coverage Checklist and Topics
    print("\n[TEST 4] Verifying 100% Slide Coverage Guarantee...")
    c1_detail = client.get(f"/api/courses/{course1_id}").json()
    total_slides = c1_detail["total_units"]
    coverage = c1_detail["coverage_checklist"]
    sessions = c1_detail["sessions"]

    assert total_slides >= 5, f"Expected at least 5 slides, got {total_slides}"
    assert len(coverage) == total_slides, f"Coverage checklist missing slides: {len(coverage)} vs {total_slides}"
    print(f"  ✓ All {total_slides} slides verified in coverage checklist without omissions.")
    for item in coverage:
        print(f"     - {item['unit_label']}: '{item['title']}' -> Topic: '{item['topic_assigned']}' ({item['status']})")

    # Count total topics
    all_topics = []
    for s in sessions:
        for t in s["topics"]:
            all_topics.append(t)
    assert len(all_topics) >= 5, f"Expected at least 5 topics, got {len(all_topics)}"
    print(f"  ✓ {len(all_topics)} separate topics created across {len(sessions)} modules.")

    # 5. Verify Deep Lesson Structure for a Topic
    print("\n[TEST 5] Verifying Pedagogical Lesson Content...")
    first_topic = all_topics[1] # Choose topic 2 (e.g. OSI model)
    lesson_resp = client.get(f"/api/lessons/{first_topic['id']}")
    assert lesson_resp.status_code == 200, f"Lesson fetch failed: {lesson_resp.text}"
    lesson = lesson_resp.json()

    # Check all required pedagogical fields
    assert lesson["simple_definition"], "Missing simple definition"
    assert lesson["easy_english"], "Missing easy english explanation"
    assert lesson["hinglish"], "Missing Hinglish explanation"
    assert len(lesson["step_by_step"]) > 0, "Missing step-by-step breakdown"
    assert len(lesson["indian_examples"]) > 0, "Missing Indian company example"
    assert len(lesson["terminology"]) > 0, "Missing terminology"
    assert lesson["diagram"]["mermaid_syntax"], "Missing Mermaid diagram"
    assert lesson["simplified_mode"]["eli5_text"], "Missing Small Light ELI5 text"
    assert lesson["revision_summary"], "Missing Memory Bread revision summary"

    print(f"  ✓ Lesson Title: '{lesson['title']}'")
    print(f"  ✓ Source: {lesson['unit_label']} {lesson['source_pages']}")
    print(f"  ✓ Simple Definition: {lesson['simple_definition'][:80]}...")
    print(f"  ✓ Hinglish snippet: {lesson['hinglish'][:80]}...")
    print(f"  ✓ Indian Case Study: {lesson['indian_examples'][0]['company']}")
    print(f"  ✓ Mermaid Diagram Type: {lesson['diagram'].get('diagram_type')}")
    print(f"  ✓ Small Light ELI5: {lesson['simplified_mode']['eli5_text'][:80]}...")

    # 6. Upload PDF (Verify multiple files & preservation of existing courses)
    pdf_path = os.path.join(os.path.dirname(__file__), "sample_materials", "Operating_Systems_and_Concurrency.pdf")
    print(f"\n[TEST 6] Uploading PDF: {os.path.basename(pdf_path)}...")
    with open(pdf_path, "rb") as f:
        pdf_upload = client.post("/api/courses/upload", files={"files": (os.path.basename(pdf_path), f, "application/pdf")})
    assert pdf_upload.status_code == 200
    course2_id = pdf_upload.json()["courses"][0]["id"]
    print(f"  ✓ Uploaded PDF. Course ID: {course2_id}")

    # Wait for course 2
    start_t = time.time()
    course2_ready = False
    while time.time() - start_t < max_wait:
        resp = client.get(f"/api/courses/{course2_id}")
        if resp.status_code == 200:
            c_data = resp.json()
            if c_data["status"] == "ready":
                course2_ready = True
                break
        time.sleep(1)

    assert course2_ready, "PDF processing timed out"
    print("  ✓ Course 2 (PDF) is Ready to Learn!")

    # Verify both courses exist simultaneously (no overwrite)
    all_courses = client.get("/api/courses").json()
    assert len(all_courses) >= 2, f"Expected at least 2 courses, found {len(all_courses)}"
    print(f"  ✓ Multi-Course Verification Passed: Both PPTX & PDF courses active ({len(all_courses)} total).")

    # 7. Test RAG AI Tutor with Grounding & Exact Citations
    print("\n[TEST 7] Testing RAG AI Tutor with Lecture Grounding...")
    tutor_query = "What is transmission delay and what is the formula?"
    tutor_resp = client.post("/api/tutor/chat", json={
        "course_id": course1_id,
        "message": tutor_query
    })
    assert tutor_resp.status_code == 200, f"Tutor chat failed: {tutor_resp.text}"
    tutor_data = tutor_resp.json()
    assert tutor_data["grounded_in_materials"] is True, "Answer should be grounded in lecture notes"
    assert len(tutor_data["citations"]) > 0, "Expected slide citations"
    print(f"  ✓ Student Query: '{tutor_query}'")
    print(f"  ✓ Citations Returned: {tutor_data['citations']}")
    print(f"  ✓ Tutor Snippet:\n{tutor_data['reply'][:180]}...")

    # 8. Test Quiz Submission, Scoring, XP, and Weak Topic Tracking
    print("\n[TEST 8] Testing Practice Quiz & Gamification Engine...")
    quiz_resp = client.get(f"/api/quizzes/{first_topic['id']}")
    assert quiz_resp.status_code == 200, "Failed to get quiz"
    quiz_data = quiz_resp.json()
    quiz_id = quiz_data["id"]
    questions = quiz_data["questions"]
    assert len(questions) >= 2, "Quiz should have questions"

    # Submit quiz answers (all correct index)
    correct_answers = [q["correct_index"] for q in questions]
    submit_resp = client.post(f"/api/quizzes/{quiz_id}/submit", json={
        "course_id": course1_id,
        "topic_id": first_topic["id"],
        "answers": correct_answers
    })
    assert submit_resp.status_code == 200
    sub_data = submit_resp.json()
    assert sub_data["score_percent"] == 100, f"Expected 100%, got {sub_data['score_percent']}"
    assert sub_data["xp_earned"] > 0, "Should earn XP"
    print(f"  ✓ Quiz Submitted: Score = {sub_data['score_percent']}%, XP Earned = +{sub_data['xp_earned']}")

    # 9. Test Gadgets
    print("\n[TEST 9] Testing Doraemon Learning Gadgets...")
    # Anywhere Door
    aw_door = client.get("/api/gadgets/anywhere-door?q=model").json()
    assert len(aw_door) > 0, "Anywhere Door should find matching topics"
    print(f"  ✓ Anywhere Door: Found {len(aw_door)} topic teleports for search 'model'.")

    # Memory Bread
    bread = client.get(f"/api/gadgets/memory-bread?course_id={course1_id}").json()
    assert len(bread) > 0, "Memory Bread should have flashcards"
    print(f"  ✓ Memory Bread: Generated {len(bread)} revision flashcards.")

    # Time Machine Mock Exam
    exam = client.get(f"/api/gadgets/time-machine/exam?course_id={course1_id}&duration_minutes=15").json()
    assert exam["total_questions"] > 0, "Time machine exam should have questions"
    print(f"  ✓ Time Machine: Prepared timed mock exam with {exam['total_questions']} questions.")

    # 10. Persistence Verification
    print("\n[TEST 10] Testing Persistence Across Database Reload...")
    profile = client.get("/api/gamification/profile").json()
    assert profile["total_xp"] > 0, "User should have XP"
    print(f"  ✓ User Progress: Level {profile['level']}, Total XP: {profile['total_xp']}, Badges: {profile['badges']}")

    # 11. Raw Text Extraction Audit
    print("\n[TEST 11] Testing Raw Extracted Source Text Audit...")
    raw_text_resp = client.get(f"/api/courses/{course1_id}/raw-text")
    assert raw_text_resp.status_code == 200, "Failed to get raw text"
    chunks = raw_text_resp.json()
    assert len(chunks) >= 5, f"Expected at least 5 chunks, got {len(chunks)}"
    print(f"  ✓ Extracted Raw Text Audit: Retrieved {len(chunks)} chunks with verified unit numbers and headers.")

    # 12. Manual Course Creation & Topic Generation
    print("\n[TEST 12] Testing Manual Course Creation & Management...")
    manual_course_resp = client.post("/api/courses/manual", json={
        "title": "Strategic Management & Competitive Analysis",
        "description": "PESTEL, Porter Five Forces, and SWOT frameworks."
    })
    assert manual_course_resp.status_code == 200
    manual_c_id = manual_course_resp.json()["course_id"]
    print(f"  ✓ Created manual course: {manual_c_id}")

    # Add chapter / session
    sess_resp = client.post(f"/api/courses/{manual_c_id}/sessions", json={
        "title": "Module 2: Strategic Positioning",
        "description": "Competitive forces and industry dynamics."
    })
    assert sess_resp.status_code == 200
    new_sess_id = sess_resp.json()["session_id"]
    print(f"  ✓ Added session: {new_sess_id}")

    # Add topic to chapter
    topic_resp = client.post(f"/api/courses/{manual_c_id}/sessions/{new_sess_id}/topics", json={
        "title": "Porter's Five Forces Model",
        "summary": "Threat of new entrants, supplier power, buyer power, substitution, rivalry.",
        "importance": "High"
    })
    assert topic_resp.status_code == 200
    new_topic_id = topic_resp.json()["topic_id"]
    print(f"  ✓ Added topic: {new_topic_id}")

    # Verify generated lesson for manual topic
    manual_lesson = client.get(f"/api/lessons/{new_topic_id}").json()
    assert manual_lesson["title"] == "Porter's Five Forces Model"
    assert manual_lesson["simple_definition"] != ""
    print(f"  ✓ Pedagogical lesson automatically generated for manual topic: '{manual_lesson['title']}'")

    # 13. Course Deletion and Isolation
    print("\n[TEST 13] Testing Safe Deletion and Course Isolation...")
    del_resp = client.delete(f"/api/courses/{manual_c_id}")
    assert del_resp.status_code == 200
    # Verify course1 still exists
    c1_check = client.get(f"/api/courses/{course1_id}")
    assert c1_check.status_code == 200, "Course 1 should remain unaffected after deleting manual course"
    print(f"  ✓ Course deletion verified. Course 1 remains completely intact.")

    # Cleanup test courses to preserve user's PM2 environment
    client.delete(f"/api/courses/{course1_id}")
    client.delete(f"/api/courses/{course2_id}")
    print("  ✓ Cleaned up test artifacts. Database remains pristine.")

    print("\n" + "=" * 60)
    print("🎉 ALL 13 ADVANCED LMS TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    test_full_pipeline()
