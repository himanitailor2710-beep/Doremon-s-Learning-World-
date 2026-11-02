"""
Database connection and schema initialization for Doraemon AI Study World.
Using SQLite with thread-safe connection pooling and JSON helpers.
"""
import sqlite3
import json
import os
from typing import Any, List, Dict, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "doraemon_study.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Courses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'processing',
        status_message TEXT DEFAULT 'Initializing...',
        progress_percent INTEGER DEFAULT 0,
        total_slides_or_pages INTEGER DEFAULT 0,
        processed_slides_or_pages INTEGER DEFAULT 0,
        coverage_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Course Documents table (Multi-PPT and Material Management)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_documents (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        session_id TEXT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        title TEXT NOT NULL,
        total_units INTEGER DEFAULT 0,
        topic_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ready',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Sessions / Chapters table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        description TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Topics table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        source_pages_json TEXT,
        summary TEXT,
        importance TEXT DEFAULT 'Medium',
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Lessons table (Deep educational content)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        topic_id TEXT UNIQUE NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        source_pages_json TEXT,
        simple_definition TEXT,
        easy_english TEXT,
        hinglish TEXT,
        step_by_step_json TEXT,
        key_points_json TEXT,
        real_life_examples_json TEXT,
        indian_examples_json TEXT,
        terminology_json TEXT,
        formulas_json TEXT,
        diagrams_json TEXT,
        comparisons_json TEXT,
        exam_notes TEXT,
        short_questions_json TEXT,
        long_questions_json TEXT,
        revision_summary TEXT,
        simplified_mode_json TEXT,
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Quizzes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        topic_id TEXT UNIQUE NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Quiz Attempts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        answers_json TEXT,
        xp_earned INTEGER DEFAULT 0,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # User Progress & Gamification table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY DEFAULT 'current_user',
        total_xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 1,
        last_active_date TEXT,
        completed_topics_json TEXT DEFAULT '[]',
        weak_topics_json TEXT DEFAULT '[]',
        badges_json TEXT DEFAULT '[]'
    );
    """)

    # Tutor Chat Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tutor_chats (
        id TEXT PRIMARY KEY,
        course_id TEXT,
        topic_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        citations_json TEXT,
        grounded_sources_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # App Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY DEFAULT 'global_settings',
        gemini_api_key TEXT DEFAULT '',
        openai_api_key TEXT DEFAULT '',
        active_provider TEXT DEFAULT 'gemini',
        model_name TEXT DEFAULT 'gemini-1.5-flash',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Document raw chunks for RAG
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        slide_or_page_number INTEGER NOT NULL,
        header TEXT,
        content TEXT NOT NULL,
        keywords_json TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Course Complete Summaries table (Part 6 & 8)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_summaries (
        id TEXT PRIMARY KEY,
        course_id TEXT UNIQUE NOT NULL,
        what_is_it_about TEXT,
        main_topics_json TEXT,
        what_will_learn_json TEXT,
        important_concepts_json TEXT,
        how_topics_connected_text TEXT,
        connections_json TEXT,
        understand_first_json TEXT,
        exam_points_json TEXT,
        conclusion TEXT,
        quick_summary TEXT,
        detailed_summary TEXT,
        mermaid_syntax TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # Student Profiles table (Part 2 & 16)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        total_xp INTEGER DEFAULT 150,
        level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 1,
        last_active_date TEXT,
        completed_topics_json TEXT DEFAULT '[]',
        weak_topics_json TEXT DEFAULT '[]',
        badges_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Initialize default student profile (Himani) if not exists
    cursor.execute("SELECT id FROM student_profiles WHERE id = 'student_himani'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO student_profiles (id, name, total_xp, level, current_streak, last_active_date, completed_topics_json, weak_topics_json, badges_json)
        VALUES ('student_himani', 'Himani', 150, 1, 1, date('now'), '[]', '[]', '["Novice Gadgeteer", "Pocket Explorer"]')
        """)

    # Initialize default user if not exists
    cursor.execute("SELECT id FROM user_progress WHERE id = 'current_user'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO user_progress (id, total_xp, level, current_streak, last_active_date, completed_topics_json, weak_topics_json, badges_json)
        VALUES ('current_user', 150, 1, 1, date('now'), '[]', '[]', '["Novice Gadgeteer", "Pocket Explorer"]')
        """)

    # Initialize default settings if not exists
    cursor.execute("SELECT id FROM app_settings WHERE id = 'global_settings'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO app_settings (id, gemini_api_key, openai_api_key, active_provider, model_name)
        VALUES ('global_settings', '', '', 'gemini', 'gemini-1.5-flash')
        """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
