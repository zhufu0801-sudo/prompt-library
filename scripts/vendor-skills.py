"""Pin GitHub instruction documents; never run upstream code or install dependencies."""
import json, pathlib, urllib.request, hashlib, zipfile
root=pathlib.Path(__file__).resolve().parents[1]
def fetch(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AI-Made-Easy-content-curation'}),timeout=30).read()
sources=[('systematic-debugging','obra/superpowers','b36e0829c6d0140e93cfef2ca599b1b07d4a7797','skills/systematic-debugging',['debug'],['系统排错','Systematic debugging','体系的デバッグ']),
 ('wps-formula','Bwkyd/wps-skills','50b04859b7768ed23477d7d2af9b8fb83b27adf3','skills/wps-formula',['wps-sheet'],['WPS 表格公式（适配版）','WPS formulas (adapted)','WPS数式（調整版）']),
 ('scientific-writing','K-Dense-AI/claude-scientific-skills','330c8e764435a731eff571e3efdda70b363d0792','skills/scientific-writing',['paper-outline','paper-draft','paper-format','paper-revise'],['科学论文写作','Scientific writing','科学論文執筆']),
 *[(name,'coreyhaines31/marketingskills','5b2c0007766c6a1cf1d53fd8fc73e979e0821022','skills/'+name,tasks,labels) for name,tasks,labels in [
 ('copywriting',['copy-product'],['网站与产品文案','Website and product copy','Web・商品コピー']),
 ('image',['image'],['营销图片工作流','Marketing image workflow','マーケティング画像制作']),
 ('video',['clip','storyboard'],['视频制作工作流','Video production workflow','動画制作ワークフロー'])]]]
catalog=[]
usage={
 'zh':'这是上游英文 Skill 的文档包，使用说明提供中英日版本；不含模型、API Key、脚本或软件安装。解压后，将对应 Skill 文件夹导入支持 SKILL.md 的 AI 工具；具体位置以该工具说明为准。普通聊天工具可打开 SKILL.md，将适用的指令与网站生成的提示词一同粘贴。指定用中文回答。先让 AI 列明缺少的资料与能力；没有文件或媒体工具时仅输出内容与步骤，不声称已经生成文件。上游提及的其他 Skill、脚本、工具集成不包含在本包中；需要时另行核对并安装。模型、价格、功能与命令须核对目标工具的官方文档。不要复制示例中的统计数字作为事实；不要输出密钥或环境变量。由使用者确认工具调用与费用。',
 'en':'This package contains the original English Skill documents, with instructions in Chinese, English and Japanese. It includes no model, API key, executable scripts or installer. Extract and import the Skill folder into a tool supporting SKILL.md, following that tool’s documented location. In a plain chat tool, paste the relevant instructions together with the generated prompt. Request an English answer. Ask the AI to identify missing inputs and capabilities first; without file/media tools, return content and steps without claiming files were generated. Referenced external skills, scripts and integrations are not bundled. Verify model capabilities, prices and commands against official documentation. Do not reuse example statistics as facts or print secrets/environment variables. Confirm tool actions and costs yourself.',
 'ja':'上流の英語 Skill 文書と、中国語・英語・日本語の使用説明を収録。モデル、APIキー、実行スクリプト、インストーラーは含みません。展開後、SKILL.md 対応ツールの公式手順でフォルダーを取り込んでください。通常のチャットでは必要な指示と生成したプロンプトを貼り付け、日本語での回答を指定します。まず不足資料と機能を確認し、ファイル・媒体操作ができなければ本文と手順を出し、生成済みとしないこと。参照先の外部Skill、スクリプト、連携機能は別途必要です。モデル・料金・機能・コマンドは公式文書で確認。例示の統計値を事実として転用せず、秘密情報や環境変数を出力しないこと。操作と費用は利用者が確認します。'}
for id,repo,commit,directory,tasks,labels in sources:
 base=f'https://raw.githubusercontent.com/{repo}/{commit}/'
 tree=json.loads(fetch(f'https://api.github.com/repos/{repo}/git/trees/{commit}?recursive=1'))['tree']
 paths=[x['path'] for x in tree if x['type']=='blob' and x['path'].startswith(directory+'/') and x['path'].endswith(('.md','.json','.csv'))]
 if id=='wps-formula':paths=[directory+'/SKILL.md']
 dest=root/'data/sources/skills'/id;dest.mkdir(parents=True,exist_ok=True)
 files=[]
 for path in paths:
  data=fetch(base+path)
  if id=='wps-formula':
   original=root/'data/sources/wps-formula-upstream';original.mkdir(parents=True,exist_ok=True);(original/'SKILL.md').write_bytes(data)
   data=(root/'data/skill-adaptations/wps-formula/SKILL.md').read_bytes()
  rel=path[len(directory)+1:];target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
  files.append({'path':rel,'sha256':hashlib.sha256(data).hexdigest()})
 license=fetch(base+('LICENSE.md' if repo.startswith('K-Dense-AI/') else 'LICENSE'));assert b'MIT License' in license
 (dest/'LICENSE').write_bytes(license)
 if id=='wps-formula':(root/'data/sources/wps-formula-upstream/LICENSE').write_bytes(license)
 entry={'id':id,'tasks':tasks,'labels':dict(zip(['zh','en','ja'],labels)),'repository':f'https://github.com/{repo}','source':f'https://github.com/{repo}/tree/{commit}/{directory}','commit':commit,'license':'MIT','language':'en','edition':'upstream-documentation','review':'source-and-license-checked; not-runtime-tested','usage':usage,'files':files}
 if id=='wps-formula':
  entry['edition']='adapted-documentation'
  entry['usage']={l:body.replace({'zh':'这是上游英文 Skill 的文档包','en':'This package contains the original English Skill documents','ja':'上流の英語 Skill 文書'}[l],{'zh':'这是根据上游中文内容整理的英文适配 Skill 文档包；已移除笼统的函数版本断言','en':'This package contains an English adaptation of the Chinese upstream Skill, with blanket function-version claims removed','ja':'上流の中国語Skillを英語に調整し、一律の関数バージョン断定を除いた文書'}[l]) for l,body in usage.items()}
 for l,body in entry['usage'].items(): (dest/f'USAGE.{l}.md').write_text(f'# {entry["labels"][l]}\n\n{body}\n\nSource: {entry["source"]}\n\nCommit: {commit}\nLicense: MIT\n',encoding='utf-8')
 (dest/'manifest.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 name=f'{id}-{commit[:12]}.zip';archive=root/'public/downloads/skills'/name;archive.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted(dest.rglob('*')):
   if p.is_file():
    info=zipfile.ZipInfo(id+'/'+p.relative_to(dest).as_posix(),(2026,9,14,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,p.read_bytes())
 entry['download']='/downloads/skills/'+name;entry['sha256']=hashlib.sha256(archive.read_bytes()).hexdigest();entry['bytes']=archive.stat().st_size
 catalog.append(entry)
(root/'data/studio/skills.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Packaged documentation Skills:',[(x['id'],x['bytes']) for x in catalog])
