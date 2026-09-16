'use client';
import { useEffect, useRef, useState } from 'react';
import {
  PenLine,
  WandSparkles,
  Film,
  Wrench,
  BookOpen,
  Compass,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
} from 'lucide-react';
import { taskTemplates, matchingSkills, type Locale } from '@/lib/studio';
import { defaultValues, type Template } from '@/lib/prompt';
import { categoryNames } from '@/lib/categories';
import {
  tr,
  emptyBrief,
  createBriefOutput,
  adapterInfo,
  adapters,
  modes,
  modeName,
  revisionIssues,
  revisePrompt,
  downloadText,
  type WorkBrief,
  type Mode,
} from '@/lib/workflow';
import { editTasks } from '@/lib/edit-tasks';
import FeedbackForm from './FeedbackForm';
export default function TaskJourney({
  locale: l,
  templates,
  onLibrary,
  onVideo,
}: {
  locale: Locale;
  templates: Template[];
  onLibrary: () => void;
  onVideo: () => void;
}) {
  const [step, setStep] = useState(0),
    [action, setAction] = useState(''),
    [category, setCategory] = useState(''),
    [taskId, setTaskId] = useState(''),
    [search, setSearch] = useState(''),
    [limit, setLimit] = useState(12),
    [brief, setBrief] = useState<WorkBrief>(emptyBrief),
    [tool, setTool] = useState('general'),
    [mode, setMode] = useState<Mode>('text'),
    [notice, setNotice] = useState(''),
    [issue, setIssue] = useState(0),
    [fix, setFix] = useState(''),
    [fixCache, setFixCache] = useState({ key: '', value: '' }),
    [skillId, setSkillId] = useState('');
  const fixKey = JSON.stringify([
    brief,
    tool,
    mode,
    taskId,
    skillId,
    l,
    fix,
    issue,
  ]);
  const fixOutput = fixCache.key === fixKey ? fixCache.value : '';
  function setFixOutput(value: string) {
    setFixCache({ key: fixKey, value });
  }
  const heading = useRef<HTMLHeadingElement>(null),
    say = (zh: string, en: string, ja: string) => tr(l, zh, en, ja);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const cards = taskTemplates(templates, l),
    extra = editTasks(l),
    tasks = [
      ...cards.map((c) => ({
        id: c.id,
        label: c.label,
        description: c.description,
        category: c.template.categoryId,
        mode: 'text' as Mode,
      })),
      ...extra,
    ];
  const selected = tasks.find((x) => x.id === taskId),
    card = cards.find((x) => x.id === taskId);
  const actionRows = [
    [
      'write',
      PenLine,
      say('写点东西', 'Write something', '何かを書く'),
      say(
        '文案、论文、报告、故事',
        'Copy, papers, reports, stories',
        'コピー・論文・報告・物語',
      ),
    ],
    [
      'modify',
      WandSparkles,
      say('修改已有内容', 'Improve existing content', '既存の内容を直す'),
      say(
        '文字、代码、图片、视频',
        'Text, code, images, video',
        '文章・コード・画像・動画',
      ),
    ],
    [
      'create',
      Film,
      say('制作图片或视频', 'Create images or video', '画像・動画を作る'),
      say(
        '画面、分镜、连续的故事',
        'Images, storyboards, ongoing stories',
        '画像・絵コンテ・続く物語',
      ),
    ],
    [
      'solve',
      Wrench,
      say('解决问题', 'Solve a problem', '問題を解決する'),
      say(
        '编程、办公、分析与安排',
        'Code, office work, analysis, plans',
        'コード・業務・分析・計画',
      ),
    ],
    [
      'learn',
      BookOpen,
      say('学习或弄懂一件事', 'Learn or understand', '学ぶ・理解する'),
      say(
        '解释、学习、语言与研究',
        'Explanations, learning, languages, research',
        '解説・学習・言語・研究',
      ),
    ],
    [
      'unsure',
      Compass,
      say('不确定，帮我选择', 'Help me choose', '選ぶのを手伝って'),
      say(
        '先看看有哪些方向',
        'Explore the available directions',
        'まず分野を見る',
      ),
    ],
  ] as const;
  const allowed: Record<string, string[]> = {
    write: ['writing', 'marketing', 'office', 'study', 'thinking'],
    modify: ['image', 'video', 'writing', 'programming', 'office', 'language'],
    create: ['image', 'video', 'creative'],
    solve: ['programming', 'office', 'business', 'life', 'thinking'],
    learn: ['study', 'language', 'thinking'],
    unsure: ['image', 'video', ...Object.keys(categoryNames[l])],
  };
  const categoryLabel = (c: string) =>
    c === 'image'
      ? say('图片', 'Images', '画像')
      : c === 'video'
        ? say('视频', 'Video', '動画')
        : categoryNames[l][c] || c;
  const relevant = (t: (typeof tasks)[number]) => {
    if (category === 'image')
      return (
        t.category === 'image' ||
        (t.category === 'creative' && /image|photo|character/.test(t.id))
      );
    if (category === 'video')
      return (
        t.category === 'video' ||
        (t.category === 'creative' &&
          /clip|storyboard|production|editing|spatial/.test(t.id))
      );
    return t.category === category;
  };
  const shown = tasks
    .filter(
      (t) =>
        relevant(t) &&
        (!search.trim() ||
          [t.label, t.description]
            .join(' ')
            .toLowerCase()
            .includes(search.trim().toLowerCase())),
    )
    .sort((a, b) =>
      action === 'modify'
        ? Number(b.id.startsWith('edit-')) - Number(a.id.startsWith('edit-'))
        : 0,
    );
  const adapter = adapterInfo(tool, mode, l),
    output = selected
      ? createBriefOutput(
          brief,
          selected.label,
          selected.description,
          tool,
          mode,
          l,
        )
      : null;
  const matches = card
    ? matchingSkills(card.template, {
        ...defaultValues(card.template),
        [card.field]: card.value,
        subject: brief.goal,
        materials: brief.materials,
        constraints: brief.preserve + ' ' + brief.change + ' ' + brief.settings,
      })
    : [];
  const selectedSkill = matches.find((s) => s.id === skillId);
  const finalPrompt =
    output?.prompt +
    (selectedSkill
      ? '\n\n' +
        say(
          '若已导入以下 Skill，可按其适用部分辅助完成；未安装时仍按以上要求处理。',
          'If this Skill is installed, use relevant guidance; otherwise follow the requirements above.',
          '導入済みの場合だけ次のSkillを補助に使用。未導入なら上の条件に従う。',
        ) +
        '\n' +
        selectedSkill.labels[l] +
        '\n' +
        selectedSkill.source
      : '');
  function pick(id: string) {
    const c = tasks.find((t) => t.id === id)!;
    setTaskId(id);
    setSkillId('');
    setFixOutput('');
    setMode(
      c.id.startsWith('edit-')
        ? c.mode
        : category === 'image'
          ? 'image'
          : category === 'video'
            ? 'video'
            : 'text',
    );
    setStep(2);
    setNotice('');
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(say('已复制。', 'Copied.', 'コピーしました。'));
    } catch {
      setNotice(
        say(
          '复制失败，请选择文本手动复制。',
          'Select the text and copy manually.',
          '文章を選択してコピーしてください。',
        ),
      );
    }
  }
  const questionLabels = {
    goal: say(
      '你希望最后得到什么？',
      'What should the final result be?',
      '最後に何を得たいですか？',
    ),
    change: mode.includes('edit')
      ? say(
          '具体改哪里？',
          'What exactly should change?',
          'どこを変更しますか？',
        )
      : say(
          '最重要的内容或要求是什么？',
          'What matters most?',
          '最も重要な内容・条件は？',
        ),
    preserve: mode.includes('edit')
      ? say(
          '哪些绝对不能改？',
          'What must stay unchanged?',
          '変えてはいけない部分は？',
        )
      : say(
          '必须保留的事实或限制',
          'Facts or constraints to preserve',
          '保持する事実・制約',
        ),
    materials: say(
      '已有资料 / 素材说明（选填）',
      'Available material (optional)',
      '資料・素材の説明（任意）',
    ),
    settings: say(
      '长度、时长、比例等偏好（选填）',
      'Length, duration or ratio preferences (optional)',
      '長さ・秒数・比率など（任意）',
    ),
    priority: say(
      '要求冲突时，优先保留什么？（选填）',
      'If requirements conflict, what takes priority? (optional)',
      '条件が競合したら何を優先？（任意）',
    ),
  };
  return (
    <section className="task-journey">
      <div className="journey-title">
        <div>
          <span className="eyebrow">AI MADE EASY / START HERE</span>
          <h1 ref={heading} tabIndex={-1}>
            {step === 0
              ? say(
                  '今天想让 AI 帮你做什么？',
                  'What would you like AI to help with?',
                  '今日はAIに何を頼みますか？',
                )
              : step === 1
                ? say(
                    '找到最接近你的那件事',
                    'Find the closest task',
                    '近い作業を選びましょう',
                  )
                : step === 2
                  ? say(
                      '把关键要求说清楚',
                      'Make the essentials clear',
                      '大切な条件を明確に',
                    )
                  : step === 3
                    ? say(
                        '先核对，我们理解对了吗？',
                        'Check: have we understood you?',
                        'この理解で合っていますか？',
                      )
                    : say(
                        '准备好了，交给你使用的 AI',
                        'Ready for your AI',
                        'お使いのAIに渡せます',
                      )}
          </h1>
          <p>
            {step === 0
              ? say(
                  '先选一件事，再补充少量必要信息。',
                  'Choose a task, then add a few essential details.',
                  '作業を選び、必要な情報だけ補足します。',
                )
              : selected?.label ||
                say(
                  '选错也没关系，随时返回修改。',
                  'You can go back and change your choice.',
                  'いつでも戻って選び直せます。',
                )}
          </p>
        </div>
        <div className="journey-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <ol
        className="journey-progress"
        aria-label={say('当前步骤', 'Current step', '現在のステップ')}
      >
        {[
          say('选择任务', 'Choose', '選ぶ'),
          say('补充要求', 'Describe', '補足'),
          say('核对意思', 'Confirm', '確認'),
          say('复制使用', 'Use', '使う'),
        ].map((x, i) => (
          <li
            key={x}
            aria-current={Math.max(0, step - 1) === i ? 'step' : undefined}
            className={Math.max(0, step - 1) >= i ? 'done' : ''}
          >
            <span>{i + 1}</span>
            {x}
          </li>
        ))}
      </ol>
      {step > 0 && (
        <button
          className="quiet-back"
          onClick={() => {
            setStep(step - 1);
            setNotice('');
          }}
        >
          <ArrowLeft size={17} />
          {say(
            '返回修改（保留填写内容）',
            'Back — keep my input',
            '入力を残して戻る',
          )}
        </button>
      )}
      {step === 0 && (
        <>
          <div className="action-grid">
            {actionRows.map(([id, Icon, label, desc], i) => (
              <button
                key={id}
                className="action-card"
                onClick={() => {
                  setAction(id);
                  setCategory('');
                  setSearch('');
                  setStep(1);
                }}
              >
                <span className="action-number">0{i + 1}</span>
                <Icon size={27} />
                <strong>{label}</strong>
                <span>{desc}</span>
                <ArrowRight size={19} />
              </button>
            ))}
          </div>
          <div className="journey-shortcuts">
            <button onClick={onLibrary}>
              {say(
                '熟悉这里？直接浏览模板库',
                'Browse the template library',
                'テンプレート一覧へ',
              )}
            </button>
            <button onClick={onVideo}>
              {say(
                '继续我的视频项目',
                'Continue a video project',
                '動画プロジェクトの続きへ',
              )}
            </button>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="category-pills">
            {(allowed[action] || allowed.unsure).map((c) => (
              <button
                aria-pressed={category === c}
                key={c}
                onClick={() => {
                  setCategory(c);
                  setSearch('');
                  setLimit(12);
                }}
              >
                {categoryLabel(c)}
              </button>
            ))}
          </div>
          {category && (
            <>
              <label className="journey-search">
                {say(
                  '在这个方向内查找',
                  'Search this direction',
                  'この分野から探す',
                )}
                <input
                  value={search}
                  placeholder={say(
                    '例如：换背景、字幕、公式报错',
                    'For example: background, captions, formula error',
                    '例：背景、字幕、数式エラー',
                  )}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setLimit(12);
                  }}
                />
              </label>
              <div className="task-picks">
                {shown.slice(0, limit).map((t) => (
                  <button key={t.id} onClick={() => pick(t.id)}>
                    <strong>{t.label}</strong>
                    <span>{t.description}</span>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
              {shown.length > limit && (
                <button onClick={() => setLimit((n) => n + 12)}>
                  {say('显示更多', 'Show more', 'さらに表示')}
                </button>
              )}
              {!shown.length && (
                <p>
                  {say(
                    '暂时没有找到。可以换个说法、换个方向，或提交需求摘要。',
                    'No match yet. Try different wording, another category, or send a request summary.',
                    '一致するものがありません。言い換え、別分野、要望送信をお試しください。',
                  )}
                </p>
              )}
              {category === 'video' && (
                <button className="primary-action" onClick={onVideo}>
                  {say(
                    '这是持续的视频制作？打开项目工作台',
                    'Ongoing production? Open the video workspace',
                    '継続制作なら動画ワークスペースへ',
                  )}
                </button>
              )}
            </>
          )}
          <FeedbackForm
            locale={l}
            context={'journey/' + action + '/' + category}
          />
        </>
      )}
      {step === 2 && selected && (
        <div className="brief-layout">
          <div className="brief-fields">
            <p className="task-guidance">{selected.description}</p>
            <div className="form-grid">
              <label>
                {say(
                  '使用哪个 AI 软件？',
                  'Which AI tool?',
                  'どのAIを使いますか？',
                )}
                <select
                  value={tool}
                  onChange={(e) => {
                    setTool(e.target.value);
                    setNotice(
                      say(
                        '仅调整适配说明，原始需求已保留。',
                        'Only guidance changed; your requirements are preserved.',
                        '適用説明のみ変更。元の要望は保持。',
                      ),
                    );
                  }}
                >
                  {adapters.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {say('使用模式', 'Mode', 'モード')}
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  {modes
                    .filter((m) =>
                      category === 'image'
                        ? ['image', 'image-edit'].includes(m)
                        : category === 'video'
                          ? ['video', 'image-video', 'video-edit'].includes(m)
                          : m === 'text',
                    )
                    .map((m) => (
                      <option key={m} value={m}>
                        {modeName(m, l)}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <p className="adapter-note">
              {adapter.warning || adapter.note}{' '}
              {adapter.checked && (
                <a target="_blank" rel="noreferrer" href={adapter.source}>
                  {say('官方说明核对', 'Official docs checked', '公式説明確認')}{' '}
                  {adapter.checked}
                </a>
              )}
              {!adapter.checked && (
                <span>
                  {' '}
                  ·{' '}
                  {say(
                    '通用适配，功能待确认',
                    'General adaptation; verify features',
                    '汎用対応・機能要確認',
                  )}
                </span>
              )}
            </p>
            {(['goal', 'change', 'preserve'] as const).map((k) => (
              <label key={k}>
                {questionLabels[k]}
                {k === 'goal' ? ' *' : ''}
                <textarea
                  maxLength={5000}
                  value={brief[k]}
                  onChange={(e) => setBrief({ ...brief, [k]: e.target.value })}
                />
              </label>
            ))}
            <details>
              <summary>
                {say(
                  '补充资料与偏好（可跳过）',
                  'Additional material and preferences (optional)',
                  '資料と希望の補足（省略可）',
                )}
              </summary>
              {(['materials', 'settings', 'priority'] as const).map((k) => (
                <label key={k}>
                  {questionLabels[k]}
                  <textarea
                    value={brief[k]}
                    maxLength={5000}
                    onChange={(e) =>
                      setBrief({ ...brief, [k]: e.target.value })
                    }
                  />
                </label>
              ))}
            </details>
            <button
              className="primary-action"
              onClick={() => {
                if (!brief.goal.trim()) {
                  setNotice(
                    say(
                      '请先填写希望得到的结果。',
                      'Describe the result you want first.',
                      '希望する結果を入力してください。',
                    ),
                  );
                  return;
                }
                setStep(3);
                setNotice('');
              }}
            >
              {say(
                '下一步：核对意思',
                'Next: check understanding',
                '次へ：意味を確認',
              )}
              <ArrowRight size={17} />
            </button>
          </div>
          <aside className="brief-preview">
            <span className="eyebrow">YOUR BRIEF</span>
            <h2>{say('你的需求摘要', 'Your brief', '要望の要約')}</h2>
            <p>
              {brief.goal ||
                say(
                  '填写后会显示在这里',
                  'Your input appears here',
                  '入力するとここに表示',
                )}
            </p>
            <dl>
              <dt>{questionLabels.change}</dt>
              <dd>{brief.change || '—'}</dd>
              <dt>{questionLabels.preserve}</dt>
              <dd>{brief.preserve || '—'}</dd>
            </dl>
            <p className="small-note">
              {say(
                '这是对填写内容的整理，不是大模型自动推断。',
                'This summarizes your entries, not model inference.',
                '入力内容の整理であり、モデルによる推測ではありません。',
              )}
            </p>
          </aside>
        </div>
      )}
      {step === 3 && output && (
        <div className="confirm-panel">
          <Check size={30} />
          <h2>{selected?.label}</h2>
          <p className="preserve-lines">{output.summary}</p>
          <p>
            {modeName(mode, l)} · {adapter.name}
          </p>
          {adapter.warning && <p className="warning-note">{adapter.warning}</p>}
          {mode.includes('edit') && !brief.preserve && (
            <p>
              {say(
                '还没填写保留项；如果人物、原意或关键步骤不能改，请返回补充。',
                'Preserved elements are unspecified. Go back if identity, meaning or key steps must stay unchanged.',
                '保持条件が未指定。人物・意味・手順を変えたくない場合は戻って補足してください。',
              )}
            </p>
          )}
          <div className="button-row">
            <button onClick={() => setStep(2)}>
              {say(
                '不是这个意思，修改要求',
                'Change the requirements',
                '要望を修正',
              )}
            </button>
            <button className="primary-action" onClick={() => setStep(4)}>
              {say(
                '理解正确，生成提示词',
                'Correct — prepare prompt',
                'この内容で作成',
              )}
            </button>
          </div>
        </div>
      )}
      {step === 4 && output && (
        <div className="result-workspace">
          <div className="result-main">
            <h2>
              {say('可复制的提示词', 'Copyable prompt', 'コピー用プロンプト')}
            </h2>
            <textarea
              aria-label={say(
                '生成的提示词',
                'Generated prompt',
                '生成したプロンプト',
              )}
              readOnly
              value={finalPrompt}
            />
            <div className="button-row">
              <button
                className="primary-action"
                onClick={() => copy(finalPrompt)}
              >
                <Copy size={18} />
                {say('复制提示词', 'Copy prompt', 'コピー')}
              </button>
              <button
                onClick={() =>
                  downloadText(
                    'AI-Made-Easy-brief.txt',
                    [
                      output.summary,
                      finalPrompt,
                      output.assets,
                      output.settings,
                    ].join('\n\n---\n\n'),
                  )
                }
              >
                <Download size={17} />
                {say(
                  '下载完整准备清单',
                  'Download complete brief',
                  '準備一覧を保存',
                )}
              </button>
              <button onClick={() => setStep(2)}>
                {say('修改要求', 'Edit requirements', '要望を編集')}
              </button>
            </div>
            <details className="repair-panel">
              <summary>
                {say(
                  'AI 的结果不满意？',
                  'Unhappy with the AI result?',
                  'AIの結果に不満がありますか？',
                )}
              </summary>
              <div className="category-pills">
                {revisionIssues(l).map((x, i) => (
                  <button
                    key={x}
                    aria-pressed={issue === i}
                    onClick={() => setIssue(i)}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <label>
                {say(
                  '具体哪里不对？哪些正确内容要保留？',
                  'What is wrong, and what should stay?',
                  'どこが違い、何を残しますか？',
                )}
                <textarea
                  value={fix}
                  maxLength={5000}
                  onChange={(e) => setFix(e.target.value)}
                />
              </label>
              <button
                onClick={() => {
                  if (!fix.trim()) {
                    setNotice(
                      say(
                        '请补充需要修改的具体问题。',
                        'Describe the specific issue.',
                        '具体的な問題を入力してください。',
                      ),
                    );
                    return;
                  }
                  setFixOutput(
                    revisePrompt(finalPrompt, revisionIssues(l)[issue], fix, l),
                  );
                }}
              >
                {say(
                  '生成补充修改指令',
                  'Prepare a repair instruction',
                  '追加修正指示を作る',
                )}
              </button>
              {fixOutput && (
                <>
                  <textarea
                    readOnly
                    value={fixOutput}
                    aria-label={say(
                      '补充修改指令',
                      'Repair instruction',
                      '追加修正指示',
                    )}
                  />
                  <button onClick={() => copy(fixOutput)}>
                    {say(
                      '复制修改指令',
                      'Copy repair instruction',
                      '修正指示をコピー',
                    )}
                  </button>
                </>
              )}
            </details>
            <FeedbackForm
              locale={l}
              context={'result/' + taskId + '/' + tool + '/' + mode}
            />
          </div>
          <aside className="result-checklist">
            <h2>{say('还需要准备', 'Prepare these too', 'あわせて準備')}</h2>
            <h3>{say('素材与资料', 'Material', '素材・資料')}</h3>
            <p>{output.assets}</p>
            <h3>{say('软件设置', 'Tool settings', 'ツール設定')}</h3>
            <p>{output.settings}</p>
            {adapter.warning && (
              <p className="warning-note">{adapter.warning}</p>
            )}
            <h3>{say('可选 Skill', 'Optional Skills', '任意のSkill')}</h3>
            <p>
              {say(
                '普通提示词可独立使用。只选符合任务且能在你的工具中使用的 Skill。',
                'The prompt works without a Skill. Choose only a relevant Skill supported by your tool.',
                'プロンプトだけでも使用可能。目的とツールに合うSkillのみ選択。',
              )}
            </p>
            {matches.slice(0, 2).map((s) => (
              <div className="journey-skill" key={s.id}>
                <label className="check-line">
                  <input
                    type="checkbox"
                    checked={skillId === s.id}
                    onChange={(e) => setSkillId(e.target.checked ? s.id : '')}
                  />
                  {s.labels[l]}
                </label>
                <p>{s.usage[l]}</p>
                <a href={s.download} download>
                  {say('下载 Skill', 'Download Skill', 'Skillを保存')}
                </a>
              </div>
            ))}
            {!matches.length && (
              <p>
                {say(
                  '本任务暂不推荐特定 Skill，仍可使用上方提示词。',
                  'No specific Skill is recommended for this task; use the prompt above.',
                  '専用Skillの推薦なし。上のプロンプトをご利用ください。',
                )}
              </p>
            )}
          </aside>
        </div>
      )}
      <output className="inline-status">{notice}</output>
    </section>
  );
}
