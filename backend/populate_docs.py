import sqlite3

conn = sqlite3.connect('backend/doraemon_study.db')
cursor = conn.cursor()

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

cursor.execute("SELECT id, filename, file_type, file_path, total_slides_or_pages FROM courses WHERE filename IS NOT NULL AND filename != ''")
rows = cursor.fetchall()
for row in rows:
    cid, fname, ftype, fpath, tunits = row
    tcount = cursor.execute("SELECT count(*) FROM topics WHERE course_id = ?", (cid,)).fetchone()[0]
    cursor.execute("""
    INSERT OR REPLACE INTO course_documents (id, course_id, filename, file_type, file_path, title, total_units, topic_count, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ready')
    """, (f"doc_{cid}", cid, fname, ftype, fpath, fname, tunits, tcount))

conn.commit()
docs = cursor.execute("SELECT id, course_id, filename, topic_count FROM course_documents").fetchall()
print("Populated course_documents:", docs)
conn.close()
