"""Exercise real primary/backup downloads and unzip every pinned Skill package."""
import argparse,hashlib,io,json,pathlib,urllib.request,zipfile
p=argparse.ArgumentParser();p.add_argument('--origin',default='http://localhost:3000');p.add_argument('--rounds',type=int,default=2);args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
catalog=json.loads((root/'data/studio/skills.json').read_text(encoding='utf-8'))
checks=0
for attempt in range(args.rounds):
 for s in catalog:
  for origin in [args.origin.rstrip('/'),'https://raw.githubusercontent.com/zhufu0801-sudo/prompt-library/main/public']:
   req=urllib.request.Request(origin+s['download'],headers={'User-Agent':'AI-Made-Easy-download-test','Cache-Control':'no-cache'})
   with urllib.request.urlopen(req,timeout=30) as response:
    assert response.status==200
    body=response.read()
   assert len(body)==s['bytes'],s['id']+' size'
   assert hashlib.sha256(body).hexdigest()==s['sha256'],s['id']+' hash'
   with zipfile.ZipFile(io.BytesIO(body)) as z:
    assert z.testzip() is None,s['id']+' CRC'
    for name in z.namelist():assert not pathlib.PurePosixPath(name).is_absolute() and '..' not in pathlib.PurePosixPath(name).parts
    for name in ['SKILL.md','LICENSE','USAGE.zh.md','USAGE.en.md','USAGE.ja.md']:assert s['id']+'/'+name in z.namelist()
    for f in s['files']:assert hashlib.sha256(z.read(s['id']+'/'+f['path'])).hexdigest()==f['sha256']
   checks+=1
 print(f'Round {attempt+1}: {len(catalog)} Skills, primary + backup, bytes/hash/ZIP/content passed',flush=True)
print(f'PASS: {checks} real downloads')
