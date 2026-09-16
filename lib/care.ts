// Local, deterministic assistance. It does not call or pretend to be a model.
export type CareLocale = 'zh' | 'en' | 'ja';
const l = (zh: string, en: string, ja: string) => ({ zh, en, ja });
export const careIntents = [
  {
    id: 'purchase-help',
    label: l(
      '退换货或联系客服',
      'Returns or customer support',
      '返品・問い合わせ',
    ),
    terms: [
      '退货',
      '换货',
      '退款',
      '联系客服',
      'return a purchase',
      'refund',
      'customer support',
      '返品',
      '返金',
      '問い合わせ',
    ],
    question: l(
      '买了什么、遇到什么问题？您希望换货、退款还是让对方解释？',
      'What did you buy, what happened, and do you want a replacement, refund or explanation?',
      '何を購入し、どんな問題がありますか？交換・返金・説明のどれを希望しますか？',
    ),
    rule: l(
      '先写可发送给客服的消息，按已知事实列问题和诉求。需要证据时列订单日期、商品问题照片等，提醒遮住无关个人资料；不编造消费承诺、赔偿规定和法律期限。给对方未理解时的简短补充话术。',
      'Write a send-ready support message with known facts and the requested outcome. List relevant evidence such as order date or a product photo, excluding unrelated personal details. Do not invent policies or deadlines. Add a short clarification if support misunderstands.',
      '事実と希望に沿う送信用文を作る。注文日や商品写真など必要資料を示し不要な個人情報を除く。規定や期限を捏造せず、伝わらない場合の短い補足も付ける。',
    ),
  },
  {
    id: 'appointment-help',
    label: l(
      '安排预约或出门办事',
      'Appointments and errands',
      '予約・外出の準備',
    ),
    terms: [
      '预约',
      '办事',
      '要带什么',
      'appointment',
      'what to bring',
      '予約',
      '持ち物',
    ],
    question: l(
      '要去哪里办什么事？日期是否确定，需要别人陪同吗？',
      'Where are you going, for what, and when? Do you need someone to accompany you?',
      'どこへ何をしに行き、日は決まっていますか？付き添いは必要ですか？',
    ),
    rule: l(
      '整理日期、地点、联系人、应带材料和出门前核对清单。未确定的营业时间、预约入口和材料要求标为需要向机构确认。写可用的电话询问话术；不声称已替用户预约或设置提醒。',
      'Organize date, place, contact, documents and a departure checklist. Mark unverified opening times, booking routes and requirements for confirmation with the institution. Provide a phone script, without claiming to book or set reminders.',
      '日時・場所・連絡先・持ち物・出発前確認を整理。未確認の営業時間・窓口・必要書類は施設への確認事項とする。電話用の文を作り、予約や通知を設定済みにしない。',
    ),
  },
  {
    id: 'photo-edit',
    label: l('修一张照片', 'Improve a photo', '写真を直す'),
    terms: [
      '照片太暗',
      '老照片',
      '修照片',
      '去掉路人',
      'restore a photo',
      'photo is dark',
      'remove a person',
      '古い写真',
      '写真を明るく',
    ],
    question: l(
      '想改照片哪一处？人物长相、衣服和背景哪些要保留？',
      'What should change, and which faces, clothes or background details must stay?',
      'どこを変え、顔・服・背景の何を残したいですか？',
    ),
    rule: l(
      '把要修改和不能修改的内容分开，生成可以给图片 AI 使用的简短完整指令。说明需要在目标软件上传原图。老照片缺失细节不能当成真实历史恢复；不会查看图片时，不声称看到了照片内容。',
      'Separate changes from preserved details and write a concise edit prompt. Explain that the original must be uploaded to the image tool. Missing historical details cannot be presented as recovered facts. Do not claim to see an image without access.',
      '変更と保持項目を分け、画像AI用の短い指示を作る。原画像は対象ツールへ添付する。欠けた歴史的細部を事実復元とせず、閲覧できない画像を見たと言わない。',
    ),
  },
  {
    id: 'memories',
    label: l(
      '整理经历或家里的故事',
      'Record memories or family stories',
      '経験・家族の思い出を整理',
    ),
    terms: [
      '回忆',
      '家里的故事',
      '我的经历',
      '家族故事',
      'memories',
      'family story',
      'my life story',
      '思い出',
      '家族の話',
    ],
    question: l(
      '想记录哪段经历，给谁看？记不清的名字和年份可以先空着。',
      'Which memory is it, and who will read it? Uncertain names and dates can stay blank.',
      'どの経験を誰に伝えますか？不確かな名前や年は空欄で構いません。',
    ),
    rule: l(
      '按用户原话组织时间、人物和事件，保留说话习惯与真实感。给一篇可以保存的完整文字，记不清的地方标记待补充，不编造人物关系、对话或经历。先问一两个能帮助回忆的问题，不一次追问太多。',
      'Organize supplied people, events and chronology while keeping the speaker’s voice. Deliver a complete saveable text, marking uncertain details for later rather than inventing relationships, dialogue or events. Ask at most one or two helpful memory questions.',
      '本人の語り口を保ち、人・出来事・順序を整理して保存できる文章にする。不確かな部分は補足待ちとし、関係・会話・経験を創作しない。質問は一、二点に絞る。',
    ),
  },
  {
    id: 'message',
    label: l('写一段消息', 'Write a message', 'メッセージを書く'),
    terms: [
      '微信',
      '发消息',
      '写消息',
      '短信',
      '告诉',
      '回复',
      'message',
      'reply',
      'text my',
      'メッセージ',
      '返信',
    ],
    question: l(
      '发给谁？想告诉对方什么？',
      'Who is it for, and what should they know?',
      '誰に、何を伝えたいですか？',
    ),
    rule: l(
      '直接写出可以发送的消息，称呼自然，保留用户说的时间、人物和要求。不要擅自增加承诺。给一版完整消息和一版更短的。',
      'Write a send-ready message with a natural greeting. Preserve stated people, dates and requests without adding promises. Provide a full and shorter version.',
      '自然な呼び掛けで送れる文を作り、人物・日時・要望を保つ。約束を勝手に加えず、通常版と短縮版を出す。',
    ),
  },
  {
    id: 'greeting',
    label: l('写祝福或感谢', 'Greetings or thanks', 'お祝い・お礼を書く'),
    terms: [
      '生日',
      '祝福',
      '感谢',
      '谢谢',
      '贺词',
      'birthday',
      'greeting',
      'thank',
      '誕生日',
      'お祝い',
      'お礼',
    ],
    question: l(
      '对方是谁？是什么日子或事情？',
      'Who is it for, and what is the occasion?',
      '相手と、祝う日や感謝したいことは？',
    ),
    rule: l(
      '写自然真诚、适合双方关系的祝福或感谢。保留已说的称呼和场合，不编造共同经历，不强加肉麻或夸张的表达。给可直接发送的正文。',
      'Write sincere, natural wording suited to the relationship and occasion. Do not invent shared experiences or add exaggerated sentiment. Deliver the complete message.',
      '関係と場面に合う率直なお祝い・お礼の全文を書く。共通の思い出を捏造せず、大げさな感情を足さない。',
    ),
  },
  {
    id: 'phone',
    label: l(
      '学会手机或软件操作',
      'Use a phone or app',
      'スマホ・アプリの操作',
    ),
    terms: [
      '手机',
      '微信怎么',
      '视频通话',
      '字体',
      '相册',
      '照片发',
      '软件怎么',
      'phone',
      'app settings',
      'video call',
      'スマホ',
      '携帯',
      'アプリ操作',
    ],
    question: l(
      '用什么手机或软件？卡在哪一步？',
      'Which phone or app, and where are you stuck?',
      'どの端末・アプリで、どこで困っていますか？',
    ),
    rule: l(
      '按用户设备和软件版本给一次一个动作的步骤，写清要找的按钮文字与操作后看到的结果。没有界面依据时先问清，不编造按钮。给找不到按钮时的办法，不要求提供密码或验证码。',
      'Give one action per step for the stated device/version, naming buttons and visible results. Ask when the interface is unknown rather than inventing controls. Include recovery if a button is missing; never request passwords or verification codes.',
      '端末と版に合わせ、一手順一操作でボタン名と見える結果を示す。不明な画面は確認し、見つからない場合の対応も付ける。パスワードや認証コードを求めない。',
    ),
  },
  {
    id: 'travel',
    label: l('安排出门或旅行', 'Plan an outing', '外出・旅行を計画'),
    terms: [
      '旅游',
      '旅行',
      '出门',
      '公交',
      '地铁',
      '路线',
      '散步',
      'trip',
      'travel',
      'outing',
      'bus route',
      '旅行',
      '外出',
      'バス',
    ],
    question: l(
      '去哪里？什么时候去？走路或预算有什么要求？',
      'Where and when? Any walking or budget needs?',
      '行先と日程、歩行や予算の希望は？',
    ),
    rule: l(
      '按地点、出发时间、同行者和步行要求排清楚路线，安排休息与备选。票价、时刻和营业时间用当前官方信息核实；无法核实就标待确认，不声称订好了票。',
      'Plan routes around the destination, timing, companions and walking limits, including rest and alternatives. Verify current official fares, schedules and hours or mark them unconfirmed. Do not claim bookings were made.',
      '行先、時間、同行者、歩行条件で経路と休憩・代案を作る。料金・時刻・営業時間は公式情報で確認し、未確認は明記。予約済みとしない。',
    ),
  },
  {
    id: 'cooking',
    label: l('做饭或安排菜单', 'Cook or plan meals', '料理・献立を考える'),
    terms: [
      '做饭',
      '做菜',
      '菜单',
      '食谱',
      '晚饭',
      '鸡蛋',
      '炒菜',
      'recipe',
      'cook',
      'dinner',
      'meal',
      '料理',
      '献立',
      '夕食',
    ],
    question: l(
      '几个人吃？有哪些食材或不能吃的东西？',
      'How many people, what ingredients, and any foods to avoid?',
      '何人分で、食材や食べられない物は？',
    ),
    rule: l(
      '给人数对应的用量、准备和烹饪步骤，说明先后顺序及容易出错的地方。遵守用户的忌口、时间和厨具条件；未知过敏信息不猜测，不把食谱当治病方法。',
      'Provide serving quantities, preparation and ordered cooking steps with common pitfalls. Respect restrictions, time and equipment; do not guess allergies or present food as treatment.',
      '人数分の量、下準備、順序、失敗しやすい点を示す。避ける物・時間・器具を守り、アレルギーを推測せず治療食としない。',
    ),
  },
  {
    id: 'explain',
    label: l(
      '把难懂的内容讲明白',
      'Explain something clearly',
      '難しい内容をわかりやすく',
    ),
    terms: [
      '看不懂',
      '讲明白',
      '解释',
      '什么意思',
      '说明书',
      'explain',
      'understand',
      'meaning',
      '説明',
      '意味',
      'わからない',
    ],
    question: l(
      '把看不懂的文字贴过来，或说说是哪件事。',
      'Paste the unclear text, or describe the topic.',
      'わからない文章を貼るか、内容を教えてください。',
    ),
    rule: l(
      '先用几句日常话说明主要意思，再解释必要的词语并给一个贴近生活的例子。保留原文条件和限制，区分原文事实与解释。没有看到原文时不假装读过。',
      'Explain the main point in everyday language, define necessary terms and give a familiar example. Preserve conditions and distinguish source facts from interpretation. Do not pretend to have read missing text.',
      '日常語で要点を示し、必要語と身近な例を説明。条件を残して原文と解釈を分け、未提供文を読んだとしない。',
    ),
  },
  {
    id: 'writing',
    label: l(
      '写通知、经历或文章',
      'Write a notice or story',
      'お知らせ・体験文を書く',
    ),
    terms: [
      '写文章',
      '通知',
      '回忆',
      '经历',
      '自传',
      '写一篇',
      'write an article',
      'notice',
      'memoir',
      '文章',
      'お知らせ',
      '回想',
    ],
    question: l(
      '写给谁看？最想说的事情是什么？',
      'Who will read it, and what matters most?',
      '読者と、一番伝えたいことは？',
    ),
    rule: l(
      '按用户要的文体写完整内容，有开头、主要事情和结尾。只用提供的事实，不编造日期、姓名或经历。通知单列时间地点和需要做的事；回忆保持用户自己的语气。',
      'Write the complete requested format with an opening, substance and ending, using supplied facts only. Notices need time, place and actions; memoirs should preserve the user’s voice. Do not invent names, dates or experiences.',
      '指定形式の全文を導入・本題・結びで作り、提供事実のみ使う。通知は日時・場所・行動を明記し、回想は本人の語調を守る。',
    ),
  },
  {
    id: 'image',
    label: l(
      '想做一张图片',
      'Describe a picture to make',
      '画像を作るための説明',
    ),
    terms: [
      '画一张',
      '做张图',
      '生成图片',
      '做海报',
      '画画',
      '照片修',
      'image',
      'picture',
      'poster',
      '画像',
      '絵を',
      'ポスター',
    ],
    question: l(
      '图片里有什么？用来做什么？喜欢什么样子？',
      'What should be in it, what is it for, and what style?',
      '何を描き、何に使い、どんな雰囲気にしますか？',
    ),
    rule: l(
      '把需求写成完整的作图描述，说明主体、数量、背景、颜色、光线和需要的文字。只在用户希望时补充风格建议，别改变本人照片中的身份特征。没有作图功能时给可复制提示词，不假装图片已生成。',
      'Write a complete image brief with subject, count, background, color, light and exact text. Suggest style only where wanted and preserve identity in supplied photos. Without image tools, give a copyable prompt rather than claiming generation.',
      '主体、数、背景、色、光、文字を含む画像文を作る。希望に応じて画風を補い、本人写真の特徴を守る。作画機能なしなら生成文を出し完成を装わない。',
    ),
  },
  {
    id: 'learning',
    label: l('学点东西或练习', 'Learn or practise', '学ぶ・練習する'),
    terms: [
      '学习',
      '学会',
      '练习',
      '教我',
      '英语',
      '日语',
      'learn',
      'practice',
      'teach me',
      '学び',
      '練習',
      '英語',
    ],
    question: l(
      '想学什么？现在会多少？每天能用多久？',
      'What do you want to learn, what do you know, and how much time?',
      '何を学び、今どのくらいでき、何分使えますか？',
    ),
    rule: l(
      '从用户起点讲一个小知识点，用简单例子示范，再给能马上完成的小练习与答案。按可用时间安排，不一次塞太多术语；不要从年龄推断能力。',
      'Teach one small concept from the user’s starting point, with a simple example and short practice plus answers. Fit available time without jargon overload. Do not infer ability from age.',
      '現在の理解から小さな内容を一つ説明し、簡単な例、短い練習、解答を出す。時間内に収め、年齢から能力を決めない。',
    ),
  },
  {
    id: 'check',
    label: l(
      '核对消息是否可靠',
      'Check a claim or message',
      '情報の確かさを確認',
    ),
    terms: [
      '真假',
      '骗局',
      '诈骗',
      '靠谱吗',
      '可信',
      '转账',
      '中奖',
      'scam',
      'fraud',
      'reliable',
      'fact check',
      '詐欺',
      '本当',
      '信頼',
    ],
    question: l(
      '这条消息具体说了什么？请先遮住个人信息。',
      'What does the message say? Remove personal details first.',
      'どんな情報ですか？個人情報は隠してください。',
    ),
    rule: l(
      '分开已知事实、可疑点和未核实事项，给独立核查的步骤。不要点击可疑链接、拨打消息里的陌生号码或要求转账；提示通过本人已有的官方渠道确认。证据不足不要断言真假。',
      'Separate facts, warning signs and unknowns, with independent verification steps. Do not follow suspicious links, call numbers supplied by the message or request transfers. Use independently known official channels; avoid certainty without evidence.',
      '事実、不審点、未確認を分け独立確認の手順を示す。不審リンク、文中の連絡先、送金を案内せず、既知の公式窓口で確認。根拠不足で断定しない。',
    ),
  },
  {
    id: 'health-info',
    label: l(
      '整理要问医生的问题',
      'Prepare questions for a clinician',
      '医療者への質問を整理',
    ),
    terms: [
      '医生',
      '药',
      '体检',
      '看病',
      '医院',
      '血压',
      'doctor',
      'medicine',
      'medical',
      '薬',
      '医師',
      '病院',
    ],
    question: l(
      '想问哪件事？可以只写问题，不必填写身份信息。',
      'What would you like to ask? Personal identifiers are unnecessary.',
      '何を相談したいですか？本人確認情報は不要です。',
    ),
    rule: l(
      '整理用户明确提供的情况与想问医生的问题，不推断病情、不诊断、不决定药物和剂量。解释资料时保留出处与不确定性；若用户描述紧急危险，应优先建议联系当地急救或专业人员，不让等待AI耽误求助。',
      'Organize the stated situation and questions for a clinician. Do not infer a condition, diagnose or decide medication/doses. Preserve sources and uncertainty. If urgent danger is described, prioritize local emergency/professional help rather than waiting for AI.',
      '本人が述べた状況と医療者への質問を整理し、病状推定、診断、薬や量の決定をしない。出典と不確実性を保ち、緊急の危険ならAI待ちでなく地域の救急・専門家への連絡を優先する。',
    ),
  },
  {
    id: 'other',
    label: l('其他事情', 'Something else', 'そのほか'),
    terms: [],
    question: l(
      '希望 AI 最后给你什么？还有什么不能改的要求？',
      'What should the AI deliver, and what must stay unchanged?',
      'AIに何を出してほしいですか？変えてはいけない条件は？',
    ),
    rule: l(
      '先理解原话中的目标、对象和限制，直接给能使用的内容。信息不足时只问最重要的一两个问题；未知事实明确说不知道，不替用户添加身份、预算或承诺。',
      'Identify the goal, audience and constraints in the original wording and deliver usable content. Ask only one or two essential questions when needed. State unknowns honestly and do not invent identity, budget or promises.',
      '原文の目的・対象・制約を整理し使える内容を出す。不足時は重要な質問を一、二点に絞り、不明は不明とする。属性、予算、約束を足さない。',
    ),
  },
];
function evidence(text: string, term: string) {
  const latin = /^[a-z0-9 /-]+$/i.test(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(latin ? `\\b${escaped}\\b` : escaped, 'gi');
  for (const match of text.matchAll(pattern)) {
    const prefix = text
      .slice(Math.max(0, match.index! - 18), match.index)
      .replaceAll('是不是', '是否');
    if (
      /(?:不要|不想|不用|不是|别|无需|不需要)[^，。；！？,;.!?]{0,5}$/.test(
        prefix,
      )
    )
      continue;
    if (/(?:don't|do not|not|no need to)\s+(?:\w+\s+){0,2}$/i.test(prefix))
      continue;
    const suffix = text.slice(
      match.index! + match[0].length,
      match.index! + match[0].length + 10,
    );
    if (/^(?:は|を)?(?:不要|しない|いらない)/.test(suffix)) continue;
    return true;
  }
  return false;
}
export function analyzeCare(text: string) {
  const normalized = text.normalize('NFKC');
  const ranked = careIntents
    .filter((i) => i.id !== 'other')
    .map((intent) => ({
      intent,
      matches: intent.terms.filter((term) => evidence(normalized, term)),
    }))
    .filter((r) => r.matches.length)
    .sort((a, b) => b.matches.length - a.matches.length);
  // Always let the person confirm the choice; no invisible auto-routing.
  return {
    candidates: ranked.slice(0, 3),
    ambiguous: ranked.length > 1,
    unmatched: ranked.length === 0,
  };
}
export function composeCare(
  text: string,
  intentId: string,
  extra: string,
  locale: CareLocale,
  detail: 'short' | 'steps' | 'full',
) {
  const intent =
    careIntents.find((i) => i.id === intentId) ??
    careIntents[careIntents.length - 1];
  const headings = l(
    '请按以下需求帮助我。用简体中文回答，语言自然、容易理解。',
    'Please help with the following request. Answer in clear, natural English.',
    '次の要望を手伝ってください。自然でわかりやすい日本語で答えてください。',
  );
  const labels = {
    zh: [
      '我确认想做的事',
      '我的原话（保留原意）',
      '我补充的信息',
      '处理要求',
      '表达方式',
    ],
    en: [
      'Confirmed goal',
      'My original words (preserve meaning)',
      'Additional details',
      'Task requirements',
      'Response style',
    ],
    ja: [
      '確認した目的',
      '私の原文（意味を保つ）',
      '補足情報',
      '作成条件',
      '説明の仕方',
    ],
  }[locale];
  const styles = {
    short: l(
      '先给简短、直接能用的答案，必要时再补充。',
      'Start with a short, usable answer; add details only if needed.',
      '短く使える答えを先にし、必要な補足だけ加える。',
    ),
    steps: l(
      '按顺序分步骤，每一步只做一件事。需要操作时说明做完会看到什么。',
      'Use ordered steps, one action each, with visible results for operations.',
      '順番に一手順一操作で示し、操作後の見える結果も記す。',
    ),
    full: l(
      '给完整内容，再用简短清单说明需要我核对的地方。',
      'Give the complete deliverable, then a brief checklist of points to verify.',
      '完成した内容と、確認すべき点の短い一覧を出す。',
    ),
  };
  return `${headings[locale]}\n\n${labels[0]}：${intent.label[locale]}\n\n${labels[1]}：\n${text.trim()}\n${extra.trim() ? `\n${labels[2]}：\n${extra.trim()}\n` : ''}\n${labels[3]}：\n${intent.rule[locale]}\n\n${labels[4]}：\n${styles[detail][locale]}\n${l('不要把缺少的信息当成事实。尊重我的否定、偏好和原话，不因为年龄替我做决定。若有多个任务，按我确认的目标处理，其他目标先询问。', 'Do not turn missing information into facts. Respect negations, preferences and original wording; do not decide for me based on age. If several tasks appear, follow the confirmed goal and ask about others.', '不足情報を事実扱いせず、否定・好み・原文を尊重し、年齢を理由に代わりに決めない。複数の目的があれば確認した目的を優先し、他は尋ねる。')[locale]}`;
}
