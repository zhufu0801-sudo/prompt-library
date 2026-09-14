"""Original, localized task guidance for previously hidden subject areas."""
import pathlib,json,copy
root=pathlib.Path(__file__).resolve().parents[1]
def read(p):return json.loads((root/p).read_text(encoding='utf-8-sig'))
def write(p,v):
 target=root/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def loc(a):return dict(zip(['zh','en','ja'],a))
tasks=[]
def task(id,group,labels,terms,guidance,examples,questions):
 tasks.append(dict(id=id,group=group,labels=loc(labels),terms=terms.split('|'),guidance=loc(guidance),examples=loc(examples),questions=loc(questions)))
task('article-structure','writing',['文章结构与成稿','Article structure and draft','記事構成と執筆'],'文章|长文|article|essay|記事|文章',[
 '明确读者、主题、立场和篇幅。先建立中心论点及段落的证据关系，再交付标题、导语、完整正文与结尾；每节解决一个读者问题。将资料中的事实与作者观点分开，不编造采访、数字或引用。没有资料时提供标注待核实处的初稿，避免以空泛框架代替正文。',
 'Define audience, topic, position and length. Connect the central claim to evidence in each section, then deliver a headline, opening, complete body and ending; answer one reader question per section. Separate facts from opinions. Do not invent interviews, numbers or quotes. Mark evidence gaps in the draft rather than supplying only an abstract outline.',
 '読者・主題・立場・分量を定め、中心主張と各段落の根拠を結ぶ。見出し、導入、本文、結びまで作り、各節は一つの疑問に答える。事実と意見を区別し、取材・数字・引用を捏造しない。不足資料は確認箇所として本文に明記する。'],[
 '根据我的三条观察写一篇800字远程工作文章，读者是新入职员工。','Write an 800-word remote-work article for new employees using my three observations.','私の3つの観察から、新入社員向けにリモートワークの記事を書く。'],[
 '读者、核心观点、篇幅和可使用的资料是什么？','Who will read it, what is the main point, and what length and sources are available?','読者、主張、分量、使える資料は何ですか？'])
task('document-proposal','writing',['说明文档与提案','Documentation and proposals','説明文書・提案'],'文档|提案|说明|proposal|documentation|specification|提案書|仕様書',[
 '围绕文档要促成的决定组织背景、问题、目标、方案、取舍、执行步骤和验收条件。先提炼已提供信息，只追问决定结构的缺项。交付可阅读的完整草稿，标明假设、负责人待定项和待确认日期。最后从未参与讨论的读者角度列出歧义与补充建议，不声称已由他人审阅。',
 'Organize context, problem, goals, proposal, tradeoffs, execution and acceptance around the decision the document supports. Use existing inputs before asking about structural gaps. Deliver a readable draft with assumptions, unassigned owners and unconfirmed dates marked. Check ambiguity from a new reader’s perspective without claiming another person reviewed it.',
 '促したい意思決定に沿って背景・課題・目標・案・比較・実行・完成条件を構成する。既存資料を先に利用し重要な不足だけ確認。仮定、担当未定、未確認日付を明記した草稿を出し、初見の読者に不明な点を点検する。第三者レビュー済みとしない。'],[
 '为团队写知识库改版提案，目标是让新人更容易找到操作说明。','Draft a team knowledge-base redesign proposal to help new hires find instructions.','新人が手順を探しやすくなる社内ナレッジ改修提案を書く。'],[
 '文档的读者、要做出的决定和已有约束是什么？','Who is the reader, what decision is needed, and what constraints exist?','読者、必要な判断、既存制約を教えてください。'])
task('lesson-plan','learning',['课程与教案','Lessons and teaching plans','授業・指導案'],'教案|课程|lesson|teaching|授業|指導案',[
 '依据学习者基础和课时设定可观察的学习目标。输出导入、讲解、示例、练习、检查和收尾的分段流程，每段标明时间、教师动作和学生产出。为不同基础提供支架与拓展题，给出参考答案及误区说明，不用难度标签代替真实题目。',
 'Set observable objectives from learner background and lesson length. Provide timed opening, explanation, examples, practice, assessment and closure with teacher actions and learner outputs. Include support and extension activities, actual questions, answers and common misconceptions.',
 '前提知識と授業時間から観察可能な目標を立てる。導入・説明・例・練習・確認・まとめに時間、教員の動き、学習者の成果を添える。補助と発展課題、具体的な問題、解答、誤解しやすい点を出す。'],[
 '设计一节40分钟的初中一次函数入门课，含练习和答案。','Design a 40-minute introductory lesson on linear functions with exercises and answers.','一次関数入門の40分授業を、練習と解答付きで設計する。'],[
 '学生年龄、基础、学习目标和可用课时是多少？','What are the learner age, background, goals and available time?','年齢、前提知識、目標、授業時間は？'])
task('study-practice','learning',['学习计划与练习','Study plans and practice','学習計画・演習'],'复习|练习|学习计划|study plan|practice|revision|復習|演習',[
 '把目标拆成先修知识和可完成的小任务，按可用时间安排复习与间隔练习。用诊断题确定起点，给出题目、解析和检查标准；不会的题先给逐级提示，再给答案。安排复盘与调整规则，不承诺固定时间一定达成成绩。',
 'Break the goal into prerequisites and manageable tasks, with revision and spaced practice within the time budget. Provide diagnostic questions, worked explanations and checking criteria. Offer progressive hints before answers, plus review and adjustment rules without guaranteed score claims.',
 '目標を前提知識と小課題に分け、時間内に復習と間隔練習を配置する。診断問題、解説、確認基準を出し、解けない場合は段階的ヒントから解答へ進める。振り返りと調整方法を示し点数を保証しない。'],[
 '我每天有30分钟，帮我安排两周Python基础复习并给出每日练习。','Plan two weeks of Python revision with daily exercises in 30 minutes a day.','1日30分で2週間のPython基礎復習と毎日の演習を作る。'],[
 '你的基础、目标、每天时间和最困难的部分是什么？','What is your baseline, goal, daily time and hardest topic?','現在の理解、目標、毎日の時間、苦手分野は？'])
task('translation-context','language',['语境翻译','Context-aware translation','文脈に沿う翻訳'],'翻译|translation|translate|翻訳',[
 '先确认源语言、目标语言、用途和读者，依据语境保留专有名词、数字、单位及原意。输出自然译文与必要的术语表，歧义处列出可选译法和原因。代码、变量、链接与占位符原样保留；不擅自增删承诺、义务或事实。',
 'Identify source/target language, purpose and audience. Preserve names, numbers, units and meaning in context. Deliver natural target-language text and a useful glossary; explain alternatives for ambiguity. Keep code, variables, links and placeholders unchanged and never add promises, obligations or facts.',
 '原言語・訳先・用途・読者を確認し、固有名詞、数値、単位、意味を保つ。自然な訳と必要な用語集を出し、曖昧な箇所は選択肢と理由を示す。コード、変数、リンク、プレースホルダーは変えず、約束や事実を加えない。'],[
 '把产品说明翻译成自然日文，保留型号、尺寸和保修期限。','Translate product instructions into natural Japanese, preserving model, dimensions and warranty.','商品説明を自然な英語に訳し、型番・寸法・保証期間を保つ。'],[
 '请提供原文、目标语言、用途和必须保持一致的术语。','Provide source text, target language, purpose and required terms.','原文、訳先、用途、統一する用語をください。'])
task('language-dialogue','language',['语言会话练习','Conversation practice','会話練習'],'口语|会话|dialogue|conversation|speaking|会話|発音',[
 '按语言水平与真实场景设计可轮流进行的对话。每轮只推进一个交流目标，允许用户先回答；纠错时保留原意，给自然表达与简短原因。总结可复用句型和下一轮练习，不冒称能听到未提供的录音或评定真实发音。',
 'Create turn-by-turn practice at the learner’s level in a real scenario. Pursue one communication goal per turn and let the learner respond. Correct without changing intended meaning, explain briefly, and summarize reusable phrases. Do not claim to hear missing audio or assess actual pronunciation from text alone.',
 'レベルと実場面に合う交互の会話練習を作る。各ターン一つの目的で学習者の返答を待つ。意図を保って自然な表現と短い理由を示し、使える型と次の練習をまとめる。未提供音声を聞いたり文字だけで発音を判定したりしない。'],[
 '陪我练习英文酒店入住，我是初学者，每轮只问一个问题。','Practice hotel check-in English with me as a beginner, one question per turn.','初級者向けにホテルのチェックイン英会話を一問ずつ練習する。'],[
 '练习语言、水平和希望模拟的场景是什么？','Which language, level and situation should we practice?','言語、レベル、練習する場面は？'])
task('daily-plan','life',['日常安排','Daily planning','日々の予定'],'日程|待办|daily plan|schedule|予定|タスク',[
 '结合固定事项、可用时间、精力和优先级排出可执行日程，留出通勤与缓冲。区分必须完成和可延期事项，遇到时间冲突提出替代方案。提供清单和简单复盘，不假设已经建立提醒或读取用户日历。',
 'Build a feasible schedule from fixed commitments, time, energy and priorities, allowing travel and buffers. Separate essentials from deferrable tasks and propose alternatives for conflicts. Supply a checklist and review method without claiming calendar access or created reminders.',
 '固定予定、時間、体力、優先度から移動と余裕を含む実行可能な予定を作る。必須と延期可能を分け、重複に代案を出す。チェックリストと振り返りを添え、カレンダー取得や通知登録済みとしない。'],[
 '工作日晚上有两小时，安排学习、整理房间和休息，留出缓冲。','Plan study, tidying and rest within two evening hours, including buffers.','平日夜の2時間に学習・片付け・休憩を余裕付きで配置する。'],[
 '固定安排、可用时间和今天最重要的事项是什么？','What commitments, time budget and top priority should be used?','固定予定、使える時間、最優先事項は？'])
task('travel-outline','life',['出行规划','Trip planning','旅行の計画'],'旅行|出行|trip|travel|旅行|旅程',[
 '先确认目的地、日期、出发点、同行需求和预算范围，按区域串联路线而不是堆砌景点。列出交通方式、每日节奏、雨天替代及待核实事项；开放时间、票价、签证等变动信息要求查询官方来源并注明日期，没有查询能力时明确未核实，不做虚假预订。',
 'Confirm destination, dates, starting point, travelers and budget. Group routes geographically with transport, realistic pacing and bad-weather options. Verify changing hours, prices and entry rules using dated official sources; if browsing is unavailable, mark them unverified. Never claim bookings were made.',
 '行先、日程、出発地、同行者、予算を確認し、地域ごとに無理のない経路を組む。交通、日々の余裕、雨天代案を添える。営業時間・料金・入国条件は日付付き公式情報で確認し、検索不可なら未確認と明示。予約済みとしない。'],[
 '安排三天京都慢节奏旅行，少换酒店，交通和开放时间列为待核实。','Outline three relaxed Kyoto days, minimizing hotel changes and flagging transport/hours to verify.','京都3日間をゆっくり回り、移動と営業時間の確認事項を示す。'],[
 '目的地、日期、预算和同行者的需求是什么？','What destination, dates, budget and traveler needs apply?','行先、日程、予算、同行者の要望は？'])
task('story-concept','creative',['故事与人物','Stories and characters','物語・登場人物'],'故事|人物|story|character|物語|登場人物',[
 '围绕人物目标、阻力、选择与代价设计原创故事，明确视角、时代和类型。给出人物动机、情节转折和具体场景草稿，让事件具有因果关系。区分世界观设定与已发生剧情，检查时间线和人物行为是否一致，避免用抽象主题代替情节。',
 'Build an original story around goals, obstacles, choices and consequences, with viewpoint, period and genre established. Deliver character motivations, turning points and a concrete scene draft linked causally. Separate world rules from events and check timeline and character consistency.',
 '人物の目的、障害、選択、代償から独自の物語を作り、視点・時代・ジャンルを定める。動機、転換点、具体的な場面草稿を因果で結び、設定と既成事実を区別し時間軸と行動を点検する。'],[
 '设计一个修钟师寻找失踪师傅的短篇故事，给人物动机和开场场景。','Develop a short story about a clockmaker searching for a missing mentor, with motivations and an opening scene.','行方不明の師匠を探す時計職人の短編を、動機と冒頭場面付きで作る。'],[
 '故事类型、读者、人物和必须保留的设定是什么？','What genre, audience, characters and fixed world details apply?','ジャンル、読者、人物、保つ設定は？'])
task('creative-brief','creative',['创意方向与设计简报','Creative directions and briefs','創作方針・デザインブリーフ'],'创意|设计简报|creative brief|concept|ブリーフ|コンセプト',[
 '将目标、受众、使用场合和限制整理成设计简报，提出三个差异明确的创意方向。每个方向写视觉语言、文字语气、关键元素、交付物和适用理由，再比较成本与风险。选择方向后给可执行步骤，不以堆砌风格词代替实际设计要求。',
 'Translate goals, audience, placement and constraints into a brief with three distinct directions. Specify visual language, voice, key elements, deliverables and rationale, then compare effort and risks. Turn the chosen direction into executable steps rather than a list of style adjectives.',
 '目的、対象、用途、制約から違いの明確な3方向を提案する。各方向に視覚言語、文章の声、要素、成果物、理由を添え、工数とリスクを比較。選んだ方向を実行手順にし、形容詞の羅列にしない。'],[
 '为社区读书会设计三个不同的活动视觉方向，预算低，适合印刷。','Propose three low-budget, print-friendly visual directions for a community book club.','地域読書会に低予算で印刷しやすい3つの視覚方針を提案する。'],[
 '目标受众、发布位置、品牌资料和交付规格是什么？','Who is it for, where will it appear, and what brand assets and output specifications exist?','対象、掲載場所、ブランド資料、納品仕様は？'])
task('business-compare','business',['竞品与商业分析','Competitive and business analysis','競合・事業分析'],'竞品|商业分析|competitor|business analysis|競合|事業分析',[
 '先定义比较对象、用户需求、时间范围和决策问题，按同一维度整理功能、价格、渠道和差异。给证据表、来源日期、假设和资料缺口；无依据的市场份额或营收不填假数。区分观察与推断，交付可验证的建议和下一步调研问题，不提供收益保证。',
 'Define alternatives, customer needs, period and decision. Compare features, prices, channels and differences consistently. Provide evidence, source dates, assumptions and gaps; never invent revenue or market share. Separate observation from inference and offer testable recommendations and research questions, not return guarantees.',
 '対象、顧客ニーズ、期間、判断事項を定め、機能・価格・経路・差異を同じ軸で比較する。根拠、日付、仮定、不足を示し、売上やシェアを捏造しない。観察と推論を分け、検証可能な提案と調査事項を出す。'],[
 '用我提供的三家产品资料做竞品对比，未知价格留空并标注来源。','Compare three products using supplied materials, leaving unknown prices unfilled and citing sources.','提供した3製品の資料で比較し、不明価格は空欄にして出典を示す。'],[
 '比较哪些对象、为谁决策、使用哪些已确认资料？','Which alternatives, decision-maker and verified sources should be used?','対象、判断する人、確認済み資料は？'])
task('content-roadmap','business',['内容策略与选题','Content strategy and topics','コンテンツ戦略・企画'],'内容策略|选题|content strategy|editorial calendar|コンテンツ戦略|編集計画',[
 '从业务目标、客户问题、已有内容和制作能力建立主题支柱。按搜索意图或分享价值给选题、目标读者、内容形式、证据需求、优先级和复用方法，安排可执行周期。设定验证指标而不承诺流量，避免同义选题重复；发布和外部推广留给用户确认。',
 'Build content pillars from business goals, customer questions, existing assets and capacity. For each topic, specify search intent or sharing value, audience, format, evidence needs, priority and reuse. Plan a feasible cadence with validation metrics rather than traffic guarantees; avoid duplicate topics and leave publishing to user approval.',
 '事業目標、顧客の疑問、既存資産、制作力から柱を作る。企画ごとに検索意図や共有価値、読者、形式、根拠、優先度、再利用を示す。実行可能な周期と検証指標を定め、流入を保証せず公開は利用者の判断に委ねる。'],[
 '为小型摄影工作室安排四周内容选题，每周两篇，复用现有案例。','Plan four weeks of content for a small photo studio, two pieces weekly using existing cases.','小さな写真スタジオに既存事例を使う週2本、4週間の企画を作る。'],[
 '业务目标、客户问题、已有内容和每周制作能力是什么？','What business goals, customer questions, existing content and weekly capacity apply?','事業目標、顧客の疑問、既存内容、週の制作能力は？'])
task('decision-options','thinking',['决策比较','Decision comparison','意思決定の比較'],'决策|利弊|decision|tradeoff|判断|比較',[
 '明确要决定的问题、可行选项和不可妥协的条件，先定义比较标准再评估。给出证据、权重可调整的比较表、机会成本和不确定性；信息不足时展示条件性结论及最值得补充的信息，不用虚构精确分数制造确定感。',
 'Define the decision, viable options and non-negotiables before selecting criteria. Provide evidence, adjustable weights, opportunity costs and uncertainty. With incomplete inputs, give conditional conclusions and the most valuable missing information rather than fabricated precise scores.',
 '判断事項、選択肢、譲れない条件を定めてから比較軸を作る。根拠、調整可能な重み、機会費用、不確実性を示す。不足時は条件付き結論と価値の高い追加情報を出し、精密な点数を捏造しない。'],[
 '比较自学和报名课程两种学习方式，以时间、预算和反馈速度为标准。','Compare self-study and a course by time, budget and feedback speed.','独学と講座を時間・予算・フィードバック速度で比較する。'],[
 '有哪些选项、硬性约束和最重要的评价标准？','What options, hard constraints and key criteria should be compared?','選択肢、必須条件、主要な評価軸は？'])
task('argument-check','thinking',['论证与表达检查','Argument and expression review','論証・表現の点検'],'论证|逻辑|argument|logic|論証|論理',[
 '提取主张、前提、证据和结论，检查概念是否一致、证据是否支持结论以及是否遗漏反例。用原文定位问题，区分事实错误、推理跳跃与措辞不清；给出保持原意的修订版和需要验证的问题，不把不同意见直接判为逻辑错误。',
 'Extract claims, premises, evidence and conclusions. Check consistent definitions, evidential support and counterexamples. Locate issues in the source, distinguish factual errors, inference gaps and unclear wording, and provide a meaning-preserving revision with verification questions. Disagreement alone is not a fallacy.',
 '主張・前提・根拠・結論を抽出し、定義の一貫性、支持関係、反例を点検する。原文箇所を示し、事実誤り・推論の飛躍・曖昧さを区別。意図を保つ修正文と検証事項を出し、異論を誤謬扱いしない。'],[
 '检查我这段关于远程办公的论证，指出证据不足处并保留原意改写。','Review my remote-work argument for evidence gaps and revise without changing the intended claim.','リモートワークの論証で根拠不足を指摘し、主張を保って直す。'],[
 '请提供原文、表达目的和必须保留的观点。','Provide the text, communication goal and points that must remain.','原文、表現の目的、残す主張をください。'])
task('frontend-ui','programming',['网页与界面设计','Frontend and UI design','フロントエンド・UI設計'],'网页|界面|UI|frontend|website|landing page|web page|画面|ウェブ',[
 '根据真实用户任务、内容、品牌与技术栈设计界面，先明确颜色、字体、间距和布局原则，再给可运行代码。确保搜索、表单、加载、空态、错误与键盘操作完整；考虑手机、长文本、三语长度及减少动效偏好。用少量有目的的视觉元素建立风格，不以装饰替代内容，附实际完成的验证与剩余限制。',
 'Design around real user tasks, content, brand and stack. Define color, type, spacing and layout before delivering runnable code. Cover search, forms, loading, empty/error states and keyboard use; test mobile widths, long content, language expansion and reduced motion. Use a few purposeful visual choices, with actual verification and remaining limits reported.',
 '実利用者のタスク、内容、ブランド、技術構成に基づき色・書体・余白・配置を定め、動くコードを出す。検索、入力、読込、空・失敗状態、キーボードを整え、スマホ、長文、多言語、動き低減を確認。装飾で内容を隠さず実施済み検証と限界を示す。'],[
 '为三语提示词网站设计简洁有艺术感的界面，保留搜索、收藏和Skill下载。','Design a restrained, artistic UI for a trilingual prompt library with search, favorites and Skill downloads.','3言語プロンプト集を、検索・お気に入り・Skill保存を保って簡潔で個性的にする。'],[
 '目标用户、主要操作、品牌参考和现有技术栈是什么？','Who are the users, main actions, brand references and existing stack?','利用者、主操作、ブランド参考、既存技術は？'])
write('data/studio/additional-tasks.json',tasks)
info={
 'writing':('writing',['长文与文档','Articles and documents','記事・文書']),
 'learning':('study',['教学与学习','Teaching and learning','教育・学習']),
 'language':('language',['语言与翻译','Language and translation','言語・翻訳']),
 'life':('life',['生活与出行','Life and travel','暮らし・旅行']),
 'creative':('creative',['故事与创意','Stories and creative work','物語・創作']),
 'business':('business',['商业与内容策略','Business and content strategy','事業・コンテンツ戦略']),
 'thinking':('thinking',['思考与表达','Thinking and expression','思考・表現'])}
for l in ['zh','en','ja']:
 base=read(f'data/studio/{l}.json');items=[]
 for group,(category,labels) in info.items():
  t=copy.deepcopy(next(x for x in base if x['id']=='custom-copy'));ts=[x for x in tasks if x['group']==group]
  t.update(id='studio-'+group,slug='guided-'+group,categoryId=category,title=loc(labels)[l],description=' / '.join(x['labels'][l] for x in ts),tags=[x['labels'][l] for x in ts])
  f=next(f for f in t['fields'] if f['key']=='task');f['options']=[x['labels'][l] for x in ts];f['defaultValue']=f['options'][0]
  items.append(t)
 write(f'data/studio/additional/{l}.json',items)
 prog=base[0];f=next(f for f in prog['fields'] if f['key']=='task');label=tasks[-1]['labels'][l]
 if label not in f['options']:f['options'].append(label)
 write(f'data/studio/{l}.json',base)
