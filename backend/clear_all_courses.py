import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "doraemon_study.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("DELETE FROM document_chunks")
c.execute("DELETE FROM quiz_attempts")
c.execute("DELETE FROM quizzes")
c.execute("DELETE FROM lessons")
c.execute("DELETE FROM topics")
c.execute("DELETE FROM sessions")
c.execute("DELETE FROM course_summaries")
c.execute("DELETE FROM courses")
conn.commit()

print("All sample courses cleared. Courses in DB:", c.execute("SELECT COUNT(*) FROM courses").fetchone()[0])
conn.close()
