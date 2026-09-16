"""Vendor two missing reference documents from the same licensed, pinned upstream revision."""
import pathlib,json,hashlib,zipfile,urllib.request
root=pathlib.Path(__file__).resolve().parents[1];path=root/'data/studio/skills.json'
catalog=json.loads(path.read_text(encoding='utf-8'));s=next(x for x in catalog if x['id']=='video')
folder=root/'data/sources/skills/video';(folder/'references').mkdir(exist_ok=True)
entry=(folder/'SKILL.md').read_text(encoding='utf-8')
for name in ['heygen','hyperframes']:
 url=f"https://raw.githubusercontent.com/coreyhaines31/marketingskills/{s['commit']}/tools/integrations/{name}.md"
 with urllib.request.urlopen(url,timeout=30) as response: content=response.read()
 assert len(content)<100000 and content.startswith(b'# ')
 (folder/f'references/{name}.md').write_bytes(content)
 entry=entry.replace(f'../../tools/integrations/{name}.md',f'references/{name}.md')
(folder/'SKILL.md').write_text(entry,encoding='utf-8')
s['edition']='adapted-documentation';s['review']='entrypoint-local-links-and-package-checked; external-ai-runtime-not-tested'
s['files']=[{'path':p.relative_to(folder).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(folder.rglob('*')) if p.is_file() and p.name!='manifest.json']
(folder/'manifest.json').write_text(json.dumps({k:v for k,v in s.items() if k not in ('download','sha256','bytes')},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
archive=root/'public/downloads/skills'/f"video-{s['commit'][:12]}-ame2.zip"
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(folder.rglob('*')):
  if p.is_file():
   info=zipfile.ZipInfo('video/'+p.relative_to(folder).as_posix(),(2026,9,16,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,p.read_bytes())
s.update(download='/downloads/skills/'+archive.name,sha256=hashlib.sha256(archive.read_bytes()).hexdigest(),bytes=archive.stat().st_size)
path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Repacked video Skill with both missing references; previous download retained.')
