import { tr, type Lang, createBriefOutput, type Mode } from './workflow.ts';
export type Entity = { id: string; name: string; fixed: string };
export type ShotContent = {
  title: string;
  size: 'close' | 'medium' | 'wide';
  seconds: number;
  actual: number;
  action: string;
  start: string;
  end: string;
  dialogue: string;
  preserve: string;
  references: string;
  tool: string;
  mode: Mode;
  result: string;
  issue: string;
  context: string;
  entityIds: string[];
  status: 'draft' | 'making' | 'review' | 'approved';
};
export type Shot = ShotContent & {
  id: string;
  locked: boolean;
  history: { at: string; content: ShotContent }[];
};
export type Scene = {
  id: string;
  title: string;
  setting: string;
  shots: Shot[];
};
export type Episode = {
  id: string;
  title: string;
  synopsis: string;
  continuity: string;
  scenes: Scene[];
};
export type VideoProject = {
  schema: 1;
  id: string;
  title: string;
  kind: 'single' | 'series';
  bible: string;
  entities: Entity[];
  episodes: Episode[];
};
export const uid = () => crypto.randomUUID();
export function newProject(
  title: string,
  kind: 'single' | 'series',
): VideoProject {
  return {
    schema: 1,
    id: uid(),
    title,
    kind,
    bible: '',
    entities: [],
    episodes: [],
  };
}
export function captureContext(
  p: VideoProject,
  e: Episode,
  s: Scene,
  ids: string[],
) {
  return [
    p.bible,
    ...p.entities
      .filter((x) => ids.includes(x.id))
      .map((x) => x.name + ': ' + x.fixed),
    e.synopsis,
    e.continuity,
    s.setting,
  ]
    .filter(Boolean)
    .join('\n');
}
export function newShot(context: string): Shot {
  return {
    id: uid(),
    title: '',
    size: 'medium',
    seconds: 5,
    actual: 0,
    action: '',
    start: '',
    end: '',
    dialogue: '',
    preserve: '',
    references: '',
    tool: 'general',
    mode: 'image-video',
    result: '',
    issue: '',
    context,
    entityIds: [],
    status: 'draft',
    locked: false,
    history: [],
  };
}
export function shotContent(s: Shot): ShotContent {
  const { id: _id, locked: _locked, history: _history, ...content } = s;
  return structuredClone(content);
}
export function starterProject(
  title: string,
  kind: 'single' | 'series',
  l: Lang,
) {
  const p = newProject(title, kind);
  const e: Episode = {
    id: uid(),
    title: tr(l, '第1集 / 影片', 'Episode 1 / film', '第1話・作品'),
    synopsis: '',
    continuity: '',
    scenes: [],
  };
  const s: Scene = {
    id: uid(),
    title: tr(l, '场景1', 'Scene 1', '場面1'),
    setting: '',
    shots: [],
  };
  s.shots = (['wide', 'medium', 'close'] as const).map((size, i) => ({
    ...newShot(''),
    size,
    title: [
      tr(l, '建立环境', 'Establish the setting', '場所を示す'),
      tr(l, '主要动作', 'Main action', '主な動作'),
      tr(l, '关键细节', 'Key detail', '重要な細部'),
    ][i],
  }));
  e.scenes = [s];
  p.episodes = [e];
  return p;
}
export function duplicateEpisode(p: VideoProject, id: string, l: Lang) {
  const source = p.episodes.find((e) => e.id === id);
  if (!source) throw Error('UNKNOWN_EPISODE');
  const count = p.episodes.flatMap((e) =>
    e.scenes.flatMap((s) => s.shots),
  ).length;
  if (
    p.episodes.length >= 30 ||
    count + source.scenes.flatMap((s) => s.shots).length > 500
  )
    throw Error('LIMIT');
  const e = structuredClone(source);
  e.id = uid();
  e.title =
    tr(l, '新一集：', 'New episode: ', '次の話：') + source.title.slice(0, 75);
  e.synopsis = '';
  e.continuity = '';
  for (const s of e.scenes) {
    s.id = uid();
    s.shots = s.shots.map((t) => ({
      ...t,
      id: uid(),
      locked: false,
      history: [],
      actual: 0,
      result: '',
      issue: '',
      status: 'draft',
      context: captureContext(p, e, s, t.entityIds),
    }));
  }
  return e;
}
export function reviseShot(
  s: Shot,
  patch: Partial<ShotContent>,
  at = new Date().toISOString(),
): Shot {
  if (s.locked) throw Error('LOCKED');
  return {
    ...s,
    ...patch,
    history: [...s.history, { at, content: shotContent(s) }].slice(-10),
  };
}
export function restoreShot(s: Shot, index: number) {
  if (!s.history[index]) throw Error('UNKNOWN_VERSION');
  return reviseShot(s, s.history[index].content);
}
export function validateProject(p: unknown): p is VideoProject {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
  const x = p as VideoProject,
    str = (v: unknown, max = 6000): v is string =>
      typeof v === 'string' && v.length <= max,
    arr = (v: unknown, max: number) => Array.isArray(v) && v.length <= max;
  const validContent = (s: ShotContent) =>
    s &&
    [
      'title',
      'action',
      'start',
      'end',
      'dialogue',
      'preserve',
      'references',
      'tool',
      'result',
      'issue',
    ].every((k) => str(s[k as keyof ShotContent])) &&
    str(s.context, 320000) &&
    ['close', 'medium', 'wide'].includes(s.size) &&
    Number.isFinite(s.seconds) &&
    s.seconds >= 0 &&
    s.seconds <= 3600 &&
    Number.isFinite(s.actual) &&
    s.actual >= 0 &&
    s.actual <= 3600 &&
    [
      'text',
      'image',
      'image-edit',
      'video',
      'image-video',
      'video-edit',
    ].includes(s.mode) &&
    ['draft', 'making', 'review', 'approved'].includes(s.status) &&
    arr(s.entityIds, 50) &&
    s.entityIds.every((v) => str(v, 80));
  if (
    x.schema !== 1 ||
    !str(x.id, 80) ||
    !x.id ||
    !str(x.title, 100) ||
    !x.title.trim() ||
    !['single', 'series'].includes(x.kind) ||
    !str(x.bible) ||
    !arr(x.entities, 50) ||
    !arr(x.episodes, 30)
  )
    return false;
  const ids = new Set<string>();
  const unique = (id: unknown) => {
    if (!str(id, 80) || !id || ids.has(id)) return false;
    ids.add(id);
    return true;
  };
  if (
    !unique(x.id) ||
    !x.entities.every(
      (a) => a && unique(a.id) && str(a.name, 100) && str(a.fixed),
    )
  )
    return false;
  const entities = new Set(x.entities.map((x) => x.id));
  let shots = 0;
  return (
    x.episodes.every(
      (e) =>
        e &&
        unique(e.id) &&
        str(e.title, 100) &&
        str(e.synopsis) &&
        str(e.continuity) &&
        arr(e.scenes, 50) &&
        e.scenes.every(
          (s) =>
            s &&
            unique(s.id) &&
            str(s.title, 100) &&
            str(s.setting) &&
            arr(s.shots, 100) &&
            s.shots.every((t) => {
              shots++;
              return (
                t &&
                unique(t.id) &&
                validContent(t) &&
                t.entityIds.every((id) => entities.has(id)) &&
                typeof t.locked === 'boolean' &&
                arr(t.history, 10) &&
                t.history.every(
                  (h) => h && str(h.at, 50) && validContent(h.content),
                )
              );
            }),
        ),
    ) && shots <= 500
  );
}
export function parseProject(raw: string) {
  if (raw.length > 500000) throw Error('TOO_LARGE');
  const p = JSON.parse(raw);
  if (!validateProject(p)) throw Error('INVALID_PROJECT');
  return p;
}
export function shotPrompt(
  p: VideoProject,
  e: Episode,
  s: Scene,
  shot: Shot,
  l: Lang,
) {
  const sizes = {
    close: tr(
      l,
      '近景：明确表情或局部细节的范围',
      'Close shot: specify face or detail coverage',
      '近景：表情や細部の範囲を指定',
    ),
    medium: tr(
      l,
      '中景：明确动作、身体范围和人物关系',
      'Medium shot: define action, body framing and relationships',
      '中景：動作・身体範囲・関係を指定',
    ),
    wide: tr(
      l,
      '远景：明确环境、人物位置和空间关系',
      'Wide shot: define environment, placement and geography',
      '遠景：環境・人物位置・空間関係を指定',
    ),
  };
  return createBriefOutput(
    {
      goal: [
        shot.title,
        shot.action,
        shot.start
          ? tr(l, '开始状态', 'Starting state', '開始状態') + ': ' + shot.start
          : '',
        shot.end
          ? tr(l, '结束状态', 'Ending state', '終了状態') + ': ' + shot.end
          : '',
        shot.dialogue
          ? tr(l, '台词 / 声音', 'Dialogue / sound', '台詞・音') +
            ': ' +
            shot.dialogue
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      change: shot.issue,
      preserve: shot.preserve,
      materials: [shot.context, shot.references].filter(Boolean).join('\n'),
      settings: `${shot.seconds}s / ${sizes[shot.size]}`,
      priority: '',
    },
    `${p.title} / ${e.title} / ${s.title}`,
    [
      sizes[shot.size],
      tr(
        l,
        '保持已确认的角色和场景设定，明确镜头衔接。缺少参考图则标记待提供，不假装看过。',
        'Preserve confirmed character and scene details; define continuity. Mark absent references as needed, never inspected.',
        '確認済みの人物と場面を保持し接続を明示。未提供画像を閲覧済みにしない。',
      ),
    ].join('\n'),
    shot.tool,
    shot.mode,
    l,
  );
}
export function projectChecklist(p: VideoProject, l: Lang) {
  const lines: string[] = [];
  for (const e of p.episodes) {
    for (const s of e.scenes) {
      s.shots.forEach((t, i) => {
        const prefix = `${e.title} / ${s.title} / ${t.title || i + 1}`;
        if (!t.action)
          lines.push(
            prefix +
              ' — ' +
              tr(l, '缺少动作', 'Missing action', '動作が未設定'),
          );
        if (!t.references && t.mode === 'image-video')
          lines.push(
            prefix +
              ' — ' +
              tr(
                l,
                '缺少参考图说明',
                'Missing reference image note',
                '参照画像が未設定',
              ),
          );
        if (
          i &&
          s.shots[i - 1].end.trim() &&
          t.start.trim() &&
          s.shots[i - 1].end.trim() !== t.start.trim()
        )
          lines.push(
            prefix +
              ' — ' +
              tr(
                l,
                '前镜结束与本镜开始描述不同，请人工核对衔接',
                'Different end/start descriptions: manually verify continuity',
                '前後の終了・開始記述が異なるため接続を確認',
              ),
          );
        if (t.context !== captureContext(p, e, s, t.entityIds))
          lines.push(
            prefix +
              ' — ' +
              tr(
                l,
                '设定已变化，本镜仍保留旧快照',
                'Settings changed; this shot keeps its earlier snapshot',
                '設定変更あり。このカットは旧スナップショットを保持',
              ),
          );
      });
    }
  }
  return lines;
}
