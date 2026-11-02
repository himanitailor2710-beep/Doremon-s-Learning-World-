import sqlite3
conn = sqlite3.connect('backend/doraemon_study.db')
c = conn.cursor()
tables = [t[0] for t in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print('Tables:', tables)
courses = c.execute("SELECT id, title, filename, status FROM courses").fetchall()
print('Courses:', courses)
conn.close()
