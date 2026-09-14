"""Curate task-specific trilingual workflows inspired by pinned public sources.
Source records stay unmodified. These guides are original editorial adaptations.
"""
from pathlib import Path
import json,copy,csv,io,hashlib
root=Path(__file__).resolve().parents[1]
read=lambda p:json.loads((root/p).read_text(encoding='utf-8-sig'))
def write(p,value):
 f=root/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
locales=['zh','en','ja']
loc=lambda v:dict(zip(locales,v))
modules=[];tasks=[]
def module(group,category,names,context,inputs,sources,rows):
 modules.append({'id':'studio-'+group,'group':group,'category':category,'labels':loc(names),'context':loc(context),'inputs':loc(inputs),'sources':sources})
 for slug,labels,terms,details in rows:
  tasks.append({'id':group+'-'+slug,'group':group,'labels':loc(labels),'terms':terms.split('|'),'guidance':loc(details),
   'examples':loc([f'针对{context[0]}，完成“{labels[0]}”，给出可以直接使用的内容。',f'Create {labels[1].lower()} for {context[1]}. Provide a usable deliverable.',f'{context[2]}について「{labels[2]}」を、使える具体的な内容で作成してください。']),
   'questions':loc([f'请补充：{inputs[0]}。已写在需求中的信息不必重复。',f'Provide {inputs[1]}. Do not repeat details already in the brief.',f'{inputs[2]}を補足してください。要望に記載済みなら繰り返し不要です。']),
   'sourceReferences':sources,'editorialStatus':'reviewed-original-adaptation'})

module('backend','programming',['后端与数据库','Backend and databases','バックエンド・DB'],['支持分页和权限的团队任务API','a team task API with pagination and permissions','ページ分割と権限を持つチームタスクAPI'],['语言版本、接口需求、数据结构及权限规则','language/version, API requirements, data model and access rules','言語・版、API要件、データ構造、権限'],['aishort-95','aishort-191','pc-search'],[
 ('api',['API 接口实现','API implementation','API実装'],'API|接口|endpoint|エンドポイント',[
 '先列出路径、方法、鉴权、请求与响应字段、状态码及错误格式，再按用户技术栈交付路由、校验和服务层代码。明确分页、排序稳定性、重复请求和资源不存在时的行为，给出正常与失败请求样例及测试命令。没有仓库访问时标明文件路径和集成步骤，不虚构运行结果。',
 'Specify routes, methods, authentication, request/response fields, status codes and error shapes before implementing handlers, validation and service logic in the chosen stack. Define stable pagination, duplicate requests and missing resources. Include success/failure examples and test commands; without repository access, provide file paths and integration steps without claiming execution.',
 '経路、メソッド、認証、入出力項目、状態コード、エラー形式を定め、指定構成でハンドラー・検証・サービスを実装する。安定したページ分割、重複要求、対象なしを定義。成功・失敗例とテスト手順を示し、未実行の結果を作らない。']),
 ('schema',['数据库建模与迁移','Schema and migrations','DB設計・移行'],'建表|迁移|schema|migration|スキーマ|移行',[
 '从实体与查询需求推导主外键、唯一约束、空值和索引，提供字段字典、关系说明、目标数据库方言的建表和迁移脚本。分开结构迁移与数据回填，说明备份、回滚局限和上线顺序。用样例数据验证约束与核心查询，禁止把删除表作为默认迁移方法。',
 'Derive keys, uniqueness, nullability and indexes from entities and queries. Deliver a field dictionary, relationships and migrations in the target database dialect. Separate schema changes from backfills; explain backups, rollback limitations and rollout order. Demonstrate constraints and core queries with sample data; never default to destructive table replacement.',
 '実体と検索要件から主外部キー、一意性、NULL、索引を設計し、項目辞書と対象DB方言の移行SQLを出す。構造変更と埋め戻しを分離し、バックアップ、ロールバックの限界、適用順を説明。例データで制約と検索を確認し、既定で表を削除しない。']),
 ('import',['批量导入与幂等处理','Batch imports and idempotency','一括取込・冪等性'],'导入|幂等|import|idempotency|取込|冪等',[
 '明确输入格式、字段映射、唯一键和冲突策略，给出逐行校验、事务边界、分批处理与失败重试实现。输出成功、跳过、失败数量和带行号的错误报告；区分重试与重复创建。包含缺列、重复键、空文件、中断恢复的测试，不默认覆盖已有数据。',
 'Define input format, field mapping, unique keys and conflict policy. Implement row validation, transaction boundaries, batching and retries. Report accepted, skipped and failed counts with row-level errors. Distinguish safe retries from duplicate creation; test missing columns, duplicate keys, empty files and recovery without silently overwriting existing records.',
 '形式、項目対応、一意キー、競合方針を定め、行検証、トランザクション、分割処理、再試行を実装する。成功・スキップ・失敗件数と行番号付きエラーを出し、再試行と二重登録を区別。欠列、重複、空ファイル、中断復旧を確認し、既存データを無断上書きしない。'])])

module('testing','programming',['软件测试与质量','Testing and quality','ソフトウェアテスト'],['带登录与购物车的示例网站','a sample website with login and a cart','ログインとカートのあるサンプルサイト'],['被测代码、预期行为、测试框架和已知问题','code, expected behavior, test framework and known failures','対象コード、期待動作、テスト構成、既知の問題'],['aishort-97'],[
 ('unit',['单元测试用例','Unit test cases','単体テスト'],'单元|unit test|単体',[
 '根据函数契约列出输入分区、边界、异常及状态变化，使用项目已有框架编写测试。只替换外部依赖，避免模拟被测逻辑；每项断言对应可观察行为。给出最小夹具、运行方式及仍缺覆盖的分支，不通过复制实现计算期望值。',
 'Derive input partitions, boundaries, exceptions and state changes from the function contract. Write tests in the existing framework, mocking external dependencies rather than the behavior under test. Use observable assertions, minimal fixtures and explicit expected values; include execution instructions and uncovered branches without duplicating implementation logic.',
 '関数契約から入力区分、境界、例外、状態変化を整理し既存フレームワークでテストする。外部依存のみ置換し、観察可能な動作を検証。最小データ、明示的な期待値、実行手順、未確認分岐を示し、実装の複製で期待値を計算しない。']),
 ('journey',['端到端用户流程测试','End-to-end user journeys','E2Eユーザーフロー'],'端到端|E2E|journey|一連の操作',[
 '将关键用户流程拆成前置状态、操作、可见结果和清理步骤，使用语义定位器与状态等待。覆盖成功、失败、刷新恢复和权限隔离；测试数据使用独立账号或本地夹具。交付可执行脚本与失败证据采集方法，不使用固定长等待掩盖不稳定性。',
 'Turn critical journeys into setup, actions, visible assertions and cleanup. Use semantic locators and state-based waits. Cover success, failure, reload recovery and access isolation with isolated test accounts or local fixtures. Deliver runnable scripts and failure evidence capture; avoid long fixed sleeps that mask flakiness.',
 '主要フローを前提状態、操作、可視結果、後片付けに分ける。意味的な要素指定と状態待機を使い、成功・失敗・再読込・権限分離を独立テストデータで確認。実行可能スクリプトと失敗証拠の収集方法を出し、固定長待機で不安定さを隠さない。']),
 ('report',['缺陷报告与复现','Bug reports and reproduction','不具合報告・再現'],'缺陷报告|复现报告|bug report|再現手順',[
 '把零散报错整理为标题、环境、最小复现步骤、实际与预期结果、频率及影响范围。区分观察证据与根因猜测，为每个猜测安排验证步骤。给出最小复现代码或待补资料清单，以及修复后的回归检查，不将未复现的问题标记为已解决。',
 'Convert scattered errors into a title, environment, minimal steps, expected/actual behavior, frequency and impact. Separate observed evidence from root-cause hypotheses and give a check for each hypothesis. Supply a minimal reproduction or missing-input list and post-fix regression checks; never label an unreproduced issue resolved.',
 '断片的なエラーを題名、環境、最小手順、期待・実結果、頻度、影響に整理。観測事実と原因仮説を分け、仮説ごとの検証を示す。最小再現コードまたは不足資料、修正後の回帰項目を出し、未再現を解決済みにしない。'])])

module('devops','programming',['部署与运维','Deployment and operations','デプロイ・運用'],['需要测试环境和生产环境的Node应用','a Node app with staging and production','検証・本番環境を持つNodeアプリ'],['运行环境、部署平台、构建命令、服务依赖和恢复目标','runtime, hosting platform, build commands, dependencies and recovery goals','環境、配備先、ビルド手順、依存、復旧目標'],['aishort-95','aishort-201','pc-devops'],[
 ('pipeline',['CI/CD 流水线','CI/CD pipeline','CI/CDパイプライン'],'CI/CD|流水线|pipeline|パイプライン',[
 '按触发条件、依赖安装、静态检查、测试、构建、制品和部署阶段交付配置。区分拉取请求验证与正式发布，给出最小权限、并发取消、缓存键及失败通知设计；密钥只引用变量名。说明回滚与环境审批点，不添加用户未指定的付费服务。',
 'Deliver pipeline configuration for triggers, installation, checks, tests, build, artifacts and deployment. Separate pull-request validation from releases. Define least privilege, cancellation, cache keys and failure notifications, referencing secrets only by variable name. Explain rollback and environment gates without adding unrequested paid services.',
 '起動条件、依存導入、検査、テスト、ビルド、成果物、配備の設定を出す。PR検証と公開を分け、最小権限、並行取消、キャッシュキー、失敗通知を設計。秘密は変数名のみ参照し、復旧と環境承認箇所を説明。未指定の有料サービスを追加しない。']),
 ('container',['容器化与本地运行','Containerization and local setup','コンテナ化・ローカル起動'],'Docker|容器|container|コンテナ',[
 '根据实际项目提供Dockerfile、忽略规则和必要的Compose配置，说明构建阶段、启动用户、端口、健康检查、持久化与环境变量。交付构建启动命令和日志排错步骤，区分开发与生产依赖。镜像版本需要核对，禁止把密钥复制进镜像或默认挂载宿主根目录。',
 'Provide a project-specific Dockerfile, ignore rules and necessary Compose configuration. Explain build stages, runtime user, ports, health checks, persistence and environment variables. Include build/start commands and log-based debugging, separating development and production dependencies. Verify image versions; never bake secrets into images or mount the host root by default.',
 '対象プロジェクト用Dockerfile、除外規則、必要なComposeを作る。ビルド段階、実行ユーザー、ポート、健全性、永続化、変数を説明し、起動・ログ調査手順を添える。開発と本番依存を区別。版を確認し、秘密の埋込やホストルートの既定マウントをしない。']),
 ('incident',['故障排查运行手册','Incident runbook','障害対応手順書'],'故障手册|runbook|incident|障害対応',[
 '围绕具体告警写触发条件、影响确认、只读诊断、分支判断、缓解、恢复验证和升级联系人。命令标明目标环境、预期输出及风险，先保存证据再提出变更；将重启、删除和回滚操作单独列出。最后给事件时间线与复盘模板，不假设故障已恢复。',
 'Write a runbook for a specific alert: trigger, impact, read-only diagnosis, decision branches, mitigation, recovery checks and escalation. Annotate commands with target environment, expected signals and risk. Preserve evidence before changes; separate restarts, deletions and rollbacks. Include an incident timeline and review template without claiming recovery.',
 '具体的な警報に対し発火条件、影響、読取診断、分岐、緩和、復旧確認、連絡先を記述。コマンドに対象環境、期待兆候、リスクを添え、変更前に証拠保存。再起動・削除・巻戻しを分離し、時系列と振り返り様式を出す。復旧済みと決めつけない。'])])

module('analytics','study',['数据分析与图表','Data analysis and charts','データ分析・グラフ'],['含日期、渠道、金额和缺失值的销售表','sales data with dates, channels, amounts and missing values','日付・チャネル・金額・欠損を含む売上表'],['样例数据、字段含义、分析问题和使用软件','sample data, field definitions, analysis questions and software','例データ、項目定義、分析課題、利用ソフト'],['aishort-85','aishort-134','pc-data'],[
 ('clean',['数据清洗规则','Data cleaning rules','データ整形規則'],'清洗|缺失值|cleaning|欠損|整形',[
 '先检查字段类型、单位、编码、重复、缺失与异常值，给出问题清单和逐列处理规则。保留原始数据，提供可复现脚本或表格步骤、修改日志与前后行数核对。对无法推断的值保留未知，不为图表好看而删除异常点。',
 'Audit types, units, encoding, duplicates, missing values and outliers. Deliver a problem inventory and column-specific rules. Preserve raw data and provide reproducible code or spreadsheet steps, a change log and row-count reconciliation. Keep unknowable values unknown; do not delete inconvenient outliers just to improve a chart.',
 '型、単位、文字コード、重複、欠損、外れ値を調べ、問題一覧と列別規則を出す。原本を保ち、再現可能コードまたは表操作、変更記録、前後件数照合を添える。不明値は不明のままにし、見栄えのために外れ値を消さない。']),
 ('explore',['探索分析与结论','Exploratory analysis','探索的分析'],'探索分析|EDA|exploratory|探索的',[
 '将业务问题映射到指标口径、分组、时间范围和计算方法，先做描述统计再讨论差异。输出分析表、必要图形、可复现计算和有依据的结论，说明样本偏差、缺失和相关不等于因果。没有数据时提供查询与分析方案，不生成看似真实的结果数字。',
 'Map questions to metric definitions, groups, date ranges and calculations. Start with descriptive statistics before interpreting differences. Deliver tables, necessary charts, reproducible calculations and supported findings. Explain sampling bias, missingness and correlation versus causation. Without data, give queries and an analysis plan rather than fabricated results.',
 '課題を指標定義、集計区分、期間、計算に対応させ、記述統計の後に差を解釈する。表、必要な図、再現計算、根拠ある結論を出す。標本偏り、欠損、相関と因果の違いを説明。データなしなら計画やクエリを示し数値結果を作らない。']),
 ('dashboard',['仪表盘与图表选型','Dashboard and chart design','ダッシュボード設計'],'仪表盘|dashboard|图表选型|ダッシュボード',[
 '根据使用者要做的决策选择核心指标和图表类型，说明坐标、单位、时间粒度、筛选和刷新频率。给出布局、字段到图形的映射、空数据与错误状态，避免误导坐标和装饰性3D。交付目标工具可实现的配置或代码，并列出数据校验方法。',
 'Choose metrics and chart types around the user’s decisions. Define axes, units, time grain, filters and refresh frequency. Supply layout, field-to-chart mapping, empty/error states and tool-specific configuration or code. Avoid misleading scales and decorative 3D; include checks that reconcile displayed values to source data.',
 '利用者の判断から指標と図を選び、軸、単位、時間粒度、絞込、更新頻度を定義。配置、項目対応、空・失敗状態、対象ツールの設定かコードを出す。誤解を招く軸や装飾3Dを避け、表示値と原データの照合方法を添える。'])])

module('product','business',['产品设计与需求','Product planning','プロダクト企画'],['帮助新用户完成首次配置的功能','a feature helping new users complete onboarding','新規利用者の初期設定を助ける機能'],['目标用户、问题证据、功能边界、约束和成功指标','target users, problem evidence, scope, constraints and success measures','対象者、課題の根拠、範囲、制約、成功指標'],['aishort-139','aishort-92'],[
 ('prd',['产品需求文档','Product requirements document','製品要件書'],'PRD|产品需求|requirements document|要件書',[
 '从真实用户问题组织背景、目标、非目标、用户流程、功能规则、数据需求和验收标准。逐项说明成功、空态、错误、权限和边界行为，标出假设及待决策事项。输出可交给设计与开发的完整PRD；指标包含定义和采集方式，不虚构用户调研结论。',
 'Build a complete PRD around evidenced user problems: context, goals, non-goals, journeys, rules, data and acceptance. Specify success, empty, error, permission and boundary behavior. Mark assumptions and open decisions. Define metrics and collection methods so designers and engineers can use the document; never invent research findings.',
 '根拠ある利用課題から背景、目標、非目標、導線、規則、データ、受入条件をまとめる。成功・空・失敗・権限・境界を具体化し、仮定と未決事項を明示。設計開発へ渡せる要件書と指標定義・収集方法を出し、調査結果を捏造しない。']),
 ('stories',['用户故事与验收','User stories and acceptance','ユーザーストーリー・受入条件'],'用户故事|user story|acceptance|受入条件',[
 '把需求拆成能独立验证的小故事，每项说明角色、目标、价值、前提及Given/When/Then验收例。包含失败和权限场景，标记依赖与范围外内容。按用户价值与实施约束解释优先级，不用故事点冒充确定工期。',
 'Split requirements into independently verifiable stories with actor, goal, value, preconditions and Given/When/Then examples. Include failure and permission cases, dependencies and exclusions. Explain priority through user value and implementation constraints; do not present story points as guaranteed calendar estimates.',
 '要件を独立検証できる話に分け、役割、目的、価値、前提、Given/When/Then例を示す。失敗と権限、依存、対象外を含める。価値と制約で優先度を説明し、ポイントを確定工期として扱わない。']),
 ('usability',['可用性测试计划','Usability study plan','ユーザビリティ調査計画'],'可用性|usability|用户访谈|利用者調査',[
 '围绕需要验证的假设设计参与者条件、任务脚本、主持提示、观察表和成功标准。问题保持中性，任务描述不给操作答案，区分行为证据与主观偏好。输出记录模板、问题严重度规则与改进排序，不编造受访者发言或研究结论。',
 'Translate hypotheses into participant criteria, neutral task scripts, facilitator prompts, observation sheets and success criteria. Avoid leading questions or revealing task solutions. Separate observed behavior from preferences. Deliver recording templates, severity rules and prioritization without inventing participants’ statements or findings.',
 '仮説から参加条件、中立なタスク台本、進行の問い、観察表、成功条件を設計する。誘導質問や正解操作を避け、行動事実と好みを区別。記録様式、重大度基準、改善順を示し、参加者の発言や結果を作らない。'])])

module('project','office',['项目管理与协作','Project delivery','プロジェクト管理'],['四周内上线一个小型知识库','a four-week launch of a small knowledge base','4週間での小規模ナレッジ公開'],['交付目标、团队角色、时间、依赖和资源限制','deliverables, team roles, dates, dependencies and resource limits','成果物、役割、期間、依存、資源制約'],['aishort-201','aishort-279'],[
 ('plan',['任务拆解与里程碑','Work breakdown and milestones','作業分解・節目'],'WBS|里程碑|milestone|work breakdown|工程',[
 '按可验收成果拆分任务，标明负责人角色、输入、输出、前置依赖、估算依据和完成条件。给出里程碑、关键路径假设、缓冲和每周检查点，区分日历工期与工作量。团队或时间不足时提出删减范围方案，不用假定人数制造可行性。',
 'Break work into verifiable deliverables with owner role, inputs, outputs, dependencies, estimation basis and completion criteria. Include milestones, critical-path assumptions, buffers and weekly checkpoints. Distinguish elapsed time from effort; propose scope reductions when resources are insufficient instead of inventing team capacity.',
 '受入可能な成果物に分解し、担当役割、入出力、依存、見積根拠、完了条件を付ける。節目、重要経路の仮定、余裕、週次確認を示す。期間と工数を区別し、資源不足なら架空の人員でなく範囲削減を提案する。']),
 ('risk',['风险登记与应对','Risk register','リスク一覧・対応'],'风险登记|risk register|リスク登録',[
 '用原因—事件—影响描述项目风险，区分已发生问题与未来风险。逐项给概率依据、影响、负责人角色、预警信号、预防、应急和复查日期。明确评分只是排序工具，并附升级阈值；不凭空填写精确损失或发生概率。',
 'Describe risks as cause, event and impact, separating future risks from existing issues. Include likelihood basis, impact, owner role, warning signals, prevention, contingency and review date. Explain scores as prioritization aids with escalation thresholds; do not invent precise loss amounts or probabilities.',
 '原因・事象・影響でリスクを記述し、既発生問題と区別。可能性の根拠、影響、担当役割、予兆、予防、緊急策、再確認日を示す。点数は優先付け用と説明し、架空の精密な確率や損失を出さない。']),
 ('retro',['复盘与行动计划','Retrospective and actions','振り返り・改善行動'],'复盘|retrospective|振り返り',[
 '从时间线与证据重建目标、结果和偏差，分别列出有效做法、障碍及可控原因。避免把推测写成人员责任，给每项改进设置负责人角色、截止日期、成功信号和复查方式。交付复盘正文与行动表，限制同时推进事项以便落实。',
 'Reconstruct goals, outcomes and gaps from a timeline and evidence. Separate effective practices, obstacles and controllable causes without assigning personal blame from speculation. Give improvements owner roles, deadlines, success signals and review methods. Deliver a retrospective and a small actionable follow-up list.',
 '時系列と証拠から目標、結果、差を整理し、有効な方法、障害、制御可能な原因を分ける。憶測で個人責任を決めず、改善ごとに役割、期限、成功兆候、確認方法を付ける。本文と実行可能な少数の行動表を出す。'])])

module('career','office',['求职与职业发展','Career and applications','就職・キャリア'],['有两个真实项目经历的初级开发者','a junior developer with two real project experiences','実在する2件のプロジェクト経験を持つ初級開発者'],['目标职位、岗位描述、真实经历及可公开成果','target role, job description, real experience and shareable outcomes','志望職、募集要件、実経験、公開可能な成果'],['aishort-22','aishort-46','aishort-145','aishort-253','pc-resume'],[
 ('resume',['简历与求职信','Resume and cover letter','履歴書・応募文'],'简历|求职信|resume|cover letter|履歴書',[
 '先将岗位要求对应到用户真实经历，标出有证据、待补证据和缺口，再改写摘要、项目要点与求职信。要点呈现行动、方法和实际结果，没有量化数据时不编数字。保留任职时间与技能边界，输出可复制版本及修改理由，不承诺通过ATS或录用。',
 'Map job requirements to real experience, marking supported claims, evidence gaps and missing qualifications. Rewrite the summary, project bullets and cover letter around actions, methods and actual outcomes. Preserve dates and skill boundaries; never invent metrics. Deliver copyable drafts and rationale without promising ATS success or hiring.',
 '募集要件と実経験を対応させ、証拠あり・不足・未経験を明示。行動、方法、実結果で要約、実績、応募文を改稿し、期間や技能範囲を保つ。数字を作らず、貼付用文と変更理由を示す。選考通過を保証しない。']),
 ('interview',['岗位模拟面试','Role-specific interview practice','職種別模擬面接'],'面试|interview|面接',[
 '根据岗位要求与候选人背景设计问题顺序，先问一题并等待回答，再追问证据与取舍。每轮反馈内容完整性、技术准确性和表达结构，给更好的回答框架但不替用户编经历。结束时总结优势、薄弱点和练习建议，模拟反馈不代表招聘判断。',
 'Sequence questions around the role and candidate background. Ask one question, wait, then probe evidence and tradeoffs. Give feedback on completeness, technical accuracy and structure, offering a better response framework without inventing experience. Finish with strengths, gaps and practice steps; simulated feedback is not a hiring judgment.',
 '職務と背景に合う質問を順序化し、一問ずつ回答を待って根拠や判断を掘り下げる。完全性、技術の正確さ、構成を評価し、架空経験でなく回答の組立てを示す。強み、課題、練習で締め、採用判断と混同しない。']),
 ('gap',['技能差距与成长路线','Skills gap and growth plan','スキル差・成長計画'],'技能差距|career plan|skills gap|スキル差',[
 '把目标岗位拆成必备能力和加分项，根据用户证据确定当前水平与待验证项。为每项差距安排练习项目、产出、验收和学习顺序，适配可用时间与预算。引用当前岗位信息时标明来源日期，不以热门标签代替真实技能路径。',
 'Separate required and optional role skills, using evidence to assess current ability and unknowns. Assign each gap a practice project, deliverable, acceptance check and learning sequence within available time and budget. Date any current job-market sources; replace trend labels with demonstrable skills and realistic milestones.',
 '必須能力と加点要素を分け、証拠から現状と未確認を評価。差ごとに練習課題、成果物、受入確認、学習順を時間・予算内で設計する。求人情報には確認日と出典を付け、流行語でなく実証可能な技能を示す。'])])

module('communication','office',['邮件会议与沟通','Email, meetings and communication','メール・会議・伝達'],['跨团队协调一次版本延期','coordinating a release delay across teams','部門間での公開延期の調整'],['收件人、背景事实、希望达成的决定和期限','recipient, background facts, desired decision and deadline','相手、背景事実、必要な判断、期限'],['aishort-201','aishort-241'],[
 ('email',['商务邮件与跟进','Business email and follow-up','業務メール・フォロー'],'邮件|email|follow-up|メール',[
 '围绕收件人需要知道和采取的行动写主题、开场、事实、请求与期限。按关系与场景控制正式程度，给初次邮件和未回复跟进版本。保留用户承诺边界，不添加不存在的附件、会议约定或付款承诺；长信息用清晰段落压缩。',
 'Write subject, opening, facts, requested action and deadline around the recipient’s needs. Match formality to the relationship and provide initial and follow-up versions. Preserve commitment boundaries: invent no attachments, meeting agreements or payment promises. Condense long context into clear paragraphs.',
 '相手が知り実行すべき点を軸に件名、導入、事実、依頼、期限を書く。関係に合わせた丁寧さで初回と催促の文を出す。存在しない添付、会議合意、支払約束を加えず、長い背景を明快な段落にする。']),
 ('minutes',['会议纪要与待办','Meeting notes and actions','議事録・アクション'],'会议纪要|minutes|meeting notes|議事録',[
 '从提供的记录提取议题、事实、决定、异议、待定问题和行动项。行动项逐条标明负责人、期限与完成标准；未明确的内容标注待确认。保留关键数字和原话出处，不把讨论建议当成已批准决定，输出简版纪要与可追踪待办表。',
 'Extract agenda, facts, decisions, dissent, open questions and actions from supplied notes. Assign each action an owner, deadline and completion test, marking unspecified values unconfirmed. Preserve key numbers and quote locations. Distinguish suggestions from approved decisions; provide concise minutes and a trackable action table.',
 '記録から議題、事実、決定、異論、未決、行動を抽出。行動に担当、期限、完了基準を付け、不明は要確認とする。数値と発言箇所を保ち、提案を承認済みとしない。簡潔な議事録と追跡表を出す。']),
 ('alignment',['分歧沟通与协调','Disagreement and alignment','意見相違の調整'],'分歧|协调|alignment|disagreement|意見相違',[
 '分开各方事实、诉求、约束和误解，先找共同目标，再提出可协商选项及其代价。给开场、澄清问题、回应异议和结束确认的具体话术，避免指责、威胁或虚假共识。最终列出已同意、未同意与下一次确认事项。',
 'Separate facts, interests, constraints and misunderstandings for each party. Identify a shared goal and negotiable options with costs. Provide concrete openings, clarifying questions, objection responses and closing confirmations without blame, threats or invented agreement. Record agreed, unresolved and next-confirmation items.',
 '双方の事実、目的、制約、誤解を分け、共通目標と代価付きの選択肢を出す。導入、確認質問、異論への返答、終了確認の具体文を示し、非難・脅し・架空合意を避ける。合意、未合意、次回確認を整理する。'])])

module('support','office',['客服与知识库','Support and knowledge base','サポート・FAQ'],['提供退款政策与使用说明的在线服务','an online service with refund policies and user guides','返金方針と利用手順のあるオンラインサービス'],['客户问题、已确认政策、产品版本和可采取操作','customer issue, verified policy, product version and permitted actions','問い合わせ、確認済み方針、製品版、対応可能な操作'],['aishort-39','aishort-241','pc-support'],[
 ('reply',['工单回复与升级','Ticket response and escalation','問い合わせ回答・引継ぎ'],'工单|ticket|客服回复|問い合わせ回答',[
 '识别问题类型与客户诉求，用简短确认、已知事实、具体步骤和下一步组成回复。引用提供的政策，超出权限时写清升级原因及需补资料。不得承诺不存在的退款、补偿或解决时间；内部排查备注与发给客户的正文分开。',
 'Identify issue type and customer need, then write acknowledgement, verified facts, steps and next action. Apply supplied policy and explain escalation with only necessary missing information. Promise no unsupported refunds, compensation or resolution times. Separate internal troubleshooting notes from the customer-facing response.',
 '問題と要望を特定し、受止め、確認事実、手順、次の対応で回答する。提供方針を用い、権限外なら引継理由と必要情報を示す。根拠のない返金・補償・解決期限を約束せず、内部メモと顧客文を分ける。']),
 ('faq',['常见问题与答案','Frequently asked questions','よくある質問と回答'],'FAQ|常见问题|よくある質問',[
 '按用户任务归类真实高频问题，合并同义问法，给每题直接答案、适用条件、操作步骤和例外。答案只依据提供的政策或文档，未知处标记待核实，附来源位置与维护负责人字段。避免把营销口号写成答案。',
 'Group genuine recurring questions by user task and merge equivalent wording. Give direct answers, conditions, steps and exceptions from supplied policies or documents. Mark unknowns for verification and include source locations and maintenance-owner fields. Do not substitute marketing slogans for useful answers.',
 '実際の頻出質問を利用目的別に分類し同義を統合。提供方針・文書から直接回答、条件、手順、例外を作る。不明は要確認とし、出典箇所と保守担当欄を付け、広告文句を答えにしない。']),
 ('guide',['帮助中心操作指南','Help-center how-to','ヘルプ操作ガイド'],'帮助中心|操作指南|how-to|help center|操作ガイド',[
 '给出适用人群、前提条件和完成目标，再将操作拆为编号步骤，每步说明位置、动作与可见结果。补充常见失败、撤销方式和版本差异，优先使用用户提供的界面名称。没有截图时只列截图需求，不编造按钮或不存在的功能。',
 'State audience, prerequisites and completion goal, then write numbered steps with location, action and visible outcome. Include common failures, undo options and version differences, using supplied UI names. Without screenshots, list needed captures instead of inventing buttons or unsupported features.',
 '対象者、前提、完成状態を示し、場所・操作・見える結果を番号順に書く。失敗例、取消、版差を補足し、提供された画面名を優先。画面資料がなければ撮影要件を列挙し、架空のボタンや機能を作らない。'])])

module('social','marketing',['社交媒体与短内容','Social content','SNS・短文制作'],['介绍一款有真实使用记录的效率工具','introducing a productivity tool with real usage notes','実際の利用記録がある効率化ツールの紹介'],['平台、读者、素材事实、篇幅和行动目标','platform, audience, factual material, length and desired action','媒体、読者、事実素材、長さ、行動目標'],['aishort-143','aishort-204','aishort-209'],[
 ('posts',['平台图文帖','Platform-specific posts','媒体別投稿文'],'图文帖|post|小红书|投稿文',[
 '按平台阅读方式给标题、开头、主体、结尾与必要标签，保留真实体验和信息密度。提供三个不同切入角度，并为其中最合适的一个写完整正文。避免假装亲测、编造用户评论、夸大效果或机械堆表情，说明需要配图的位置与内容。',
 'Write titles, opening, body, ending and relevant tags for the platform’s reading style. Offer three distinct angles and fully draft the best fit using real experience and dense information. Invent no first-hand use, reviews or outcomes. Avoid emoji clutter and describe purposeful image placements.',
 '媒体の読み方に合わせ題名、導入、本文、結び、必要タグを作る。異なる3つの切口を示し最適案を実体験の範囲で完成。架空体験・口コミ・効果誇張や絵文字過多を避け、画像位置と内容を説明する。']),
 ('short-video',['短视频口播脚本','Short-video spoken script','短尺動画の話し言葉台本'],'口播|short video|spoken script|短尺動画',[
 '按目标时长编排开场、问题、演示、证据和结尾行动，逐段标注秒数、口播、画面、字幕及音效。用适合朗读的短句并核对总时长，给可删除的压缩段落。没有实测数据时不写效果承诺，不把脚本交付说成视频已经生成。',
 'Fit a hook, problem, demonstration, evidence and closing action to the duration. Mark seconds, speech, visuals, captions and sound per segment. Use speakable sentences, check total timing and identify optional cuts. Avoid unsupported performance claims and never describe a script as an already generated video.',
 '尺に合わせ導入、課題、実演、証拠、結びを配置し、秒数、発話、画、字幕、音を段別に示す。話しやすい短文で全体時間を確認し削れる部分を示す。未検証効果を保証せず、台本を動画生成済みとしない。']),
 ('repurpose',['长内容拆分复用','Repurpose long-form content','長文の再構成・再利用'],'拆分复用|repurpose|再利用',[
 '从原文提取可独立成立的观点与证据，分别改成短帖、邮件摘要和口播版本，保留原意与来源。每份内容独立可读，标出被省略的限定条件，避免断章取义。提供渠道、角度、素材需求和发布先后建议，但不代替用户发布。',
 'Extract self-contained claims and evidence from the source, then adapt them into short posts, an email summary and a spoken version. Preserve meaning and attribution, marking omitted qualifications so excerpts do not mislead. Provide channels, angles, asset needs and sequence suggestions without publishing on the user’s behalf.',
 '原文の独立した主張と根拠を抽出し、短文投稿、メール要約、口播にする。意味と出典を保ち、省略条件を明記して切取誤解を避ける。媒体、切口、素材、順序を提案するが、利用者に代わって投稿しない。'])])

module('commerce','marketing',['电商商品内容','E-commerce content','EC商品コンテンツ'],['一款规格和售后政策已确认的桌面收纳盒','a desk organizer with verified specifications and after-sales policy','仕様とサポート方針が確認済みの卓上収納箱'],['商品参数、目标买家、平台规则、卖点证据和售后政策','product specs, buyers, platform rules, claim evidence and support policy','仕様、購入者、媒体規則、訴求根拠、サポート方針'],['aishort-45','aishort-140','aishort-141','aishort-39'],[
 ('listing',['商品详情与卖点','Product listing and benefits','商品詳細・訴求点'],'商品详情|listing|卖点|商品詳細',[
 '把参数转成有依据的使用利益，输出标题、要点、完整描述、规格表、适用与不适用人群。区分已证实特点和待确认信息，单位与型号保持一致；不写虚假销量、限时稀缺或认证。补充主图和细节图的信息需求，适配指定平台篇幅。',
 'Translate specifications into evidenced benefits and deliver title, bullets, description, spec table and suitable/unsuitable users. Separate verified features from unknowns, preserving units and model names. Invent no sales numbers, scarcity or certifications. Include information needs for hero/detail images within platform length limits.',
 '仕様を根拠ある利点に変え、題名、要点、説明、仕様表、適合・不適合利用者を出す。確認済みと不明を区別し単位・型番を保つ。売上、希少性、認証を捏造せず、媒体長に合わせ主画像・詳細画像の情報要件を添える。']),
 ('compare',['商品对比选购','Product comparison guide','商品比較ガイド'],'商品对比|comparison guide|商品比較',[
 '按买家的用途与限制建立比较维度，对每款商品列相同口径的参数、优点、限制和适合场景。价格、库存和兼容性标注核实日期，资料缺失时不推测。给条件式建议而非绝对最好，说明结论依赖哪些输入。',
 'Build comparison criteria from buyer needs and constraints. Compare products on consistent specifications, advantages, limits and suitable situations. Date price, availability and compatibility checks; do not infer missing data. Give conditional recommendations instead of an absolute winner and state which inputs drive the conclusion.',
 '用途と制約から比較軸を作り、同じ定義の仕様、長所、制限、適用場面で比べる。価格、在庫、互換性に確認日を付け、不明は推測しない。絶対的な最良でなく条件別提案と判断に使った情報を示す。']),
 ('questions',['售前问答与异议','Pre-sales questions','購入前FAQ・懸念対応'],'售前|pre-sales|购买疑问|購入前',[
 '收集尺寸、兼容、使用、配送、退换等购买疑问，逐题用已确认参数或政策给直接答案。对无法保证的效果写清边界，提供核实步骤或转人工条件。给简短版和详细版回复，不诱导隐瞒限制或虚构购买紧迫性。',
 'Address size, compatibility, use, shipping and returns using verified specs or policies. State limits on unguaranteed outcomes and provide checks or escalation conditions. Deliver concise and detailed answers without concealing limitations or manufacturing urgency.',
 '寸法、互換、使用、配送、返品の疑問に確認済み仕様・方針で答える。保証不能な効果の境界、確認手順、引継条件を示す。短文・詳細版を出し、制限を隠したり緊急性を作ったりしない。'])])

module('seo','marketing',['搜索内容与SEO','Search content and SEO','検索コンテンツ・SEO'],['一个提供三语使用教程的小型网站','a small site offering trilingual tutorials','3言語の使い方記事を提供する小規模サイト'],['页面内容、目标读者、关键词资料及可用搜索数据','page content, audience, keyword material and available search data','ページ内容、読者、キーワード資料、検索データ'],['aishort-38','aishort-40','pc-seo','pc-links'],[
 ('keywords',['搜索意图与选题','Search intent and topics','検索意図・テーマ設計'],'搜索意图|keyword|search intent|検索意図',[
 '按用户问题、搜索意图和主题关系组织关键词，合并近义词但保留不同意图。输出主题簇、对应页面、优先级理由和内容缺口。搜索量与难度必须来自给定工具数据，缺失时标为未知；不以关键词数量或堆砌保证排名。',
 'Group keywords by user question, intent and topic relationships, merging synonyms without collapsing distinct intents. Deliver clusters, target pages, priority rationale and content gaps. Use supplied tool data for volume/difficulty or mark them unknown; neither keyword count nor stuffing guarantees rankings.',
 '質問、意図、テーマ関係で語を分類し、同義をまとめつつ異なる意図は残す。クラスタ、対応ページ、優先理由、内容不足を示す。検索量・難度は提供データに限り、不明を明記。語数や詰込で順位を保証しない。']),
 ('brief',['搜索页面内容简报','Search page content brief','検索ページ制作要項'],'内容简报|content brief|制作要項',[
 '明确页面服务的读者问题与核心答案，给标题、段落任务、需补证据、图表和相关内链。按阅读顺序组织内容，而不是机械重复关键词；为作者写出具体交付要求和事实核对清单。没有实际检索时不编造竞品排名或搜索结果特征。',
 'Define the reader’s question and core answer, then specify title, section purposes, required evidence, visuals and relevant internal links. Organize for reading rather than repetition. Give writers concrete deliverables and fact checks; without actual search, invent no competitor rankings or result-page features.',
 '読者の疑問と中核回答を定め、題名、各節の役割、根拠、図、関連内リンクを指定。語の反復でなく読む順に構成し、執筆者に具体成果と事実確認を示す。検索未実施なら競合順位や結果画面の特徴を作らない。']),
 ('metadata',['标题描述与内链','Metadata and internal links','タイトル・説明・内部リンク'],'meta|内链|internal link|メタ|内部リンク',[
 '依据页面真实内容提供多组准确的标题和描述，给出字符长度并保留品牌与语言习惯。仅从提供且相关的页面建议内链与自然锚文本，检查重复、空链接和意图偏差。说明描述可能被搜索引擎改写，不保证收录或排名。',
 'Create accurate title/description variants from actual content, with character counts and natural brand/language usage. Recommend relevant internal links only from supplied pages, using descriptive anchors and checking duplicates, missing destinations and intent mismatch. Note that search engines may rewrite snippets; guarantee no indexing or ranking.',
 '実内容に沿う題名・説明案と文字数を示し、ブランドと自然な言葉を保つ。提供された関連ページだけへ説明的な内部リンクを提案し、重複、宛先欠落、意図ずれを点検。説明文の書換可能性を述べ、登録や順位を保証しない。'])])

module('slides','office',['演示文稿与讲稿','Presentations and speaking','プレゼン・発表原稿'],['向团队介绍知识库改版方案的十分钟汇报','a ten-minute team presentation on a knowledge-base redesign','ナレッジ改修を紹介する10分のチーム発表'],['听众、时长、核心结论、资料和目标软件','audience, duration, key conclusion, material and target software','聴衆、時間、結論、素材、対象ソフト'],['aishort-187','aishort-195'],[
 ('proposal',['方案汇报PPT','Proposal presentation','提案プレゼン'],'方案汇报|pitch deck|proposal slides|提案発表',[
 '按需要促成的决定构建问题、证据、方案、取舍、计划和请求，逐页给结论式标题、正文、图形建议及讲者备注。核对页数与时长，每页只推进一个主要观点；不虚构业绩和预测。输出可粘贴到WPS演示或PowerPoint的完整内容。',
 'Build problem, evidence, proposal, tradeoffs, plan and requested decision. For each slide, supply a claim-led title, complete copy, visual suggestion and speaker notes. Fit slide count to duration with one main idea per slide. Invent no performance results or forecasts; deliver content ready for WPS Presentation or PowerPoint.',
 '必要な判断へ向け課題、根拠、提案、比較、計画、依頼を構成。各頁に結論型見出し、本文、図案、話者メモを付け、枚数と時間を合わせ一頁一論点にする。実績・予測を作らず、WPSやPowerPointに使える内容を出す。']),
 ('training',['培训课件','Training slide content','研修スライド'],'培训课件|training deck|研修資料',[
 '以学习者能完成的操作为目标安排概念、演示、练习、反馈和总结。逐页写正文、案例、互动问题和参考答案，给练习时间与主持提示。对新手提供解释，对熟练者提供延伸，不只交付目录或把整篇讲义塞入一页。',
 'Organize concepts, demonstration, practice, feedback and recap around observable learner actions. Supply slide copy, examples, interactive questions, answer keys, practice timing and facilitator prompts. Include beginner support and extensions without delivering only an outline or cramming an entire handout onto one slide.',
 '習得後の操作を目標に概念、実演、練習、返答、まとめを配置。各頁の本文、例、問い、解答、時間、進行メモを作る。初心者補助と発展を用意し、目次だけや一頁への全文詰込を避ける。']),
 ('speech',['逐页讲稿与问答','Speaker notes and Q&A','発表原稿・質疑応答'],'讲稿|speaker notes|Q&A|発表原稿',[
 '根据现有幻灯片写逐页自然口语讲稿，包含开场、转场、强调与结束，并分配时间。预测听众可能追问的事实和取舍，给基于已有资料的回答及未知时的回应。不要新增幻灯片里没有依据的数字，提供超时可删版本。',
 'Turn existing slides into natural spoken notes with opening, transitions, emphasis, close and timing. Anticipate questions on facts and tradeoffs, answering from supplied material and acknowledging unknowns. Add no unsupported numbers; provide optional cuts for a shorter delivery.',
 '既存スライドから導入、つなぎ、強調、締め、時間を含む自然な原稿を作る。事実や取捨への質問を予想し、提供資料で回答、不明時の返しも示す。根拠なしの数値を加えず短縮版を用意する。'])])

module('reading','study',['阅读与资料整理','Reading and source synthesis','読書・資料整理'],['三篇关于远程协作的已提供文章','three supplied articles about remote collaboration','提供済みの遠隔協働に関する3記事'],['原文或摘录、阅读目的、引用方式和输出篇幅','source text/excerpts, reading goal, citation format and length','原文・抜粋、読書目的、引用方式、分量'],['aishort-47','aishort-215','aishort-240'],[
 ('notes',['阅读笔记与行动','Reading notes and application','読書ノート・応用'],'读书笔记|reading notes|読書ノート',[
 '提取中心问题、关键观点、论证链、例子和适用边界，区分作者主张与自己的解释。用原文位置支撑摘要，给概念关系和可尝试的小行动。不因只有书名而假装读过全文；资料不全时只处理提供部分。',
 'Extract the core question, claims, reasoning, examples and applicability limits, separating author claims from interpretation. Ground notes in source locations and include concept relationships and small practical experiments. A title alone is not evidence of reading the book; process only supplied material when sources are incomplete.',
 '中心疑問、主張、論証、例、適用範囲を抽出し、著者の意見と解釈を分ける。原文位置を根拠に概念関係と小さな応用行動を示す。書名だけで通読済みとせず、資料不足なら提供範囲のみ扱う。']),
 ('synthesis',['多来源对照综述','Compare and synthesize sources','複数資料の比較統合'],'多来源|synthesis|source comparison|資料比較',[
 '建立来源、日期、研究或观点类型、主张、证据和限制对照表，识别一致、冲突与信息缺口。围绕主题综合而非逐篇拼接，并为结论标明具体出处。无法消解的冲突保留，不能把来源数量当成正确性证明。',
 'Compare source, date, type, claims, evidence and limitations. Identify agreement, conflict and gaps, synthesizing by theme rather than concatenating summaries. Attribute each conclusion to specific sources. Preserve unresolved disagreements and do not treat source count as proof of correctness.',
 '出典、日付、種別、主張、証拠、制限を対照し、一致、対立、不足を見つける。記事順の連結でなく主題別に統合し、結論に出典を付ける。未解消の対立を残し、資料数を正しさの証明にしない。']),
 ('summary',['长文分层摘要','Layered long-document summary','長文の階層要約'],'长文摘要|executive summary|long summary|長文要約',[
 '先给一句话主旨和短摘要，再给按原文结构的详细摘要、关键数字、条件和待办。保留否定、概率和限制条件，逐项核对不得改变结论强度。标明覆盖的章节与省略范围，超长材料分批建立可合并摘要，不声称读取未提供部分。',
 'Provide a one-sentence thesis, short summary, structural detailed summary, key figures, conditions and actions. Preserve negation, uncertainty and qualifications without strengthening claims. State covered sections and omissions. For long inputs, create mergeable chunk summaries without claiming access to unsupplied text.',
 '一文主旨、短要約、構造別詳細、数値、条件、行動の順に出す。否定、不確実性、限定を保ち主張を強めない。対象章と省略範囲を明示し、長大なら統合可能な部分要約に分け、未提供箇所を読んだとしない。'])])

module('assessment','study',['出题与学习评估','Exercises and assessment','問題作成・学習評価'],['初学者的Python循环与列表练习','Python loop and list practice for beginners','初心者向けPythonのループとリスト演習'],['学习目标、年龄或水平、知识范围、题型和评分要求','learning goals, age/level, scope, question types and grading criteria','学習目標、年齢・水準、範囲、問題形式、採点条件'],['aishort-131','aishort-263'],[
 ('bank',['分层题库与解析','Question bank with explanations','段階別問題・解説'],'题库|question bank|問題集',[
 '按知识点和认知难度设计题目分布，输出完整题干、选项、答案、解析和考查点。选择题确保唯一最优答案，干扰项对应常见误解；主观题给示例而非唯一表述。检查题目重复、泄露答案线索及超出教学范围的问题。',
 'Distribute questions by topic and cognitive demand, providing full stems, options, answers, explanations and assessed skills. Multiple-choice items need one best answer and misconception-based distractors; open responses need examples rather than a single wording. Check duplication, answer cues and scope violations.',
 '知識点と認知難度で配分し、問題、選択肢、解答、解説、評価項目を出す。選択式は最良解一つと誤解に基づく誤答、記述式は唯一表現でなく例を用意。重複、答えの手掛り、範囲外を点検する。']),
 ('rubric',['评分量规与反馈','Rubric and feedback','採点基準・フィードバック'],'量规|rubric|grading|採点基準',[
 '从任务目标推导评分维度、权重和各水平可观察的表现，给示例锚点与扣分边界。对提供的作答逐项引用证据，说明得分和改进动作；不凭文字推断学生人格或潜力。标明这是辅助反馈，保留教师最终判断。',
 'Derive dimensions, weights and observable performance levels from the task goal, including examples and deduction boundaries. For supplied work, cite evidence per criterion and explain scores with actionable improvements. Infer no personality or potential from text; label feedback as assistance with final judgment left to the teacher.',
 '目標から観点、配点、観察可能な水準、例、減点境界を設計。答案の証拠を観点別に引用し、点数と改善行動を説明する。文章から人格や将来性を推断せず、教師の最終判断を残す補助評価とする。']),
 ('misconceptions',['错题诊断与补练','Error diagnosis and practice','誤答分析・補充演習'],'错题|misconception|error diagnosis|誤答分析',[
 '比较学生步骤与正确思路，定位最早偏离的知识点，区分概念误解、计算疏漏与题意误读。先用提示引导订正，再给同知识点的变式题和答案解析。证据不足时列出可能原因与诊断问题，不仅复述标准答案。',
 'Compare the learner’s steps with valid reasoning to locate the earliest divergence. Distinguish conceptual errors, slips and misread questions. Use hints before correction, then give varied practice and worked answers. When evidence is insufficient, offer hypotheses and diagnostic questions instead of merely repeating the answer key.',
 '解答過程と正しい筋道を比べ最初のずれを特定し、概念誤解、計算ミス、読違いを分ける。ヒントから訂正へ導き、変形問題と解説を出す。根拠不足なら仮説と診断質問を示し、模範解答の反復だけにしない。'])])

module('localization','language',['软件与字幕本地化','Software and subtitle localization','ソフト・字幕のローカライズ'],['一个含按钮、报错和帮助文字的三语应用','a trilingual app with buttons, errors and help text','ボタン・エラー・ヘルプ文を含む3言語アプリ'],['原文文件、目标地区、术语表、变量与长度限制','source files, target region, glossary, variables and length limits','原文ファイル、対象地域、用語、変数、文字数制限'],['aishort-1','aishort-246'],[
 ('ui',['界面文案本地化','UI string localization','UI文言翻訳'],'界面翻译|UI strings|JSON|UI翻訳',[
 '只翻译显示给用户的字符串，保持JSON键、变量、占位符、转义、链接和结构不变。按按钮、错误、帮助等语境选择自然短句，处理复数、单位和日期格式。输出可解析文件及术语检查报告，列出缺少语境的条目，不擅自改业务含义。',
 'Translate user-visible strings only, preserving JSON keys, variables, placeholders, escapes, links and structure. Use natural concise wording for buttons, errors and help, handling plurals, units and dates. Deliver parseable content and a terminology report, flagging missing context without changing business meaning.',
 '表示文字列のみ訳し、JSONキー、変数、プレースホルダー、エスケープ、リンク、構造を保つ。ボタン・エラー・ヘルプの文脈で簡潔にし、複数形、単位、日付に配慮。解析可能な内容と用語点検を出し、文脈不足を明記する。']),
 ('subtitles',['字幕翻译与断句','Subtitle translation and segmentation','字幕翻訳・改行'],'字幕|subtitle|SRT|字幕翻訳',[
 '保留字幕编号、时间码和说话人信息，按目标语言阅读速度与每行限制翻译断句。不跨段挪动事实，标记无法在时长内自然表达的条目并给短版。输出原格式字幕与待检查清单，没有音视频时不声称验证了口型或听感。',
 'Preserve subtitle indices, timecodes and speaker information while translating for target-language reading speed and line limits. Do not move facts across segments. Flag overcrowded cues and suggest shorter versions. Return the original subtitle format plus checks; without media, claim no lip-sync or audio verification.',
 '番号、時間コード、話者を保ち、読速と一行制限に合わせ翻訳・改行する。事実を別区間へ移さず、収まらない字幕に短縮案を付ける。元形式と確認一覧を出し、映像音声なしで口形や聴感を確認済みにしない。']),
 ('glossary',['术语表与一致性检查','Glossary and consistency audit','用語集・一貫性確認'],'术语表|glossary|terminology|用語集',[
 '从源文抽取专有名词、产品词和高频概念，建立原词、推荐译法、禁用变体、定义和语境例句表。对已有译文查找不一致并给逐项修改理由。保留客户确定的术语，对无法判断的词给候选及确认问题，不用机械同词同译忽略语境。',
 'Extract names, product terms and recurring concepts into a table of source term, preferred translation, disallowed variants, definition and contextual examples. Audit existing translations with specific corrections and rationale. Preserve approved terminology; offer alternatives and questions for ambiguity rather than enforcing context-blind word substitution.',
 '固有名詞、製品語、頻出概念を原語、推奨訳、避ける形、定義、例文で整理。既訳の不一致に修正理由を付ける。承認済み用語を保ち、曖昧語は候補と質問を示す。文脈を無視した一律置換をしない。'])])

module('audio','creative',['播客配音与声音','Podcast, voice and sound','ポッドキャスト・音声'],['讲解一个真实城市故事的三分钟音频','a three-minute audio story about a real city','実在する街の話を伝える3分音声'],['受众、时长、已核实素材、发音要求和目标工具','audience, duration, verified material, pronunciation needs and target tool','聴衆、尺、確認素材、発音条件、対象ツール'],['aishort-160','aishort-204','pc-podcast'],[
 ('podcast',['播客单集脚本','Podcast episode script','ポッドキャスト台本'],'播客|podcast|ポッドキャスト',[
 '设计开场、叙事推进、访谈问题或独白、转场与结尾，标注时间、主持词、资料依据和必要声音提示。问题应针对嘉宾已知经历，不能预先编造其回答。提供节目简介与标题方案，控制总时长并标记需要授权的素材。',
 'Structure an opening, narrative progression, interview questions or monologue, transitions and close with timing, host copy, source basis and sound cues. Tailor questions to known guest experience without inventing answers. Include show notes and titles, check duration and identify material requiring permission.',
 '導入、展開、質問または独白、つなぎ、締めに時間、進行文、根拠、音の指示を付ける。既知の経験に質問を合わせ、ゲストの答えを作らない。概要と題名を出し、尺と利用許諾が必要な素材を確認する。']),
 ('voice',['配音稿与语气标注','Voice-over script and direction','ナレーション原稿・演出'],'配音|voice-over|narration|ナレーション',[
 '把原文调整为易朗读的句子，明确数字、缩写、多音字和专名读法，并标注停顿、重音、语速与情绪转折。给纯文本版和工具支持时的标记版，保留事实含义。不要冒用真实人物声线，未生成音频时仅交付脚本与参数建议。',
 'Make the text speakable, clarifying numbers, abbreviations and names, with pauses, emphasis, pace and emotional changes. Provide plain text and a markup version only when supported, preserving meaning. Do not impersonate a real person’s voice; if no audio is generated, deliver a script and parameter suggestions only.',
 '数字、略語、固有名詞の読みを明確にし、間、強調、速度、感情変化付きの話しやすい原稿にする。本文と対応時のみマークアップを出し意味を保つ。実在人物の声をなりすまさず、音声未生成なら原稿と設定案と明記。']),
 ('sound',['音效与配乐提示词','Sound effects and music briefs','効果音・音楽プロンプト'],'音效|sound design|music brief|効果音',[
 '按场景建立声音层次：主体声、环境、过渡和音乐，说明时长、节奏、音色、强弱、空间感与循环需求。逐条给可复制的生成提示词和禁用元素，标出对白需留出的空间。避免引用特定受保护旋律，不声称已经完成混音或版权清理。',
 'Define foreground, ambience, transitions and music per scene, specifying duration, rhythm, timbre, dynamics, space and looping. Give copyable generation prompts and exclusions while preserving room for dialogue. Avoid requesting a specific protected melody; do not claim completed mixing or rights clearance.',
 '主音、環境、移行、音楽の層を場面ごとに設計し、長さ、リズム、音色、強弱、空間、ループを指定。生成用文と除外要素、台詞の余地を示す。特定の保護旋律を求めず、ミックスや権利確認済みとしない。'])])

module('brand','creative',['品牌视觉与设计简报','Brand visuals and briefs','ブランド視覚・制作要項'],['面向年轻创作者的原创文具品牌','an original stationery brand for young creators','若い制作者向けのオリジナル文具ブランド'],['品牌定位、使用场景、现有素材、目标受众及限制','positioning, use cases, existing assets, audience and constraints','位置付け、利用場面、既存素材、読者、制約'],['aishort-54','aishort-245','aishort-254'],[
 ('mood',['情绪板与视觉方向','Moodboard and visual direction','ムードボード・視覚方針'],'情绪板|moodboard|ムードボード',[
 '从品牌目标提炼三种有区别的视觉方向，分别说明颜色、字体性格、构图、材质与参考类型。给每个方向可复制的图片提示词、适用场景和取舍，不用形容词堆砌代替画面描述。无法查看参考图时明确依据的是文字描述。',
 'Develop three distinct visual directions from brand goals, explaining palette, typographic character, composition, materials and reference types. Provide image-generation prompts, use cases and tradeoffs for each. Describe concrete imagery rather than adjective piles; when references are unseen, state that interpretation is based on text.',
 '目標から異なる3方向を作り、配色、書体の性格、構図、質感、参考種を説明。各方向に画像生成文、用途、取捨を付け、形容詞の羅列でなく具体画面を記述。画像未確認なら文章からの解釈と明示する。']),
 ('logo',['标志与图标设计简报','Logo and icon brief','ロゴ・アイコン制作要項'],'标志|logo|icon brief|ロゴ',[
 '明确标志表达的概念与应用尺寸，给符号结构、字标关系、单色版、深浅背景和小尺寸可辨识性要求。提出不同概念方案及生成提示词，避免模仿现有品牌。区分草案与可交付矢量文件，并列商标检索和人工修整待办。',
 'Define concept and application sizes, then specify symbol structure, wordmark relationship, monochrome use, light/dark backgrounds and small-size legibility. Offer distinct concepts and generation prompts without imitating existing brands. Separate drafts from deliverable vector files and list trademark checks and manual refinement needs.',
 '概念と利用寸法から記号構造、文字との関係、単色、明暗背景、小サイズ判読性を定める。既存ブランドを模倣しない複数案と生成文を出す。草案と納品ベクターを区別し、商標調査と手修正を待作業として示す。']),
 ('guide',['轻量品牌规范','Compact brand guide','小規模ブランドガイド'],'品牌规范|brand guide|ブランド規則',[
 '将已选方向整理成颜色值、字体替代、间距、图像风格、图标和语气规则，配正确与错误使用例。说明网页、社交图片和演示页的应用差异，给可复用设计变量。缺少正式素材时标明临时建议，不把生成图当作最终品牌资产。',
 'Turn the chosen direction into color values, font fallbacks, spacing, imagery, icons and voice rules with do/don’t examples. Explain web, social-image and slide applications and provide reusable design tokens. Label provisional choices when approved assets are missing; generated images are not automatically final brand assets.',
 '選定方向を色値、代替書体、余白、画像、アイコン、語調の規則と良否例にまとめる。Web・SNS画像・スライドの差と再利用変数を示す。正式素材なしなら暫定案と明記し、生成画像を最終資産と決めない。'])])

module('production','creative',['动画前期与连续性','Animation preproduction','アニメ前制作・連続性'],['同一角色从房间走到街道的短动画','a short animation following one character from a room to a street','同一人物が部屋から通りへ歩く短編アニメ'],['故事梗概、角色设定、场景图、时长和生成工具','synopsis, character design, scene references, duration and generation tool','あらすじ、人物設定、場面資料、尺、生成ツール'],['aishort-16','aishort-274'],[
 ('bible',['角色与场景设定册','Character and scene bible','人物・場面設定集'],'设定册|character bible|场景设定|設定集',[
 '建立稳定ID与不可变特征，描述角色比例、服装、道具、材质和场景方位、出入口、光源及时间。区分固定设定和每镜可变状态，提供正侧背视图与场景俯视图提示词。遇到参考冲突先列差异，不为丰富画面随意改变人物或空间。',
 'Assign stable IDs and invariant traits for proportions, clothing, props and materials, plus scene orientation, entrances, lighting and time. Separate fixed design from shot-specific state. Supply front/side/back and overhead-reference prompts. Flag conflicting references instead of changing characters or geography for visual variety.',
 '固定IDと不変特徴を設け、体型、服、道具、質感、方位、出入口、光源、時刻を記述。固定設定とカット別状態を分離し、三面図と俯瞰図の生成文を出す。参照矛盾を明記し、見映えで人物や空間を変えない。']),
 ('shots',['景别与镜头清单','Shot sizes and shot list','画角・ショットリスト'],'镜头清单|shot list|景别|ショットリスト',[
 '按叙事目的安排远景交代空间、中景呈现动作、近景表达细节，避免机械轮流使用。每镜给编号、时长、人物位置、视线、动作起止、机位、运动和转场；汇总时长。把静态画面提示词和视频运动提示词分开，并延续场景与角色ID。',
 'Choose wide shots for geography, medium shots for action and close-ups for detail according to narrative purpose, not a mechanical cycle. For each shot, specify ID, duration, positions, eyelines, start/end action, camera, motion and transition. Reconcile runtime and separate still-image prompts from motion prompts using stable character/scene IDs.',
 '物語の目的で遠景は空間、中景は動作、近景は詳細に使い、機械的交替を避ける。番号、尺、位置、視線、動作前後、カメラ、移動、つなぎを各カットに記す。合計尺を確認し、固定IDで静止画文と動画運動文を分ける。']),
 ('continuity',['跨镜头连续性检查','Cross-shot continuity checks','カット間連続性の点検'],'连续性|continuity|穿帮|連続性',[
 '用镜头对照表检查服装、道具归属、位置、动作、视线、轴线、光线和时间的延续。逐项列问题、证据、影响镜头和最小修正提示词，区分刻意跳切与错误。没有实际帧图时检查文字计划并标注待视觉复核，不能声称已消除穿帮。',
 'Compare shots for costume, prop ownership, position, action, eyelines, axis, lighting and time. List issue, evidence, affected shots and minimal corrective prompts, distinguishing intentional cuts from mistakes. Without frames, review the textual plan and flag visual checks still needed; do not claim continuity defects are eliminated.',
 '衣装、道具、位置、動作、視線、軸、光、時刻をカット対照表で点検。問題、証拠、対象、最小修正文を示し意図的カットと誤りを分ける。実フレームなしなら文字計画の確認とし、目視待ちを残す。'])])

module('productivity','life',['个人效率与信息整理','Personal organization','個人の効率・情報整理'],['工作与学习并行且每周可用时间有限的安排','balancing work and study with limited weekly time','仕事と学習を限られた週時間で両立する計画'],['现有任务、固定日程、目标、精力限制和工具','current tasks, fixed commitments, goals, energy limits and tools','現タスク、固定予定、目標、体力制約、ツール'],['aishort-70','aishort-215','aishort-279'],[
 ('review',['每周复盘与安排','Weekly review and planning','週次レビュー・計画'],'每周复盘|weekly review|週次レビュー',[
 '对照目标回顾已完成、延期与取消事项，分析时间消耗和阻塞，不做道德化评判。选出下周少量重点，安排可用时段、缓冲和最小行动，并写明确的放弃或顺延清单。计划总量不得超过用户提供的时间。',
 'Review completed, delayed and cancelled tasks against goals, examining time and blockers without moral judgment. Choose a small set of priorities, schedule available time with buffers and minimum actions, and state what will be dropped or deferred. Keep planned effort within the supplied time budget.',
 '目標に対し完了、延期、中止を見直し、時間と障害を道徳的評価なしで分析。翌週の少数重点、空き枠、余裕、最小行動を決め、行わない項目を明示。作業量は提供された時間を超えない。']),
 ('checklist',['可复用检查清单','Reusable checklists','再利用チェックリスト'],'检查清单|checklist|チェックリスト',[
 '把重复任务拆成准备、执行、核对与收尾，每项写成可观察的单一动作。加入触发条件、异常分支和完成证据，标明必做与可选；删除无法勾选的空泛要求。提供适合打印或粘贴到任务软件的版本。',
 'Break a recurring task into preparation, execution, verification and closure, with one observable action per item. Add triggers, exception branches and completion evidence; distinguish required from optional steps and remove vague uncheckable advice. Provide a printable or task-app-ready version.',
 '反復作業を準備、実行、確認、終了に分け、一項目一つの観察可能な行動にする。条件、例外、完了証拠、必須・任意を付け、チェック不能な抽象助言を除く。印刷やタスクアプリに使える形式を出す。']),
 ('knowledge',['个人知识库整理','Personal knowledge organization','個人ナレッジ整理'],'知识库整理|knowledge organization|笔记分类|ノート整理',[
 '按检索和复用目的设计少量稳定分类、标签和命名规则，给示例笔记的归类、摘要、关联与后续行动。区分原始资料、个人理解和待核实信息，设置来源字段和去重规则。先给迁移映射与预览，不默认删除原文件或重排全部资料。',
 'Design a small stable set of categories, tags and naming rules around retrieval and reuse. Classify sample notes with summaries, links and follow-up actions. Separate source material, interpretation and unverified information, including provenance and deduplication rules. Provide migration mapping and preview before any file changes.',
 '検索・再利用を軸に少数の安定分類、タグ、命名規則を作り、例ノートの分類、要約、関連、次の行動を示す。原資料、解釈、未確認を分け出典と重複規則を付ける。変更前に移行対応とプレビューを出し原本を削除しない。'])])

# Preserve exact sources and a human-readable audit trail without treating source text as commands.
aishort=read('data/imports/aishort.json');ai_manifest=read('data/imports/manifest.json');pc_manifest=read('data/sources/prompts-chat/manifest.json')
raw=(root/'data/sources/prompts-chat/prompts.csv').read_bytes();assert hashlib.sha256(raw).hexdigest()==pc_manifest['sha256']
csv.field_size_limit(10000000);pc=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
pc_names={'pc-search':'Building a Scalable Search Service with FastAPI and PostgreSQL','pc-data':'Data Analyst','pc-resume':'Act as a Resume Reviewer','pc-support':'AI Customer Support Specialist','pc-seo':'SEO specialist','pc-links':'Internal Linking SEO Assistant','pc-podcast':'Master Podcast Producer & Sonic Storyteller','pc-devops':'DevOps Automator'}
refs=[]
for sid in sorted({s for m in modules for s in m['sources']}):
 if sid.startswith('aishort-'):
  s=next(t for t in aishort if t['id']==sid);refs.append({'id':sid,'title':s['title'],'body':s['content'],'repository':ai_manifest['upstream'],'commit':ai_manifest['commit'],'record':s['sourceRecordId'],'license':'MIT'})
 else:
  index,s=next((i,s) for i,s in enumerate(pc) if s['act']==pc_names[sid]);refs.append({'id':sid,'title':s['act'],'body':s['prompt'],'repository':pc_manifest['repository'],'commit':pc_manifest['commit'],'recordIndex':index,'license':'CC0-1.0'})
write('data/research-library/practical-source-review.json',{'date':'2026-09-14','status':'selected-sources-reviewed; original-task-adaptations','notes':['AI Short public curated snapshot unchanged at the checked revision. No claim to copy the online community.','Removed simulated execution claims, mandatory tool integrations and unsupported outcome guarantees.','Source roles are inspiration; task labels and deliverables were split and rewritten rather than blindly retaining role names.'],'records':refs})
write('data/studio/practical-tasks.json',tasks)
write('data/studio/practical-modules.json',modules)
for l in locales:
 base=next(t for t in read('data/studio/'+l+'.json') if t['id']=='custom-copy');items=[]
 for m in modules:
  t=copy.deepcopy(base);group_tasks=[g for g in tasks if g['group']==m['group']]
  t.update(id=m['id'],slug='guided-'+m['group'],categoryId=m['category'],title=m['labels'][l],description=' / '.join(g['labels'][l] for g in group_tasks),tags=[g['labels'][l] for g in group_tasks])
  field=next(f for f in t['fields'] if f['key']=='task');field['options']=[g['labels'][l] for g in group_tasks];field['defaultValue']=field['options'][0]
  if m['category']=='programming':
   labels={'audience':['技术栈与运行环境','Stack and runtime','技術構成・実行環境'],'materials':['相关代码、接口或日志','Relevant code, APIs or logs','関連コード・API・ログ'],'criteria':['预期行为与验收测试','Expected behavior and acceptance tests','期待動作・受入テスト']}
  elif m['group']=='analytics':
   labels={'audience':['指标口径与分析读者','Metric definitions and audience','指標定義・利用者'],'materials':['样例数据与字段说明','Sample data and field definitions','例データ・項目定義'],'criteria':['结果核对与交付格式','Result checks and delivery format','結果照合・納品形式']}
  elif m['group'] in ['audio','production','brand']:
   labels={'audience':['受众与使用场景','Audience and use case','対象者・利用場面'],'materials':['设定、参考与已有素材','Design references and existing assets','設定・参考・既存素材'],'criteria':['时长、尺寸与一致性要求','Duration, dimensions and consistency','尺・寸法・一貫性要件']}
  elif m['group']=='localization':
   labels={'audience':['目标语言、地区与用户','Target language, region and users','訳先言語・地域・利用者'],'materials':['原文文件、术语与占位符','Source files, glossary and placeholders','原文・用語・プレースホルダー'],'criteria':['格式、长度与校验要求','Format, length and validation','形式・文字数・検証要件']}
  else:labels={}
  for f in t['fields']:
   if f['key'] in labels:f['label']=loc(labels[f['key']])[l]
  items.append(t)
 write('data/studio/practical/'+l+'.json',items)
assert len(modules)==20 and len(tasks)==60 and len({g['id'] for g in tasks})==60
print(f'Generated {len(modules)} modules, {len(tasks)} task templates and {len(refs)} source reviews in three languages.')
