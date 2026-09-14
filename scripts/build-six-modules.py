"""Editable editorial source for the additional module tasks; preserves legacy IDs."""
import json,pathlib,copy
p=pathlib.Path(__file__).resolve().parents[1]
read=lambda f:json.loads((p/f).read_text(encoding='utf-8'))
write=lambda f,x:(p/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
loc=lambda x:dict(zip(['zh','en','ja'],x))
tasks=[]
def task(id,group,labels,terms,details,examples,questions):
 tasks.append(dict(id=id,group=group,labels=loc(labels),terms=terms.split('|'),guidance=loc(details),examples=loc(examples),questions=loc(questions)))
task('wps-writing','office',['WPS 文字','WPS Writer','WPS 文書'],'通知|报告|排版|writer|document|文書',[
 '根据已有事实直接交付完整文稿，再列标题层级、段落、页码、目录与排版步骤。保留人名、金额和日期；未确认内容标注待补。按实际WPS版本说明操作，不虚构菜单；不默认付费功能可用。',
 'Deliver the complete document from supplied facts, followed by heading, paragraph, page-number, contents and layout steps. Preserve names, amounts and dates; mark unknowns. Match instructions to the actual WPS version without inventing menus or assuming paid features.',
 '提供事実から文書全文を作り、見出し、段落、ページ番号、目次、レイアウト手順を示す。名前、金額、日付を保持し、不明は要確認とする。WPSの実際の版に合わせ、有料機能やメニューを決めつけない。'],[
 '在WPS文字制作会议通知，含时间、地点、议程和参会要求。','Create a meeting notice in WPS Writer with time, place, agenda and attendance requirements.','WPSで日時、場所、議題、参加条件を含む会議案内を作る。'],[
 '文稿给谁看、用于什么场合？有哪些必须保留的事实？','Who will read this document, for what purpose, and which facts must stay?','読者、用途、必ず保持する事実は何ですか？'])
task('wps-sheet','office',['WPS 表格','WPS Spreadsheets','WPS 表計算'],'公式|汇总|透视表|spreadsheet|formula|集計|数式',[
 '先确认表头、样例数据和统计口径。输出可粘贴公式、目标单元格、填充方向、引用规则和预期值；区分空值、零值、重复与日期文本。根据WPS版本选择公式或透视表，提供不支持新函数时的替代。没有文件或计算工具时不得声称已算出真实结果。',
 'Establish headers, sample data and aggregation rules. Supply paste-ready formulas, destination cells, fill direction, references and expected values. Distinguish blanks, zero, duplicates and text dates. Choose formulas/pivots for the WPS version and offer compatible alternatives. Do not claim actual calculations without data and execution.',
 '列名、サンプル、集計条件を確認し、貼付可能な数式、入力セル、コピー方向、参照規則、期待値を示す。空白、ゼロ、重複、文字列日付を分ける。WPS版に応じて数式やピボットを選び、非対応関数の代替を出す。未実行の実測値を捏造しない。'],[
 '按月份和地区汇总销售额，列为日期、地区、金额，并制作柱状图。','Summarize sales by month and region from Date, Region, Amount and plan a bar chart.','日付・地域・金額の列から月別地域別に集計し、棒グラフを作る。'],[
 '请提供表头和两行脱敏示例，以及希望得到的结果。','Provide column headers, two anonymized rows and the desired result.','列名、匿名化した2行、求める結果を教えてください。'])
task('wps-slides','office',['WPS 演示','WPS Presentation','WPS プレゼン'],'ppt|演示|汇报|presentation|slide|スライド',[
 '先确定听众、目的、页数与演讲时长。逐页输出标题、核心结论、可用正文、图表需求、版式和讲稿；每页一个重点。用提供的数据支持结论，未知数字标待补。说明WPS内的制作与导出步骤，不声称已生成文件。',
 'Confirm audience, purpose, slide count and talk duration. Deliver each slide’s title, takeaway, usable copy, visual brief, layout and speaker notes, one point per slide. Use supplied evidence and mark missing numbers. Give WPS assembly/export steps without claiming a file was produced.',
 '聴衆、目的、枚数、発表時間を定め、各ページの題、要点、本文、図表、配置、話す内容を出す。1枚1論点とし、提供データで支え、不明な数値は補足待ちにする。WPSでの制作・出力手順を示す。'],[
 '制作8页季度工作汇报，演讲10分钟，包含成果、问题和下季度计划。','Draft an eight-slide quarterly review for a ten-minute talk.','10分発表用の四半期報告を8枚で作る。'],[
 '听众是谁？需要几页、讲多久？有哪些真实成果资料？','Who is the audience, how many slides/minutes, and what evidence is available?','聴衆、枚数・時間、実績資料は何ですか？'])
task('wps-pdf','office',['WPS PDF','WPS PDF','WPS PDF'],'pdf|扫描|ocr|扫描件|スキャン',[
 '先区分文字PDF和扫描PDF，明确提取、转换、批注或排版检查目标。只依据已提供内容处理，OCR不确定字符注明页码待核对。保护表格、单位、脚注和页序；转换后列出核对项目。操作和会员限制以当前版本为准，不绕过文件权限，不声称看过未提供的PDF。',
 'Distinguish text and scanned PDFs and clarify extraction, conversion, annotation or layout review. Use only supplied content; flag uncertain OCR with page references. Preserve tables, units, notes and order; list post-conversion checks. Respect version/features and document permissions; never claim to inspect missing files.',
 'テキストPDFかスキャンかを分け、抽出・変換・注釈・配置確認の目的を定める。提供内容だけを扱い、OCR不確実箇所をページ付きで示す。表、単位、注、順序を保ち、変換後の確認事項を出す。版と権限を尊重する。'],[
 '把扫描PDF中的表格整理为可粘贴到WPS表格的内容，标出不确定字符。','Extract a scanned PDF table into paste-ready spreadsheet content with uncertain characters flagged.','スキャンPDFの表をWPSに貼れる形で整理し、不確実な文字を示す。'],[
 'PDF是扫描件还是可选中文字？希望提取、转换还是检查？','Is the PDF scanned or selectable text, and what operation is needed?','スキャンか選択可能な文字か、どの処理が必要ですか？'])
task('wps-cloud','office',['云文档协作','Cloud document collaboration','クラウド文書の共同編集'],'协作|共享|权限|collaboration|share|共同編集',[
 '按参与者角色定义只读、评论、编辑权限及版本流程。给出共享、评论处理、冲突解决和恢复步骤，菜单按实际产品核对。默认最小权限，敏感内容不建议公开链接；仅提供操作方案，不声称已修改共享权限。',
 'Map participants to view/comment/edit roles and a version process. Provide sharing, comment resolution, conflict and recovery steps with product-specific menus to verify. Prefer least privilege and avoid public links for sensitive material. Provide guidance, not claims of changed permissions.',
 '参加者を閲覧・コメント・編集に分け、版管理を定める。共有、コメント解決、競合、復元手順を示し、実製品でメニューを確認する。権限は最小にし、機密文書を公開リンクにしない。変更済みと装わない。'],[
 '设计三人共同编辑报告的流程，经理审核，外部人员只能查看。','Plan a three-person report workflow with manager approval and view-only external access.','3人の報告書共同編集、上司承認、外部は閲覧のみの流れを作る。'],[
 '谁需要查看、评论或编辑？使用WPS云文档还是金山文档？','Who needs view/comment/edit access, and which WPS cloud product is used?','誰が閲覧・コメント・編集し、どのクラウド製品を使いますか？'])
task('copy-product','copy',['产品与品牌文案','Product and brand copy','商品・ブランドコピー'],'产品|卖点|品牌|product|brand|商品',[
 '依据受众、使用场合和经过确认的卖点生成可直接使用的文案，结构为标题、利益点、证据、异议回应、行动引导。给长短两个版本及替代标题；不编造销量、评价、认证或效果保证，未知信息单独标注。避免同一套夸张措辞用于所有产品。',
 'Write usable copy for the audience/channel using verified benefits: headline, value, evidence, objections and call to action. Give short/long versions and alternative headlines. Never invent sales, testimonials, certifications or guarantees. Flag missing facts and tailor tone to the product.',
 '対象と媒体に合わせ、確認済みの価値から見出し、利点、根拠、疑問への回答、行動案内を作る。長短版と別見出しを出す。売上、評価、認証、効果を捏造せず、商品に合わせる。'],[
 '为轻便通勤背包写官网介绍，只使用我提供的容量、重量和材质。','Write website copy for a commuter backpack using only supplied capacity, weight and material.','提供した容量・重量・素材だけで通勤リュックの紹介を書く。'],[
 '目标读者、发布渠道和已确认的卖点是什么？','Who is the audience, where will this appear, and which benefits are verified?','対象読者、掲載先、確認済みの特徴は何ですか？'])
task('copy-social','copy',['社交媒体与活动文案','Social and campaign copy','SNS・キャンペーン文章'],'小红书|公众号|社交|活动|social|campaign|SNS',[
 '按平台、受众和目标输出标题、开头、完整正文、配图需求、行动引导及话题建议。区分活动时间、规则、价格等事实与创意；提供不同语气的两个版本。适配字数，不伪装真实用户经历，不自动发布。',
 'Deliver platform-specific headlines, hook, full copy, visual brief, CTA and topic ideas. Separate facts such as dates/rules/prices from creative choices. Provide two tone variants within length limits, without fabricated user experiences or automatic publication.',
 '媒体と読者に合わせ、見出し、導入、全文、画像案、行動案内、話題を出す。日時・条件・価格と創作を分け、字数内で語調2案を作る。体験談の捏造や自動投稿はしない。'],[
 '为书店周末读书活动写公众号推文，保留真实时间和报名规则。','Write a social post for a bookstore weekend reading event with verified dates and signup rules.','書店の週末読書会のSNS文を、実際の日時と参加条件で作る。'],[
 '发布在哪个平台？面向谁？活动或内容的真实资料是什么？','Which platform/audience, and what verified event or content details are available?','媒体・読者と実際のイベント資料は何ですか？'])
task('copy-script','copy',['广告与短视频脚本','Ads and short-video scripts','広告・短尺動画の台本'],'广告|口播|脚本|ad script|voiceover|台本',[
 '按总时长逐段写画面、口播、字幕、音效与行动引导；核对口播长度是否可在时限内表达。明确前三秒吸引点与中段证据，提供替代开头。产品功效与价格只能引用确认资料，不把夸张视觉当实测效果。',
 'Write timed visuals, voiceover, captions, sound and CTA. Check spoken length against duration, define the opening hook and supporting evidence, and offer alternate openings. Use confirmed product claims/prices; distinguish creative visuals from measured results.',
 '尺ごとに映像、口播、字幕、音、行動案内を書き、読み時間を確認する。冒頭の引きと根拠、別の導入案を出す。効果と価格は確認資料のみを使い、演出を実測と混同しない。'],[
 '写30秒咖啡馆介绍短视频脚本，突出安静环境和手冲服务。','Write a 30-second café introduction highlighting a quiet setting and pour-over coffee.','静かな環境とハンドドリップを紹介する30秒のカフェ台本を書く。'],[
 '视频多长？面向谁？必须出现哪些真实信息？','How long is the video, who is it for, and what facts must appear?','尺、対象、必須の事実は何ですか？'])
task('paper-outline','paper',['论文提纲与写作计划','Paper outline and writing plan','論文構成と執筆計画'],'提纲|结构|选题|outline|structure|構成',[
 '结合论文类型、学科、研究问题和已有资料，给出章节层级、每节论点、证据需求、预计字数和写作顺序。区分综述、实证与毕业论文，不强套同一结构。列出资料缺口，不编造文献、数据或已完成实验。',
 'Use paper type, discipline, question and available evidence to deliver sections, claims, evidence needs, word budgets and writing order. Distinguish reviews, empirical papers and theses. List evidence gaps without inventing citations, data or completed experiments.',
 '論文種別、分野、問い、資料から章節、論点、根拠、字数配分、執筆順を出す。レビュー・実証・学位論文を分け、資料不足を示す。文献や実験を捏造しない。'],[
 '根据我提供的研究问题和资料，制作6000字毕业论文提纲。','Create an outline for a 6,000-word thesis from my question and evidence.','研究の問いと資料から6000語の論文構成を作る。'],[
 '论文类型、专业、主题、字数与已有资料是什么？','What are the paper type, discipline, topic, word limit and available materials?','種類、分野、主題、字数、資料は何ですか？'])
task('paper-draft','paper',['章节成稿与摘要','Sections and abstract drafting','章本文と要旨の作成'],'正文|摘要|结论|章节|abstract|draft|要旨|本文',[
 '仅用提供或核实的资料完成指定章节或摘要，区分资料中的结果、解释和写作建议。每个事实性主张对应资料编号，缺证据使用待补标记；方法不得写成未实施的实验，结论不得超过结果支持。输出可用初稿、引用位置与待确认清单，不用虚构引用补齐篇幅。',
 'Draft the requested section or abstract only from supplied/verified material. Separate results, interpretation and writing suggestions; map factual claims to source IDs and mark evidence gaps. Never describe unperformed experiments or overstate conclusions. Deliver a usable draft, citation locations and confirmation list without fabricated references.',
 '提供・確認済み資料だけで指定章や要旨を書く。結果、解釈、提案を分け、事実主張に資料IDを付け、不足を示す。未実施実験や根拠を超える結論を作らず、初稿、引用箇所、確認一覧を出す。'],[
 '根据提供的研究方法和结果表，撰写摘要，不增加实验或数值。','Draft an abstract from supplied methods/results without adding experiments or numbers.','方法と結果表から、実験や数値を足さず要旨を書く。'],[
 '要写哪一部分？请提供可引用的原始资料和真实结果。','Which section is needed? Supply citable materials and actual findings.','どの部分を書くか、引用可能な資料と実際の結果を教えてください。'])
task('paper-format','paper',['引用、图表与论文排版','Citations, figures and formatting','引用・図表・論文書式'],'参考文献|排版|图表|citation|formatting|引用|書式',[
 '按学校或期刊模板检查标题层级、编号、页码、图表题注、交叉引用和参考文献。保留源文献元数据，缺作者、年份或DOI时标待核实，不生成看似真实的条目。给WPS或指定编辑器的操作步骤，字体、间距、引用样式以提供规范为准。',
 'Check headings, numbering, pages, captions, cross-references and bibliography against the institution/journal template. Preserve metadata and flag missing authors/year/DOI rather than inventing entries. Give WPS or requested-editor steps, following supplied typography and citation requirements.',
 '提出先規定に従い見出し、番号、ページ、図表説明、相互参照、文献を確認する。著者・年・DOI不足は要確認とし、文献を作らない。WPS等の操作と提供された書式規定を使う。'],[
 '按学校模板整理WPS毕业论文目录、图表编号和参考文献。','Format a thesis in WPS using the school template, including contents, figures and references.','学校指定書式でWPS論文の目次・図表番号・参考文献を整える。'],[
 '请提供学校或期刊格式要求，以及编辑器和现有文献列表。','Provide formatting requirements, editor and existing bibliography.','提出先の規定、編集ソフト、既存文献一覧をください。'])
task('paper-revise','paper',['润色、翻译与修改回复','Revision, translation and responses','推敲・翻訳・修正回答'],'润色|翻译|审稿|修改|revise|translate|reviewer|推敲',[
 '保留原文事实、术语和研究边界，优化表达与衔接；翻译遵循术语表。按导师或审稿意见逐条给修改、位置和回应，无法完成的要求说明缺少什么，不声称完成未做的实验。提供修订稿与实质修改表，不改变统计含义。',
 'Preserve facts, terms and study limits while improving language and flow; follow a glossary for translation. Address each comment with revision, location and response. Explain missing work instead of claiming unperformed experiments. Provide revised text and a substantive change table without changing statistical meaning.',
 '事実、用語、研究限界を保ち表現と接続を改善し、翻訳は用語集に従う。各指摘に修正・位置・回答を示し、未実施実験を完了扱いしない。修正文と変更表を出し、統計の意味を変えない。'],[
 '依据导师的三条意见修改讨论部分，保留真实数据与引用。','Revise the discussion against three supervisor comments, preserving data and citations.','指導教員の3点の指摘に沿って考察を直し、データと引用を保つ。'],[
 '请提供原文、修改意见和不可改变的术语或结论。','Provide the original, comments and terms/conclusions that must remain.','原文、指摘、変更できない用語・結論をください。'])
write('data/studio/extended-tasks.json',tasks)
moduleInfo={
 'office':('custom-office','office',['WPS Office 办公助手','WPS Office assistant','WPS Office アシスタント'],['文字、表格、演示、PDF与云文档协作。','Writer, spreadsheets, slides, PDF and collaboration.','文書・表計算・スライド・PDF・共同編集。']),
 'copy':('custom-copy','marketing',['文案创作','Copywriting','コピー・文章制作'],['按平台、受众与真实卖点制作可用文案。','Usable copy for your audience, channel and verified benefits.','媒体・読者・確認済み情報に合わせた文章。']),
 'paper':('custom-paper-writing','study',['论文写作与制作','Paper writing and production','論文執筆・制作'],['从资料到章节、摘要、引用与排版。','From evidence to sections, abstracts, citations and formatting.','資料から章本文・要旨・引用・書式まで。'])}
for l in ['zh','en','ja']:
 ts=read(f'data/studio/{l}.json')
 for t in ts:t['fields']=[f for f in t['fields'] if f['key']!='skill_id']
 prog=ts[0];anim=next(t for t in ts if t['id']=='custom-animation')
 image=copy.deepcopy(next((t for t in ts if t['id']=='custom-image'),anim))
 image.update(id='custom-image',slug='image-assistant',title=loc(['AI 图片制作','AI image creation','AI画像制作'])[l],description=loc(['构图、风格与角色场景一致性。','Composition, style and character/scene consistency.','構図・画風・人物と場面の一貫性。'])[l])
 image['tags']=loc([['构图','光线','材质','主体一致'],['Composition','Lighting','Materials','Subject consistency'],['構図','光','質感','被写体の一貫性']])[l]
 anim['title']=loc(['AI 动画制作','AI animation creation','AIアニメ制作'])[l]
 anim['description']=loc(['单镜头视频、景别与连续分镜。','Single-shot video, framing and storyboards.','単一カット動画・景別・絵コンテ。'])[l]
 for t,ids in [(image,['image']),(anim,['clip','storyboard'])]:
  f=next(f for f in t['fields'] if f['key']=='medium');f['options']=[g['labels'][l] for g in read('data/studio/task-guides.json') if g['id'] in ids];f['defaultValue']=f['options'][0]
 new=[prog,anim,image]
 for group,(id,cat,titles,desc) in moduleInfo.items():
  t=copy.deepcopy(prog);t.update(id=id,slug=id.removeprefix('custom-')+'-assistant',categoryId=cat,title=loc(titles)[l],description=loc(desc)[l],tags=[g['labels'][l] for g in tasks if g['group']==group],version=1)
  labels=loc([
   ['任务类型','细分场景','使用的AI工具','你的需求','使用环境与对象','输出偏好','重点','已有资料','验收或格式要求','限制与补充'],
   ['Task','Scenario','AI tool','Your goal','Environment and audience','Output preference','Focus','Available materials','Acceptance or format','Constraints'],
   ['タスク','場面','AIツール','目的','環境・対象','出力の希望','重点','提供資料','完成・書式条件','制約・補足']])[l]
  bykey=dict(zip(['task','scenario','tool','subject','audience','style','keywords','materials','criteria','constraints'],labels))
  for f in t['fields']:
   f['label']=bykey[f['key']];f.pop('conditionalOptions',None);f['options']=[];f['defaultValue']=[] if f['type']=='multi' else '';f['required']=f['key']=='subject'
  field=lambda k:next(f for f in t['fields'] if f['key']==k)
  field('task')['options']=[x['labels'][l] for x in tasks if x['group']==group];field('task')['defaultValue']=field('task')['options'][0]
  field('scenario')['options']=[loc(['自动匹配','Automatic match','自動照合'])[l]];field('scenario')['defaultValue']=field('scenario')['options'][0]
  field('tool')['options']=[loc(['通用对话AI','General chat AI','汎用対話AI'])[l]];field('tool')['defaultValue']=field('tool')['options'][0]
  if group=='office':field('audience')['defaultValue']=loc(['WPS Office 国内电脑版；版本待补充','WPS Office China desktop; version to specify','中国版WPS Office PC版、バージョン未指定'])[l]
  head=loc(['根据具体任务交付可使用的内容。','Deliver usable content for this specific task.','具体的なタスクに使える内容を作成する。'])[l]
  t['content']=head+'\n\n'+'\n'.join(f['label']+': {{'+f['key']+'}}' for f in t['fields'])+'\n\n[[TASK_GUIDE]]\n\n---META---\n\n'+loc(['信息足够时直接交付完整初稿。只追问影响结果的关键缺项，不重复询问已提供的信息。未知事实明确标记，不编造来源、数据、软件功能或执行结果。保护原始资料，并说明验证步骤。','Deliver a complete first draft when information is sufficient. Ask only about essential gaps; do not repeat supplied information. Mark unknowns and never invent sources, data, software capabilities or execution results. Preserve source material and explain verification.','情報が足りれば初稿を完成させる。重要な不足だけ質問し、既出情報を繰り返し聞かない。不明を明記し、資料、数値、機能、実行結果を捏造しない。原資料を保ち確認手順を示す。'])[l]
  new.append(t)
 for t in new:
  t['fields']=[f for f in t['fields'] if f['key']!='skill_id']
  t['fields'].append(dict(key='skill_id',label='Skill',type='text',required=False,options=[],defaultValue='',maxSelections=1))
 write(f'data/studio/{l}.json',new)
