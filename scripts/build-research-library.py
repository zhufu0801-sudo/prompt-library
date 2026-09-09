"""Build an offline, unpublished multilingual editorial library. No live DB writes."""
import json, sqlite3, hashlib, re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
base=root/'data/research-library'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
rules=read(base/'locale-rules.json')
source={l:read(base/'upstream'/('prompt_'+code+'.json')) for l,code in [('zh','zh-Hans'),('en','en'),('ja','ja')]}
codes={'zh':'zh-Hans','en':'en','ja':'ja'}
ids={l:{x['id'] for x in a} for l,a in source.items()}
assert ids['zh']==ids['en']==ids['ja'], 'Language IDs differ'
tags=read(base/'tags.json')
tag_ids={x['id'] for x in tags}
records=[]
for l,items in source.items():
 for row in items:
  localized=row[codes[l]]
  body=localized['prompt'] if l=='en' else localized['description']
  assert localized['title'].strip() and body.strip()
  assert set(row['tags'])<=tag_ids
  # A policy is an editable wrapper; upstream text remains available verbatim.
  optimized=rules[l]['before']+'\n\n'+body+'\n\n'+rules[l]['after']
  records.append({'id':'aishort-'+str(row['id']),'locale':l,'title':localized['title'],'summary':localized.get('remark',''),'tags':row['tags'],'sourceBody':body,'editorialPrompt':optimized,'sourceUrl':row.get('website'),'status':'draft','review':'imported-with-locale-policy; individual-review-pending','version':1})
(base/'entries.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
db=sqlite3.connect(root/'database/research-library.sqlite')
db.execute('PRAGMA foreign_keys=ON')
db.executescript("""
CREATE TABLE IF NOT EXISTS research_tags(id TEXT PRIMARY KEY, labels_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS research_prompts(id TEXT PRIMARY KEY, source_url TEXT, status TEXT NOT NULL CHECK(status='draft'));
CREATE TABLE IF NOT EXISTS research_prompt_tags(prompt_id TEXT REFERENCES research_prompts(id),tag_id TEXT REFERENCES research_tags(id),PRIMARY KEY(prompt_id,tag_id));
CREATE TABLE IF NOT EXISTS research_localizations(prompt_id TEXT REFERENCES research_prompts(id),locale TEXT CHECK(locale IN ('zh','en','ja')),title TEXT NOT NULL,summary TEXT,source_body TEXT NOT NULL,editorial_prompt TEXT NOT NULL,review TEXT,version INTEGER,PRIMARY KEY(prompt_id,locale));
""")
with db:
 for tag in tags:
  db.execute('INSERT OR REPLACE INTO research_tags VALUES (?,?)',(tag['id'],json.dumps(tag['labels'],ensure_ascii=False)))
 for record in records:
  db.execute("INSERT INTO research_prompts VALUES (?,?,'draft') ON CONFLICT(id) DO UPDATE SET source_url=excluded.source_url",(record['id'],record['sourceUrl']))
  for tag in record['tags']:db.execute('INSERT OR IGNORE INTO research_prompt_tags VALUES (?,?)',(record['id'],tag))
  db.execute('INSERT INTO research_localizations VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(prompt_id,locale) DO UPDATE SET title=excluded.title,summary=excluded.summary,source_body=excluded.source_body,editorial_prompt=excluded.editorial_prompt,review=excluded.review,version=excluded.version',(record['id'],record['locale'],record['title'],record['summary'],record['sourceBody'],record['editorialPrompt'],record['review'],record['version']))
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
assert not db.execute('PRAGMA foreign_key_check').fetchall()
assert db.execute('SELECT count(*) FROM research_localizations').fetchone()[0]==len(records)
assert not db.execute('SELECT prompt_id FROM research_localizations GROUP BY prompt_id HAVING count(*)<>3').fetchall()
db.close()
manifest={'source':'https://github.com/rockbenben/ChatGPT-Shortcut','commit':'1db7679dc07c2633188990442c48d1e9c3bcfd52','license':'MIT; see licenses/aishort-MIT.txt','importedAt':'2026-09-09','prompts':len(ids['zh']),'localizedEntries':len(records),'tags':len(tags),'public':False,'review':'Locale policies applied; individual quality and model-output review pending','sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (base/'upstream').glob('*.json')}}
(base/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'prompts':manifest['prompts'],'localizedEntries':len(records),'tags':len(tags),'integrity':'ok','public':False}))
