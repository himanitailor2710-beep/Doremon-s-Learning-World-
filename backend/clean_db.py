import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "doraemon_study.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("DELETE FROM courses WHERE id = 'course_b145959057'")
c.execute("DELETE FROM sessions WHERE course_id = 'course_b145959057'")
c.execute("DELETE FROM topics WHERE course_id = 'course_b145959057'")
c.execute("DELETE FROM lessons WHERE course_id = 'course_b145959057'")
c.execute("DELETE FROM quizzes WHERE course_id = 'course_b145959057'")
conn.commit()

courses = c.execute("SELECT id, title, filename FROM courses").fetchall()
print("Courses in DB:", courses)
conn.close()
