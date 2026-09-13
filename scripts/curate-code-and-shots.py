"""Original, localized scenarios. Source observations are recorded in docs."""
import json,pathlib
p=pathlib.Path(__file__).resolve().parents[1]
items=[]
def add(id,task,terms,titles,details,examples):
 loc=lambda x:dict(zip(['zh','en','ja'],x))
 items.append(dict(id=id,task=task,terms=terms.split('|'),labels=loc(titles),details=loc(details),examples=loc(examples)))
add('paginated-query','build','分页|pagination|skip|limit|ページ分割',
 ['分页、筛选与稳定排序','Pagination, filters and stable ordering','ページ分割・絞り込み・安定した並び順'],
 ['基于现有接口交付分页查询实现、参数契约和测试。明确页码或offset从零还是一开始，限制limit范围并拒绝非法类型或负数。选择offset或游标应依据数据规模与一致性需求，不直接把教程中的列表切片当生产数据库方案。先筛选再分页，使用稳定排序及唯一键作为并列排序依据，参数化查询并限制允许的排序字段。定义空页、末页、越界、总数或hasNext的语义；筛选变化时重置页码。验证默认值、首尾页、重复排序值、空结果、非法参数和权限范围，标明并发新增时offset分页的局限。交付代码、请求响应样例和实际或未执行的测试说明。',
 'Implement pagination within the existing API with a parameter contract and tests. Define zero/one-based indexing, bound limit and reject invalid types or negative values. Choose offset or cursor based on scale and consistency; an in-memory tutorial slice is not a production database design. Filter before paging, use stable ordering with a unique tie-breaker, parameterize queries and allowlist sort fields. Define empty, last and out-of-range pages and total/hasNext semantics; reset the page when filters change. Test defaults, boundaries, tied values, empty results, invalid parameters and authorization scope. Explain offset limitations under concurrent inserts. Supply code, request/response examples and honest execution status.',
 '既存APIに合わせ、パラメーター契約とテストを含むページ分割を実装する。開始番号、limit上限を定め、不正な型や負数を拒否する。規模と整合性からoffsetかカーソルを選び、教材の配列スライスを本番DB設計とみなさない。絞り込み後に分割し、一意キーで同順位を安定させ、クエリをパラメーター化してソート項目を制限する。空・最終・範囲外ページ、total/hasNextを定義し、条件変更時にページを戻す。既定値、境界、同順位、空結果、不正値、権限を検証し、同時追加時のoffsetの制約と実行状況を示す。'],
 ['订单列表每页20条，按状态筛选、时间和ID稳定排序，处理空页和非法参数。','Build an order list with 20 items per page, status filters and stable time/ID ordering.','注文一覧を20件ずつ表示し、状態で絞り込み、日時とIDで安定して並べてください。'])
add('background-job','build','后台任务|background task|job queue|バックグラウンド処理',
 ['后台任务与执行状态','Background tasks and execution states','バックグラウンド処理と実行状態'],
 ['先明确任务耗时、是否必须持久化和可否重复执行。轻量进程内后台任务与持久队列分开选择，不承诺进程退出后内存任务仍会完成。返回已接受不等于已完成；如需查询进度，定义任务ID、排队/运行/成功/失败状态及读取权限。传递必要的不可变数据，不把已关闭的请求资源传入任务。写清超时、失败记录、重试上限和幂等条件，避免重复通知或重复扣款；日志脱敏。交付最小代码、调用与状态样例，测试成功、失败、重复提交及适用的进程重启场景；仅在需求必要时引入队列组件。',
 'Establish duration, durability and repeatability requirements. Choose lightweight in-process work or a durable queue deliberately; memory tasks are not guaranteed after process exit. Accepted is not completed. If progress is needed, define job IDs, queued/running/succeeded/failed states and read permissions. Pass necessary immutable data, not closed request-scoped resources. Specify timeouts, failure records, retry limits and idempotency to prevent duplicate effects; redact logs. Deliver minimal code and invocation/state examples. Test success, failure, duplicate submission and process restart where relevant. Add queue infrastructure only when required.',
 '処理時間、永続化、再実行の可否を確認し、軽量なプロセス内処理と永続キューを選び分ける。プロセス終了後の完了を保証しない。受付と完了を区別し、進捗が必要ならID、待機・実行・成功・失敗、閲覧権限を定義する。終了済みのリクエスト資源ではなく必要な不変データを渡す。時間切れ、失敗記録、再試行上限、冪等性、ログの秘匿を定める。最小コードと呼出・状態の例を納品し、成功、失敗、重複送信、必要なら再起動を検証する。'],
 ['为报表导出加入后台处理，用户能查询任务状态；说明是否需要持久队列。','Run report export in the background with status lookup and an explicit durability decision.','レポート出力をバックグラウンド化し、状態確認と永続キューの要否を示してください。'])
add('upload-validation','review','上传校验|文件安全|upload validation|file validation|アップロード検証',
 ['上传接口与文件校验审查','Upload endpoint and file validation review','アップロードAPIとファイル検証のレビュー'],
 ['只审查现有上传流程，按证据列问题和最小修复。区分将全文件读入bytes与流式或临时文件处理，核对代理、框架和业务层的容量限制。文件名、扩展名与客户端Content-Type不可信；按需求验证实际文件类型、大小和解析结果，生成服务端存储名并防止路径越界。检查读取结束后的关闭、失败临时文件清理、鉴权与下载访问范围，不把上传成功等同文件安全。给出超限、伪造类型、空文件、异常中断和跨用户读取的测试计划。没有执行证据时标记待验证，不擅自重写系统。',
 'Review the existing upload flow with evidence and minimal fixes. Distinguish loading all bytes from streamed or temporary-file handling; check proxy, framework and application limits. Treat filename, extension and client Content-Type as untrusted. Validate actual type, size and parsing as required, generate storage names and prevent path escape. Check closing, failed temporary-file cleanup, authentication and download access scope. Successful upload is not proof of safety. Plan tests for oversize, spoofed type, empty files, interruption and cross-user reads. Mark unverified claims and avoid an unsolicited rewrite.',
 '既存アップロード処理を根拠と最小修正でレビューする。全体をbytesに読む方式とストリーム・一時ファイルを区別し、プロキシ、フレームワーク、業務層の容量制限を確認する。名前、拡張子、Content-Typeを信用せず、実体の形式、容量、解析結果を要件に応じて検証する。保存名を生成し、パス逸脱を防ぐ。終了処理、一時ファイル、認証、取得権限を確認する。容量超過、偽装形式、空、途中失敗、他利用者の参照を検証し、未確認は明記する。'],
 ['审查现有图片上传接口：仅允许PNG/JPEG、5MB以内，并隔离不同用户的文件。','Review a PNG/JPEG upload endpoint with a 5 MB limit and per-user access isolation.','PNG/JPEG・5MB上限の画像アップロードと利用者別アクセスをレビューしてください。'])
add('video-close','clip','近景|特写|close-up|close shot|クローズアップ|寄り',
 ['近景视频：表情与细节','Close shot: expression and detail','近景動画：表情と細部'],
 ['交付近景单镜头提示词。先明确是胸部以上的人物近景，还是脸/手/物体局部特写；不能把两者混为一谈。默认人物胸部以上构图，眼睛或关键细节为清晰焦点，留出视线和轻微动作空间；背景提供方位但不抢主体。写清一个可见动作的起始、变化、结束，如目光抬起或手指转动戒指；避免近景同时要求完整奔跑和全场景展示。固定或轻微推进的机位按需求选择，区分主体动作与摄影机运动。锁定脸、衣服、道具、光源与上一镜一致。分别输出静态首帧和动态视频正文，附时长、画幅与末帧状态；景别不等于固定焦段，不强填未知设备参数。',
 'Deliver one close-shot prompt. Specify whether this is a chest-up character shot or a tighter face/hand/object detail; do not conflate them. Default to chest-up, keep eyes or the key detail sharp and leave eyeline/action room. The background supplies orientation without dominating. Describe one visible action from start through change to finish, such as lifting the gaze or turning a ring; do not demand a full running body and an entire location simultaneously. Choose a static camera or gentle push as needed, separating subject and camera motion. Preserve identity, costume, props and light from adjacent shots. Output separate still-first-frame and motion text with duration, aspect ratio and end state. Framing does not mandate a fixed lens.',
 '人物の胸上の近景か、顔・手・小物のさらに寄った特写かを明記する。既定は胸上で、目や重要部分に焦点を置き、視線と小さな動作の余白を残す。背景は位置を伝える程度にする。視線を上げる、指輪を回すなど一つの動作の始まり・変化・終わりを書く。全身の走りと場所全体を同時に要求しない。固定または緩い寄りを選び、被写体とカメラの動きを分ける。人物、服、小物、光を前後で維持し、静止開始画と動画本文、尺、比率、終状態を別々に出す。画角だけで焦点距離を決めない。'],
 ['5秒近景：女孩胸部以上入镜，抬眼看向窗外，镜头固定，下午柔光。','5-second chest-up shot: a woman raises her gaze toward a window; static camera, soft afternoon light.','5秒の胸上近景。女性が窓へ視線を上げる。固定カメラ、午後の柔らかい光。'])
add('video-medium','clip','中景|medium shot|ミディアムショット',
 ['中景视频：动作与互动','Medium shot: action and interaction','中景動画：動作とやり取り'],
 ['交付中景单镜头提示词。人物通常腰部以上，依据手势和道具动作调整到所需范围；明确人数、画面左右、面向和视线。让双手与关键道具在动作期间可见，写清起点、接触和终点，例如A递出杯子、B接稳，不发生无动作换手。环境只保留说明空间关系的必要部分。为固定、横移或跟随选择一种主要运镜，不让镜头运动遮挡关键交互。保持人物比例、道具数量、光向和轴线连续；需要看脚步或全身时说明应放宽取景。分别给首帧、视频正文和末帧状态，注明时长与画幅，不强制加入与本任务无关的近景或远景。',
 'Deliver one medium-shot prompt, usually waist-up but adjusted to include required gestures and props. Specify subject count, screen sides, facing and eyelines. Keep hands and the key prop visible through the action; define start, contact and finish, such as A offering a cup and B securing it, without unexplained hand swaps. Include only environment needed for spatial context. Choose one main camera behavior: static, lateral move or follow; it must not obscure the interaction. Preserve scale, prop count, light direction and the action axis. Widen framing if feet or full-body action are required. Supply first frame, motion text and end state with duration and aspect ratio, without forcing unrelated shot sizes.',
 '通常は腰上の中景とし、必要な手振りと小物が入る範囲に調整する。人数、画面左右、向き、視線を明示する。手と重要な小物を見える状態に保ち、Aがカップを差し出しBが受け取るなど、開始・接触・完了を記す。不自然な持ち替えを避ける。空間関係に必要な背景だけを残し、固定・横移動・追従から主なカメラ動作を一つ選ぶ。比率、小物の数、光、軸線を保ち、足や全身が必要なら広げる。開始画、動画本文、終状態、尺と比率を出し、無関係な景別を追加しない。'],
 ['6秒中景：两人腰部以上入镜，A把杯子递给B，双手和杯子始终可见，镜头固定。','6-second waist-up two-shot: A hands a cup to B; both hands and the cup remain visible, static camera.','6秒の腰上ツーショット。AがBへカップを渡す。手とカップを常に見せ、カメラは固定。'])
add('video-wide','clip','远景|全景|wide shot|long shot|ワイドショット|遠景',
 ['远景视频：空间与走位','Wide shot: space and blocking','遠景動画：空間と動線'],
 ['交付远景单镜头提示词。说明是能清楚看全身与周围环境的远景，还是人物很小的大远景；默认前者。建立地标、地平线、前中后景和主体起终点，用可见衣服轮廓或颜色帮助识别，避免要求读出远处细微表情或小字。角色运动路径要符合场地结构，不能穿墙或瞬移；给出方向、速度、遮挡及结束位置。固定或单一跟随运镜优先，若推进改变景别则明确开始和结束构图，不能一边声称全程远景一边要求面部特写。锁定建筑布局、人物尺度、天气与主光。分别输出环境首帧、视频正文、末帧和时长，不把九宫格整张作为单镜头首帧。',
 'Deliver one wide-shot prompt. Distinguish full-body environmental framing from an extreme long shot with a tiny subject; default to the former. Establish landmarks, horizon, depth layers and start/end positions. Use visible costume silhouette or color for recognition, not distant micro-expressions or tiny text. Define a feasible route, direction, speed, occlusion and stopping point without passing through walls or teleporting. Prefer static framing or one follow move. If a push changes shot size, specify both compositions rather than claiming a continuous wide shot while requiring a face close-up. Preserve layout, scale, weather and key light. Provide an environmental first frame, motion text, last frame and duration; never use an entire grid as a normal single-shot starting image.',
 '全身と周囲が分かる遠景か、人物が小さくなる大遠景かを区別し、既定は前者とする。目印、地平線、前中後景、始点と終点を定め、服の輪郭や色で識別させる。遠くの微表情や細字を要求しない。地形に合う経路、方向、速さ、遮蔽、停止位置を記し、壁抜けや瞬間移動を避ける。固定か一つの追従を優先する。寄りで景別が変わるなら開始と終了の構図を明記する。配置、尺度、天候、主光源を固定し、環境の開始画、動画本文、終了画、尺を出す。9コマ全体を通常の単一カット開始画にしない。'],
 ['8秒远景：红衣旅人沿山路由左向右走向石桥，全身可见，桥与山谷位置固定。','8-second wide shot: a traveler in red walks left to right toward a stone bridge, full body visible against a fixed valley layout.','8秒の遠景。赤い服の旅人が山道を左から右へ石橋に向かう。全身を見せ、橋と谷の配置を保つ。'])
(p/'data/studio/code-and-shots.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({'scenarios':len(items),'localizations':len(items)*3})
f=p/'data/studio/task-inputs.json'
inputs=json.loads(f.read_text(encoding='utf-8'))
for l,label in zip(['zh','en','ja'],['景别与具体场景','Shot size and scenario','景別と具体的な場面']):
 inputs['clip'][l].setdefault('scenario',{})['label']=label
f.write_text(json.dumps(inputs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
f=p/'data/studio/task-guides.json'
guides=json.loads(f.read_text(encoding='utf-8'))
extra=dict(zip(['zh','en','ja'],[
 '景别规划：把每镜标为近景、中景或远景，并写明实际取景范围。远景交代空间与走位，中景承接动作与互动，近景呈现表情或细节；根据剧情需要分配，不机械循环。用户要求三种景别时，在总时长允许下分别给出对应镜头。改变景别时维持轴线、视线、动作和道具状态，分别输出三类可复制提示词，避免把剪辑切换写成一个连续单镜头。',
 'Shot-size planning: label each shot close, medium or wide and specify its actual crop. Wide establishes space, medium carries action/interaction, close reveals expression/detail; allocate by story needs rather than a fixed cycle. When all three are requested, include each within the available duration. Preserve axis, eyelines, action and prop states across changes. Provide separately copyable prompts and do not describe edited cuts as one continuous shot.',
 '景別設計：各カットを近景・中景・遠景とし、実際に写す範囲を明記する。遠景は場所、中景は動作や交流、近景は表情や細部を担う。物語に応じて配分し、機械的に循環させない。3種類が指定された場合は総尺内に各景別を設ける。切替時は軸線、視線、動作、小物をつなぎ、コピー可能なプロンプトを分ける。編集の切替を連続した単一カットとして記さない。']))
g=next(g for g in guides if g['id']=='storyboard')
for l,v in extra.items():
 if v not in g['guidance'][l]:g['guidance'][l]+='\n\n'+v
f.write_text(json.dumps(guides,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
