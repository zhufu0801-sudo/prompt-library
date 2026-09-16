"""Build a public, reproducible package audit. Static checks are not host runtime certification."""
import hashlib,json,pathlib,re,zipfile,posixpath
root=pathlib.Path(__file__).resolve().parents[1]
skills=json.loads((root/'data/studio/skills.json').read_text(encoding='utf-8'))
reports={}
for s in skills:
 path=root/'public'/s['download'].lstrip('/');blob=path.read_bytes()
 assert len(blob)==s['bytes'] and hashlib.sha256(blob).hexdigest()==s['sha256'],s['id']
 with zipfile.ZipFile(path) as z:
  names=set(z.namelist());assert z.testzip() is None
  assert len(names)==len(z.namelist()),'duplicate ZIP entries'
  for name in names:
   assert '\\' not in name and not name.startswith('/') and '..' not in pathlib.PurePosixPath(name).parts,name
  prefix=s['id']+'/'
  for name in ['SKILL.md','LICENSE','USAGE.zh.md','USAGE.en.md','USAGE.ja.md','manifest.json']: assert prefix+name in names
  entry=z.read(prefix+'SKILL.md').decode('utf-8-sig')
  links=[]
  for target in re.findall(r'\]\(([^)]+)\)',entry):
   target=target.split('#')[0]
   if target and not re.match(r'^[a-z]+:',target):
    resolved=posixpath.normpath(prefix+target)
    if resolved not in names: links.append(target)
  scripts=[n[len(prefix):] for n in names if n.endswith(('.py','.js','.sh','.ps1','.mjs'))]
  reports[s['id']]={'checkedAt':'2026-09-16','archiveHash':s['sha256'],'archiveIntegrity':'passed','requiredFiles':'passed','entrypointLocalLinks':'passed' if not links else 'requires-external-files','externalLinks':links,'bundledExecutables':scripts,'runtime':'not-tested-in-target-ai','edition':s['edition']}
out=root/'data/studio/skill-audit.json';out.write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(root/'public/downloads/skill-audit.json').write_bytes(out.read_bytes())
print('Audited',len(reports),'packages; external entrypoint links:',sum(bool(x['externalLinks']) for x in reports.values()))
