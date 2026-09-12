"""Pinned, manually reviewed adaptations. Upstream text is data, never instructions."""
import pathlib,json,csv,io
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'data/sources/prompts-chat'
csv.field_size_limit(10000000)
rows=list(csv.DictReader(io.StringIO((p/'prompts.csv').read_text(encoding='utf-8-sig'))))
sha=json.loads((p/'manifest.json').read_text())['commit']
def loc(values): return dict(zip(['zh','en','ja'],values))
items=[]
def add(index,id,task,terms,titles,details,examples):
 r=rows[index]
 items.append(dict(id=id,task=task,terms=terms.split('|'),labels=loc(titles),details=loc(details),examples=loc(examples),source={'title':r['act'],'contributor':r['contributor'],'url':f'https://github.com/f/prompts.chat/blob/{sha}/prompts.csv','recordIndex':index,'license':'CC0-1.0','commit':sha},status='published',editorialVersion=1))
add(30,'navigation','build','导航|navigation|ナビゲーション',
 ['移动端导航','Mobile navigation','モバイルナビゲーション'],
 ['先列用户路径、入口和返回规则；交付路由映射、完整组件与样式。实现当前页状态、键盘操作、窄屏折叠及空状态。验证深链接、刷新、返回和菜单关闭，沿用已有路由框架。', 'Map user journeys, entry points and back behavior. Deliver routes, complete components and styles with active states, keyboard controls, narrow-screen collapse and empty states. Check deep links, refresh, back navigation and menu dismissal using the existing router.', '利用経路、入口、戻る操作を整理し、ルート一覧とコンポーネント・スタイルを納品する。現在地表示、キーボード操作、狭い画面の折りたたみ、空状態に対応。直接アクセス、再読み込み、戻る、メニュー終了を既存ルーターで検証する。'],
 ['实现移动端分类导航，支持当前分类高亮、返回和键盘操作。','Build mobile category navigation with active states, back navigation and keyboard support.','モバイルのカテゴリナビゲーションを実装。現在地表示、戻る、キーボード操作に対応。'])
add(114,'role-app','build','角色权限|role-based|rbac|ロール権限',
 ['角色权限功能','Role-based application','ロール別の機能'],
 ['建立角色×资源×操作的权限矩阵。交付数据模型、服务端鉴权、接口与页面状态，不能只隐藏按钮。验证未登录、跨用户访问、角色变化与失败路径。说明配置、迁移和回滚，沿用已有认证方式。','Define a role × resource × action permission matrix. Deliver the data model, server authorization, endpoints and UI states; hidden buttons are not authorization. Test anonymous and cross-user access, role changes and failure paths. Document configuration, migration and rollback using existing authentication.','ロール×リソース×操作の権限表を作る。データモデル、サーバー認可、API、画面状態を実装し、ボタン非表示だけで認可しない。未認証、他ユーザーへのアクセス、権限変更、失敗経路を検証。既存認証を維持し、設定・移行・戻し方を示す。'],
 ['实现团队收藏的角色权限：成员只修改自己的条目，管理员管理团队内容。','Implement role-based team collections: members edit their own entries; admins moderate the team.','チーム保存機能のロール権限を実装。メンバーは自分の項目のみ編集し、管理者は全体を管理。'])
add(126,'login-qa','review','登录测试|login testing|ログインテスト',
 ['登录质量检查','Login quality checks','ログイン品質チェック'],
 ['覆盖正确与错误凭据、空输入、过期会话、退出后访问和尝试次数限制。逐项写前置条件、步骤、预期值、严重程度和证据位置。未执行标未测试，区分缺失需求与已复现缺陷，不对生产账号压测。','Cover valid/invalid credentials, empty input, expired sessions, access after logout and rate limits. Give prerequisites, steps, expected results, severity and evidence locations. Mark unexecuted cases as not tested; separate missing requirements from reproduced bugs. Do not load-test production accounts.','正しい・誤った認証情報、空入力、期限切れ、ログアウト後のアクセス、試行回数制限を確認。前提、手順、期待値、重要度、証拠を記す。未実行は未検証とし、要件不足と再現済み不具合を分け、本番アカウントで負荷試験しない。'],
 ['对提供的接口与页面做登录测试，输出用例和缺陷报告。','Review the supplied endpoint and page with login testing cases and defect reports.','提供するAPIと画面のログインテストを行い、ケースと不具合報告を作成。'])
add(132,'evidence-review','review','证据审查|evidence review|根拠付きレビュー',
 ['按证据审查代码','Evidence-based review','根拠付きレビュー'],
 ['按影响排序，每个缺陷包含文件位置、触发输入、错误行为、影响、最小修复和回归用例。分开已证实问题、待验证风险与可选风格建议。未提供文件不能假装看过；无实质问题也说明覆盖范围。','Rank defects by impact, with file location, triggering input, faulty behavior, minimal fix and regression case. Separate confirmed bugs, unverified risks and optional style advice. Never claim to inspect unavailable files; state scope even when no material issue is found.','影響順で不具合を並べ、ファイル位置、再現入力、誤動作、影響、最小修正、回帰ケースを示す。確定事項、未検証リスク、任意のスタイル改善を分ける。未提供ファイルを確認済みにせず、問題がなくても対象範囲を記す。'],
 ['对订单金额计算差异做证据审查，检查舍入、退款和空数据。','Perform an evidence review of order-total changes, checking rounding, refunds and empty data.','注文金額の差分を根拠付きレビューし、丸め、返金、空データを確認。'])
add(133,'a11y','review','无障碍|accessibility|アクセシビリティ',
 ['网页无障碍','Web accessibility','ウェブアクセシビリティ'],
 ['检查键盘顺序、焦点显示与恢复、可访问名称、表单错误和对比度。给复现步骤、影响用户、能核实的标准条目、修正代码与复测方法。区分自动检查和人工读屏；没有工具时只审查提供的代码，不宣称合规认证。','Check keyboard order, visible/restored focus, accessible names, form errors and contrast. Give reproduction steps, affected users, verified standard references, fixes and retesting. Separate automated scans from manual screen-reader checks. Without tools, review supplied code only; do not certify compliance.','キー操作順、フォーカス表示と復帰、名前付け、フォームエラー、コントラストを確認。手順、影響する利用者、確認済み基準、修正、再検証方法を示す。自動検査と手動読み上げを分け、ツールなしで適合認証を断言しない。'],
 ['检查弹窗表单的无障碍问题，重点是焦点、错误提示和关闭后恢复。','Audit dialog form accessibility, especially focus, error announcements and focus restoration.','ダイアログのアクセシビリティを確認。フォーカス、エラー通知、閉じた後の復帰を重点検証。'])
add(172,'unit-tests','build','单元测试|unit test|単体テスト',
 ['边界与异常测试','Boundary and failure tests','境界値・異常系テスト'],
 ['从函数契约推导正常、边界和异常测试矩阵，列预期值与依据。交付已有框架可运行的测试、最少夹具、稳定的时钟和服务替身。测试行为而非照抄实现；提供命令和未覆盖的集成行为，不编造覆盖率。','Derive normal, boundary and failure tests from the function contract, with expected values and rationale. Deliver runnable tests, minimal fixtures and deterministic clock/service doubles in the existing framework. Test behavior rather than implementation copies. Include commands and untested integration behavior; never invent coverage.','関数の契約から正常系・境界値・異常系の表と期待値・根拠を作る。既存フレームワークのテスト、最小データ、安定した時刻・サービス代替を納品。実装の写しではなく振る舞いを検証し、実行方法と未検証の結合動作を示す。カバレッジを捏造しない。'],
 ['为折扣函数编写单元测试，覆盖零值、负数、精度、上限和非法输入。','Write unit tests for discounts covering zero, negatives, precision, caps and invalid input.','割引関数の単体テストを作成。ゼロ、負数、精度、上限、不正入力を網羅。'])
add(1146,'spa-routing','debug','白屏|刷新404|spa|blank page|refresh 404|真っ白|再読み込み404',
 ['SPA 白屏与路由','SPA rendering and routing','SPAの表示・ルート障害'],
 ['区分构建失败、资源路径、客户端异常与服务端路由回退。用控制台和网络证据组织假设→检查→结果→修复，不默认有后端。给适合部署平台的最小改动，验证首页、嵌套路由、刷新、缓存更新和回退方式。','Distinguish build failures, asset paths, client exceptions and server route fallback. Use console/network evidence in a hypothesis/check/result/fix sequence without assuming a backend. Deliver minimal deployment-specific changes; verify home, nested routes, refresh, cache updates and rollback.','ビルド失敗、アセットパス、クライアント例外、ルートフォールバックを切り分ける。コンソール・通信の証拠から仮説、確認、結果、修正を示す。配信先に合う最小変更を行い、トップ、深いURL、再読み込み、キャッシュ更新と戻し方を検証。'],
 ['Vite SPA 首页正常，嵌套路由刷新404，根据配置修复。','A Vite SPA works at home but nested routes return refresh 404 errors. Diagnose its configuration.','Vite SPAで深いURLが再読み込み404になる。設定から原因を修正。'])
add(113,'fantasy-image','image','幻想场景|fantasy landscape|幻想風景',
 ['幻想场景构图','Fantasy composition','幻想風景の構図'],
 ['将主题落实为一个主角、前中后景、尺度参照、明确光源与有限配色。给核心画面提示词及两个只改变构图的变体，避免矛盾风格堆叠。目标工具只保留必要视觉短语，未知版本不加专用参数。','Specify one focal subject, foreground/midground/background, scale cues, a clear light source and limited palette. Deliver a core visual prompt plus two composition-only variants. Avoid conflicting style stacks. Keep essential visual phrases and omit unverified version-specific parameters.','主役一つ、前景・中景・遠景、尺度比較、明確な光源、限定した配色を指定。基本プロンプトと構図だけを変える二案を作る。矛盾する画風を重ねず、必要な視覚表現に絞り、未確認の専用パラメーターは省く。'],
 ['制作巨树图书馆的幻想场景，人物作比例参照，暖灯与冷月光分层。','Create a fantasy landscape of a giant-tree library with a figure for scale, warm lamps and cool moonlight.','巨木の図書館の幻想風景。人物を尺度比較にし、暖かいランプと冷たい月光を描き分ける。'])
add(1064,'product-grid','image','产品九宫格|product grid|商品グリッド',
 ['产品九宫格','Nine-panel product grid','商品の9コマ構成'],
 ['锁定产品轮廓、材质、色彩与比例。九格依次展示主视觉、表面、环境、使用、阵列、悬浮、细节、创意场景和全景。逐格给可复制提示词及统一灯光和拼版说明。精确标志文字建议后期排版，不保证逐字还原。','Lock product shape, material, color and proportions. Use nine panels for hero, surface, context, use, array, floating view, detail, creative setting and wide view. Supply per-panel prompts with shared lighting and assembly instructions. Use post-production for exact lettering when needed; do not promise perfect reproduction.','商品の形、素材、色、比率を固定。主役、表面、環境、使用、整列、浮遊、細部、創作場面、全景の9コマを作る。共通照明、各コマのプロンプト、組版方法を示す。正確な文字は必要なら後加工にし、完全再現を保証しない。'],
 ['制作陶瓷咖啡杯产品九宫格，构图变化但杯型、釉面与灯光统一。','Create a ceramic cup product grid with varied composition and consistent shape, glaze and lighting.','陶器カップの商品グリッドを9コマで制作。構図を変えつつ形、釉薬、照明を統一。'])
add(716,'photo-story','storyboard','照片分镜|photo storyboard|写真から絵コンテ',
 ['照片转九镜头分镜','Photo-to-storyboard','写真から9カット絵コンテ'],
 ['能看到照片才提取人物、服装、道具和位置；否则依赖文字并标未知点。建立有开场、发展、结局的九镜头，不机械裁切照片。逐镜给景别、动作、机位、连续性锚点、时长和独立提示词，并说明参考图上传位置。','Inspect character, wardrobe, props and positions only when the photo is visible; otherwise use text and flag unknowns. Create nine narrative shots with a beginning, development and ending, not nine crops. Specify framing, action, camera, continuity anchors, duration, individual prompts and reference attachment steps.','写真が見える場合のみ人物、衣装、小道具、位置を抽出し、それ以外は文章と未確定点を使う。単なる9分割ではなく導入・展開・結末の9カットを作る。画角、動作、カメラ、連続性、尺、各プロンプトと参照添付手順を示す。'],
 ['根据人物照片分镜，制作雨后散步的九镜短片，保持衣服、发型和方向连续。','Create a nine-shot photo storyboard of a walk after rain, preserving wardrobe, hair and direction.','人物写真から絵コンテを9カット作成。雨上がりの散歩で衣装、髪型、方向を統一。'])
add(1707,'six-beats','storyboard','六格分镜|six-panel|6-panel|6コマ',
 ['六格叙事','Six-beat narrative','6コマの物語'],
 ['按环境、反应、发现、情绪特写、转折、结局构造六格，一格一个主要动作。固定脸、发型、衣服和道具；逐格给因果承接、景别、动作、对白与提示词。视频拆成单镜生成后剪辑，不把六次转场塞进单镜提示词。','Use establishing, reaction, discovery, emotional close-up, turning point and resolution, with one principal action per panel. Lock face, hair, wardrobe and props. Give causal continuity, framing, action, dialogue and prompts. For video, generate separate shots and edit them together.','環境、反応、発見、感情のアップ、転換、結末の6コマを作り、主動作を一つずつにする。顔、髪、衣装、小道具を固定し、因果、画角、動作、台詞、プロンプトを示す。動画は単一カットずつ生成して編集する。'],
 ['制作六格分镜：机器人发现干枯植物，寻找水源并照顾它，最后出现新芽。','Create a six-panel story of a robot finding a dry plant, seeking water, tending it and seeing a sprout.','6コマの物語：ロボットが枯れた植物を見つけ、水を探して世話をし、新芽が出る。'])
add(1733,'character-motion','clip','卡通微动作|cartoon motion|カートゥーンの動き',
 ['卡通单镜头动作','Cartoon single-shot motion','カートゥーンの単一動作'],
 ['从故事中提炼一个可见动作，如平地上抬头挥手。固定脸型、毛色、衣服和场景，写清起始姿态、幅度、终止姿态和机位。给首帧描述、短运动提示词和连续性检查项。多角色救援改用分镜；不保证无缝循环。','Extract one visible action, such as looking up and waving on level ground. Lock face, fur, wardrobe and setting; specify start pose, range, end pose and camera. Deliver a first-frame description, concise motion prompt and continuity checks. Multi-character rescues need storyboards; seamless loops are not guaranteed.','平地で顔を上げ手を振るなど一つの見える動作に絞る。顔、毛色、衣装、背景を固定し、開始姿勢、動く幅、終了姿勢、カメラを明示。初期フレーム、短い動作プロンプト、連続性確認を作る。複数人物の救助は絵コンテに分け、完全なループを保証しない。'],
 ['制作卡通微动作：草地上的白兔抬头轻挥手，固定镜头和角色外观。','Create cartoon motion: a white bunny on grass looks up and waves, with a locked camera and consistent appearance.','カートゥーンの動き：草地の白ウサギが顔を上げ手を振る。カメラと外見を固定。'])
(root/'data/studio/prompts-chat-curated.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(p/'selected.json').write_text(json.dumps([{'index':x['source']['recordIndex'],**rows[x['source']['recordIndex']]} for x in items],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({'curated':len(items),'localizations':len(items)*3})
