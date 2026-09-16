CREATE TABLE IF NOT EXISTS video_projects (id TEXT PRIMARY KEY, visitor_id TEXT NOT NULL, title TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS video_projects_owner ON video_projects(visitor_id,updated_at);
CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, visitor_id TEXT NOT NULL, summary TEXT NOT NULL, context TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL, digest TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(visitor_id,digest));
CREATE INDEX IF NOT EXISTS feedback_owner_date ON feedback(visitor_id,created_at);
CREATE INDEX IF NOT EXISTS feedback_review ON feedback(status,created_at);
