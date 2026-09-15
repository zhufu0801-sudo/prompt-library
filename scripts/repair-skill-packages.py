"""Apply reviewed local adaptations and deterministically repack changed Skills."""
import hashlib, json, pathlib, zipfile
root = pathlib.Path(__file__).resolve().parents[1]
catalog_path = root / 'data/studio/skills.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
for entry in catalog:
    if entry['id'] not in ('scientific-writing', 'frontend-design'):
        continue
    folder = root / 'data/sources/skills' / entry['id']
    if entry['id'] == 'scientific-writing':
        original = root / 'data/sources/scientific-writing-upstream/SKILL.md'
        original.parent.mkdir(parents=True, exist_ok=True)
        if not original.exists():
            original.write_bytes((folder / 'SKILL.md').read_bytes())
        (folder / 'SKILL.md').write_bytes((root / 'data/skill-adaptations/scientific-writing/SKILL.md').read_bytes())
        entry['edition'] = 'adapted-documentation'
        entry['labels'] = {'zh':'科学论文写作（无脚本适配版）','en':'Scientific writing (instruction-only)','ja':'科学論文執筆（スクリプト不要版）'}
        notes = {
            'zh':'本包为无脚本适配版：按用户资料整理结构、正文、图表说明和审稿回复。入口不依赖 Python 或其他 Skill；参考文档中的上游命令不适用于本包。证据核验需要原始资料或目标 AI 的检索能力，不能凭此保证论文事实或投稿合规。',
            'en':'Instruction-only adaptation for outlines, drafts, captions and reviewer responses. The entrypoint needs no Python or external Skill. Upstream commands in reference documents are outside this edition. Evidence verification requires original sources or research tools; this does not certify factual accuracy or submission compliance.',
            'ja':'構成・本文・図表説明・査読回答を扱うスクリプト不要の調整版です。入口はPythonや外部Skillに依存しません。参考文書の上流コマンドは本版の対象外です。証拠確認には原資料や検索機能が必要で、事実や投稿規則への適合を保証しません。'}
        for locale, note in notes.items():
            # Replace prior general description with accurate edition-specific usage.
            entry['usage'][locale] = note + '\n\n' + {'zh':'解压后导入支持 SKILL.md 的工具；普通聊天中粘贴 SKILL.md 和网站生成的提示词，并附可分享的研究资料。请指定回答语言。不包含模型或生成文件的工具。','en':'Extract into a tool supporting SKILL.md, or paste SKILL.md and your generated prompt into chat with shareable research material. Specify the response language. No model or file-generation tools are included.','ja':'展開してSKILL.md対応ツールに導入するか、文書と生成したプロンプトを共有可能な研究資料とともにチャットへ貼り付けてください。回答言語を指定してください。モデルやファイル生成機能は含みません。'}[locale]
            (folder / f'USAGE.{locale}.md').write_text(f"# {entry['labels'][locale]}\n\n{entry['usage'][locale]}\n\nSource: {entry['source']}\nCommit: {entry['commit']}\nLicense: {entry['license']}\n", encoding='utf-8')
    else:
        (folder / 'LICENSE.txt').write_bytes((folder / 'LICENSE').read_bytes())
    entry['files'] = [{'path':p.relative_to(folder).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(folder.rglob('*')) if p.is_file() and p.name != 'manifest.json']
    entry['review'] = 'entrypoint-dependencies-and-package-checked; external-ai-runtime-not-tested'
    (folder / 'manifest.json').write_text(json.dumps({k:v for k,v in entry.items() if k not in ('download','sha256','bytes')},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    archive = root / 'public/downloads/skills' / f"{entry['id']}-{entry['commit'][:12]}-ame1.zip"
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(folder.rglob('*')):
            if p.is_file():
                info=zipfile.ZipInfo(entry['id']+'/'+p.relative_to(folder).as_posix(),(2026,9,15,0,0,0))
                info.compress_type=zipfile.ZIP_DEFLATED
                z.writestr(info,p.read_bytes())
    entry.update(download='/downloads/skills/'+archive.name,sha256=hashlib.sha256(archive.read_bytes()).hexdigest(),bytes=archive.stat().st_size)
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Repacked scientific-writing and frontend-design; old download URLs preserved.')
