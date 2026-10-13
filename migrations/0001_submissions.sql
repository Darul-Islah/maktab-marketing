-- Form submissions from the marketing site (contact and waitlist), kept even if an email fails.
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'waitlist')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS submissions_created ON submissions (created_at);
