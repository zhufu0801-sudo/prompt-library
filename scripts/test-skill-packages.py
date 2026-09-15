"""Offline entrypoint/resource regression checks for every advertised Skill ZIP."""
import hashlib, json, pathlib, re, zipfile
root=pathlib.Path(__file__).resolve().parents[1]
catalog=json.loads((root/'data/studio/skills.json').read_text(encoding='utf-8'))
for skill in catalog:
    prefix=skill['id']+'/'
    with zipfile.ZipFile(root/'public'/skill['download'].lstrip('/')) as z:
        names=set(z.namelist())
        entry=z.read(prefix+'SKILL.md').decode('utf-8-sig').replace('\r\n','\n')
        assert entry.startswith('---\n'),skill['id']+' frontmatter'
        frontmatter=entry.split('---',2)[1]
        assert re.search(r'^name:\s*'+re.escape(skill['id'])+r'\s*$',frontmatter,re.M)
        assert re.search(r'^description:\s*\S',frontmatter,re.M)
        assert z.testzip() is None
        manifest=json.loads(z.read(prefix+'manifest.json'))
        assert manifest['edition']==skill['edition']
        for item in skill['files']:
            assert hashlib.sha256(z.read(prefix+item['path'])).hexdigest()==item['sha256']
        for target in re.findall(r'\]\(([^)]+)\)',entry):
            target=target.split('#')[0]
            if target and '://' not in target and not target.startswith('../'):
                assert prefix+target in names,(skill['id'],'missing linked file',target)
        for target in re.findall(r'\b(?:python3?\s+)(scripts/[\w./-]+\.py)',entry):
            assert prefix+target in names,(skill['id'],'missing executable',target)
        if 'Complete terms in LICENSE.txt' in entry:
            assert z.read(prefix+'LICENSE.txt')==z.read(prefix+'LICENSE')
        if skill['id']=='scientific-writing':
            assert 'Instruction-only adaptation' in entry
            assert not re.search(r'^python3?\s',entry,re.M)
        for locale in ('zh','en','ja'):
            assert skill['usage'][locale] in z.read(prefix+f'USAGE.{locale}.md').decode('utf-8-sig').replace('\r\n','\n')
    print('PASS:',skill['id'],'entrypoint, references, license, usage, manifest and hashes')
print('PASS: all 8 local packages')
