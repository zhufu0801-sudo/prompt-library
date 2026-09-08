import sqlite3,pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]
dbpath=root/'database/prompt-library.sqlite'
if dbpath.exists():
 import shutil
 shutil.copy2(dbpath,root/'database/prompt-library.previous.sqlite')
 dbpath.unlink()
db=sqlite3.connect(dbpath)
db.execute('PRAGMA foreign_keys=ON')
for p in sorted((root/'drizzle').glob('*.sql')):db.executescript(p.read_text(encoding='utf-8-sig'))
db.executescript((root/'database/seed.sql').read_text(encoding='utf-8'))
assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
db.execute('PRAGMA optimize')
print({table:db.execute('SELECT count(*) FROM '+table).fetchone()[0] for table in ['templates','categories','template_fields','field_suggestions','tags']})
print(db.execute("EXPLAIN QUERY PLAN SELECT * FROM templates WHERE category_id='programming' AND status='published'").fetchall())
db.close()
