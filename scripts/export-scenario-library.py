"""Export an editable content database. It contains no user plans or credentials."""
import pathlib,json,csv,io,sqlite3,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
read=lambda s:json.loads((root/s).read_text(encoding='utf-8'))
manifest=read('data/sources/prompts-chat/manifest.json')
csv.field_size_limit(10000000)
raw=(root/'data/sources/prompts-chat/prompts.csv').read_bytes()
assert hashlib.sha256(raw).hexdigest()==manifest['sha256']
rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
scenarios=read('data/studio/scenarios.json')+read('data/studio/prompts-chat-curated.json')
drafts=read('data/research-library/prompts-chat-drafts.json')
db=sqlite3.connect(root/'database/scenario-library.sqlite')
db.execute('PRAGMA foreign_keys=ON')
db.executescript('''
CREATE TABLE IF NOT EXISTS source_prompts(source_id TEXT PRIMARY KEY,title TEXT NOT NULL,body TEXT NOT NULL,contributor TEXT,media_type TEXT,source_commit TEXT NOT NULL,license TEXT NOT NULL,review_status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS topics(id TEXT PRIMARY KEY,parent_id TEXT REFERENCES topics(id));
CREATE TABLE IF NOT EXISTS scenarios(id TEXT PRIMARY KEY,topic_id TEXT REFERENCES topics(id),status TEXT NOT NULL CHECK(status IN ('published','draft')),source_id TEXT REFERENCES source_prompts(source_id),terms_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS scenario_localizations(scenario_id TEXT REFERENCES scenarios(id),locale TEXT CHECK(locale IN ('zh','en','ja')),title TEXT NOT NULL,prompt TEXT NOT NULL,example TEXT NOT NULL,PRIMARY KEY(scenario_id,locale));
''')
reviewed={s['source']['recordIndex'] for s in scenarios if 'source' in s}|{s['source']['recordIndex'] for s in drafts}
with db:
 for i,r in enumerate(rows): db.execute('INSERT OR REPLACE INTO source_prompts VALUES(?,?,?,?,?,?,?,?)',(f'pc-{i}',r['act'],r['prompt'],r['contributor'],r['type'],manifest['commit'],'CC0-1.0','adapted' if i in reviewed else 'unreviewed'))
 for id in ['programming','visual','writing','translation','education','research','work','content']: db.execute('INSERT OR IGNORE INTO topics VALUES(?,NULL)',(id,))
 for id,parent in [('build','programming'),('debug','programming'),('review','programming'),('image','visual'),('clip','visual'),('storyboard','visual')]: db.execute('INSERT OR IGNORE INTO topics VALUES(?,?)',(id,parent))
 for s in scenarios:
  db.execute('INSERT INTO scenarios VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET topic_id=excluded.topic_id,status=excluded.status,source_id=excluded.source_id,terms_json=excluded.terms_json',(s['id'],s['task'],'published',f"pc-{s['source']['recordIndex']}" if 'source' in s else None,json.dumps(s['terms'],ensure_ascii=False)))
  for l in ['zh','en','ja']: db.execute('INSERT OR REPLACE INTO scenario_localizations VALUES(?,?,?,?,?)',(s['id'],l,s['labels'][l],s['details'][l],s.get('examples',{}).get(l,'')))
 for s in drafts:
  db.execute('INSERT INTO scenarios VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET topic_id=excluded.topic_id,status=excluded.status,source_id=excluded.source_id',(s['id'],s['category'],'draft',f"pc-{s['source']['recordIndex']}",'[]'))
  for l,v in s['localizations'].items(): db.execute('INSERT OR REPLACE INTO scenario_localizations VALUES(?,?,?,?,?)',(s['id'],l,v['title'],v['prompt'],''))
assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
assert db.execute('SELECT count(*) FROM scenario_localizations').fetchone()[0]==84
print({t:db.execute('SELECT count(*) FROM '+t).fetchone()[0] for t in ['source_prompts','topics','scenarios','scenario_localizations']})
db.close()
