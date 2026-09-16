export type Lang = 'zh' | 'en' | 'ja';
export const tr = (l: Lang, zh: string, en: string, ja: string) =>
  ({ zh, en, ja })[l];
export type WorkBrief = {
  goal: string;
  change: string;
  preserve: string;
  materials: string;
  settings: string;
  priority: string;
};
export const emptyBrief: WorkBrief = {
  goal: '',
  change: '',
  preserve: '',
  materials: '',
  settings: '',
  priority: '',
};
export const modes = [
  'text',
  'image',
  'image-edit',
  'video',
  'image-video',
  'video-edit',
] as const;
export type Mode = (typeof modes)[number];
export const modeName = (m: Mode, l: Lang) =>
  ({
    text: tr(
      l,
      '文字 / 代码 / 文件方案',
      'Text / code / document plan',
      '文章・コード・文書案',
    ),
    image: tr(l, '文字生成图片', 'Text to image', '文章から画像'),
    'image-edit': tr(l, '修改已有图片', 'Edit an image', '既存画像の編集'),
    video: tr(l, '文字生成视频', 'Text to video', '文章から動画'),
    'image-video': tr(l, '参考图生成视频', 'Image to video', '画像から動画'),
    'video-edit': tr(
      l,
      '修改 / 剪辑已有视频',
      'Edit existing video',
      '既存動画の編集',
    ),
  })[m];
export const adapters = [
  {
    id: 'general',
    name: '通用 / Other / その他',
    modes: [...modes],
    source: '',
    checked: '',
    note: [
      '按自然语言表达；先确认目标工具支持的输入和功能。',
      'Use natural language and verify input and feature support in your tool.',
      '自然な文章を使い、ツールの入力と機能を確認してください。',
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    modes: ['text', 'image', 'image-edit'],
    source: 'https://help.openai.com/en/articles/11084440-images-in-chatgpt',
    checked: '2026-09-16',
    note: [
      '图片修改先上传原图，明确修改区域与保留内容；实际入口以账号为准。',
      'For edits, upload the original and specify the region and preserved elements; availability depends on your account.',
      '編集は原画像を添え、変更箇所と保持条件を明示。利用可否はアカウントで確認。',
    ],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    modes: ['image', 'image-edit'],
    source:
      'https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor',
    checked: '2026-09-16',
    note: [
      '新图描述最终画面；精确修改用 Editor 选择区域。参考图影响画面，不保证精确复制。',
      'Describe the desired image; use Editor selections for local changes. References guide rather than guarantee an exact copy.',
      '完成画像を記述し、部分変更はEditorで範囲選択。参照画像は完全複製の保証ではありません。',
    ],
  },
  {
    id: 'firefly',
    name: 'Adobe Firefly',
    modes: ['image', 'image-edit'],
    source:
      'https://helpx.adobe.com/firefly/web/work-with-images/edit-images/generative-fill.html',
    checked: '2026-09-16',
    note: [
      '局部替换在 Generative Fill 选择区域，描述填充后的内容；其余区域列为保留项。',
      'Select a region in Generative Fill and describe the replacement; identify preserved regions.',
      'Generative Fillで範囲を選び置換後を記述。保持する領域を分けてください。',
    ],
  },
  {
    id: 'runway',
    name: 'Runway',
    modes: ['video', 'image-video'],
    source:
      'https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide',
    checked: '2026-09-16',
    note: [
      '图生视频先上传起始图，提示词重点描述动作与镜头变化；以当前模型界面的时长等选项为准。',
      'For image-to-video upload the starting image and focus on action and camera motion; use settings available in the selected model.',
      '画像から動画では開始画像を添え、動作とカメラ変化を中心に記述。設定は選択モデルで確認。',
    ],
  },
  {
    id: 'jimeng',
    name: '即梦 / Jimeng',
    modes: ['image', 'image-edit', 'video', 'image-video'],
    source:
      'https://jimeng.jianying.com/features/tools/ai-image-generator-from-text',
    checked: '2026-09-16',
    note: [
      '文生图描述主体、环境、风格和构图。已核对文生图官方说明；其他模式的参数与可用功能仍需在所选模型中确认。',
      'For text-to-image describe subject, setting, style and composition. Official text-to-image guidance checked; verify parameters and capabilities for other modes in the selected model.',
      '文章から画像では被写体・環境・作風・構図を記述。文生図の公式説明を確認済み。他モードの設定・機能は選択モデルで確認。',
    ],
  },
  {
    id: 'kling',
    name: '可灵 / Kling',
    modes: ['video', 'image-video', 'video-edit'],
    source: 'https://kling.ai/explore/kling_ai_manual',
    checked: '2026-09-16',
    note: [
      '先确定模型和模式。角色参考资料用同一套编号；对白逐句标明说话人、语言和语气。原生音频、多镜头和编辑入口需在当前版本确认，不写死未知参数。',
      'Select model and mode first. Keep character references consistently named; pair each dialogue line with speaker, language and delivery. Verify native audio, multi-shot and editing availability in the current version; do not invent parameter syntax.',
      'モデルとモードを確認。人物参照を同じ識別子で管理し、台詞に話者・言語・口調を付ける。音声・複数カット・編集の利用可否は現行版で確認し不明な構文を作らない。',
    ],
  },
  {
    id: 'doubao',
    name: '豆包 / Doubao',
    modes: ['text', 'image', 'image-edit'],
    source: '',
    checked: '',
    note: [
      '提供通用自然语言版本，请确认所选功能是否支持上传和图片编辑。',
      'General natural-language version; verify uploads and image-editing support.',
      '自然言語の汎用版。アップロードと画像編集の可否を確認。',
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    modes: ['text'],
    source: 'https://api-docs.deepseek.com/api/create-chat-completion/',
    checked: '2026-09-16',
    note: [
      '用于文字、代码和制作方案；给清楚输入、约束和输出格式。已核对文本对话文档，具体文件处理能力以使用的应用为准，不把图片视频制作方案说成生成文件。',
      'For text, code and production plans, specify inputs, constraints and output format. Text-chat documentation checked; file tools depend on the host app. A media plan is not a generated media file.',
      '文章・コード・制作計画向けに入力・制約・出力形式を指定。文字対話の文書を確認済み。ファイル操作はアプリ依存で、媒体の計画を生成済みファイルとしない。',
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    modes: ['text'],
    source:
      'https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude',
    checked: '2026-09-16',
    note: [
      '支持的环境可创建和编辑文件；请指定文件类型、结构与已有资料。先确认当前账号已开启文件创建功能，没有执行能力时交付正文和步骤。',
      'Supported environments can create and edit files. Specify file type, structure and source material; verify file creation is enabled, otherwise deliver content and steps.',
      '対応環境ではファイル作成・編集が可能。形式・構成・資料を指定し、機能の有効化を確認。未対応なら本文と手順を出す。',
    ],
  },
  {
    id: 'capcut',
    name: '剪映 / CapCut',
    modes: ['video-edit'],
    source: 'https://www.capcut.com/help/how-to-recognise-subtitles',
    checked: '2026-09-16',
    note: [
      '输出剪辑操作清单；字幕可按 Captions / Auto Captions 选择语言后生成，再回听校对。剪映国内版入口可能不同；不假设整段自然语言能自动执行。',
      'Output an editing checklist. In CapCut use Captions / Auto Captions, select the spoken language, then proofread against audio. Jianying may differ; do not assume whole prompts execute automatically.',
      '編集手順を出力。CapCutのCaptions / Auto Captionsで言語選択後、音声で校正。剪映は入口が異なる場合があり、指示全体の自動実行は前提にしない。',
    ],
  },
] as const;
export function adapterInfo(id: string, mode: Mode, l: Lang) {
  const a = adapters.find((x) => x.id === id) || adapters[0];
  const supported = (a.modes as readonly string[]).includes(mode);
  return {
    ...a,
    supported,
    note: a.note[(['zh', 'en', 'ja'] as const).indexOf(l)],
    warning: !supported
      ? tr(
          l,
          '该软件与当前模式不匹配，输出已退回通用方案；原始要求没有删除。',
          'This tool does not match the selected mode. Output uses general guidance and preserves your requirements.',
          'ツールとモードが一致しないため汎用案を使用。元の要望は保持します。',
        )
      : '',
  };
}
export function createBriefOutput(
  b: WorkBrief,
  task: string,
  guidance: string,
  tool: string,
  mode: Mode,
  l: Lang,
) {
  const a = adapterInfo(tool, mode, l),
    missing = tr(
      l,
      '未提供；请先确认，不自行编造。',
      'Not supplied; ask rather than invent.',
      '未提供。推測で埋めず確認してください。',
    );
  const summary = [
    task,
    b.goal,
    ...(
      [
        ['change', tr(l, '修改 / 重点', 'Change / focus', '変更・重点')],
        ['preserve', tr(l, '必须保留', 'Must preserve', '保持条件')],
        ['materials', tr(l, '资料', 'Material', '資料')],
        ['settings', tr(l, '输出要求', 'Output requirements', '出力条件')],
        ['priority', tr(l, '冲突时优先', 'Priority', '優先事項')],
      ] as const
    )
      .filter(([k]) => b[k].trim())
      .map(([k, label]) => label + ': ' + b[k]),
  ].join('\n');
  const prompt = [
    tr(
      l,
      '请按以下需求完成任务，用简体中文说明。',
      'Complete the following task; explain in English.',
      '以下の作業を行い、日本語で説明してください。',
    ),
    [
      task,
      b.goal,
      b.change
        ? tr(l, '修改 / 重点', 'Change / focus', '変更・重点') + ': ' + b.change
        : '',
      b.preserve
        ? tr(l, '必须保留', 'Must preserve', '保持条件') + ': ' + b.preserve
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
    guidance,
    `${tr(l, '输出偏好与限制', 'Output preferences and constraints', '出力の希望・制約')}: ${b.settings || missing}`,
    `${tr(l, '可用资料（用户描述，不代表你已经读取）', 'Available material (described, not necessarily inspected)', '利用資料（記述のみ、閲覧済みとは限らない）')}: ${b.materials || missing}`,
    `${tr(l, '冲突时的优先级', 'Priority if requirements conflict', '条件が競合する場合の優先順位')}: ${b.priority || tr(l, '先指出冲突，请我选择，不擅自删减要求。', 'Identify conflicts and ask me; do not silently drop requirements.', '競合を示して確認し、条件を勝手に削除しない。')}`,
    a.supported ? a.note : a.warning,
    tr(
      l,
      '只处理本次任务。保留提供的事实，缺少关键资料时最多问两个必要问题。没有读取文件或执行工具时，不声称已完成。',
      'Stay within this task. Preserve supplied facts; ask at most two essential questions for blockers. Do not claim file inspection or execution without doing it.',
      '今回の作業に限定し提供事実を保持。重要な不足は二点以内で確認し、未閲覧・未実行を完了としない。',
    ),
  ].join('\n\n');
  const assets =
    mode === 'text'
      ? b.materials ||
        tr(
          l,
          '按需要附上原文、代码或文件；先移除不必要的个人信息。',
          'Attach source text, code or documents as needed; remove unnecessary personal information.',
          '必要な原文・コード・文書を添付し、不要な個人情報を除いてください。',
        )
      : [
          b.materials || missing,
          tr(
            l,
            '修改任务需要原始素材；参考图、字幕稿或角色图须在目标 AI 中另行上传。本网站只记录文字说明，没有上传素材。',
            'Editing requires original material. Upload references, subtitles or character sheets separately in the target AI. This site stores descriptions, not uploaded media.',
            '編集には原素材が必要。参照画像・字幕・キャラ資料は対象AIへ別途添付。本サイトは説明文のみ記録します。',
          ),
        ].join('\n');
  const settings = [
    b.settings ||
      tr(
        l,
        '未指定；使用软件实际支持的选项，不代填未知参数。',
        'Unspecified; use actual supported options, not invented parameters.',
        '未指定。実際に対応する設定を確認し、不明な値を補完しない。',
      ),
    mode === 'text'
      ? tr(
          l,
          '长度、格式、读者和软件版本属于交付要求；无需填写图片参数。',
          'Length, format, audience and software version are deliverable requirements. Image parameters are unnecessary.',
          '長さ・形式・読者・ソフトの版を指定。画像設定は不要です。',
        )
      : tr(
          l,
          '比例、时长、分辨率等按软件界面设置，未验证的参数不作为命令复制。',
          'Set ratio, duration and resolution in the tool UI; do not copy unverified parameters as commands.',
          '比率・時間・解像度は画面で設定。未確認値をコマンドとして使わない。',
        ),
  ].join('\n');
  const direct = [
    b.goal,
    b.change
      ? tr(l, '修改 / 动作', 'Change / action', '変更・動作') + ': ' + b.change
      : '',
    b.preserve ? tr(l, '保持不变', 'Preserve', '保持') + ': ' + b.preserve : '',
    b.materials
      ? tr(l, '参考素材及设定', 'References and context', '参照素材・設定') +
        ': ' +
        b.materials
      : '',
    b.settings
      ? tr(l, '画面与时长要求', 'Framing and duration', '画面・時間の条件') +
        ': ' +
        b.settings
      : '',
    b.priority ? tr(l, '优先保留', 'Priority', '優先') + ': ' + b.priority : '',
  ]
    .filter(Boolean)
    .join('\n');
  const directAvailable = mode !== 'text' && a.supported && tool !== 'capcut';
  return { summary, prompt, direct, directAvailable, assets, settings };
}
export const revisionIssues = (l: Lang) => [
  tr(l, '太笼统', 'Too vague', '具体性不足'),
  tr(l, '遗漏要求', 'Missing requirements', '条件の漏れ'),
  tr(l, '风格不对', 'Wrong style', 'スタイル違い'),
  tr(l, '改动了保留项', 'Changed preserved elements', '保持条件の変更'),
  tr(l, '内容不正确', 'Incorrect content', '内容の誤り'),
  tr(l, '其他问题', 'Other issue', 'その他'),
];
export function revisePrompt(
  original: string,
  issue: string,
  detail: string,
  l: Lang,
) {
  return [
    tr(
      l,
      '请修改上一版结果，只处理下面的问题。',
      'Revise the previous result, addressing only the issue below.',
      '前回の結果を次の問題に限定して修正してください。',
    ),
    `${issue}: ${detail}`,
    tr(l, '原始要求', 'Original requirements', '元の要望') + ':\n' + original,
    tr(
      l,
      '保留已经正确的部分；不确定哪部分错误时先问我。返回修订内容和简短修改说明。',
      'Preserve correct parts; ask if the error is unclear. Return the revision and a brief change note.',
      '正しい部分は保持。不明な点は確認し、修正版と短い変更説明を返してください。',
    ),
  ].join('\n\n');
}
export function downloadText(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(
    new Blob([text], { type: type + ';charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
