import { termEvidence } from './matching.ts';
import { tr, type Lang, type Mode, type WorkBrief } from './workflow.ts';
export type JourneyTask = {
  id: string;
  label: string;
  description: string;
  category: string;
  terms?: readonly string[];
};
// Explicit spelling suggestions, never silent edits or a model-confidence score.
export function queryCorrections(query: string) {
  const replacements = [
    ['javscript', 'javascript'],
    ['pyhton', 'python'],
    ['typscript', 'typescript'],
    ['背静', '背景'],
    ['视屏', '视频'],
    ['编成', '编程'],
    ['エクセルル', 'エクセル'],
  ];
  return replacements
    .filter(([from]) => query.toLowerCase().includes(from))
    .map(([from, to]) => ({
      from,
      to,
      query: query.replace(new RegExp(from, 'gi'), to),
    }));
}
export function separateRequests(tasks: JourneyTask[], query: string) {
  const parts = query
    .split(
      /(?:[；;\n]+|然后|另外|再帮我|\band then\b|\balso\b|それから|また、)/iu,
    )
    .map((x) => x.trim())
    .filter((x) => x.length > 3);
  if (parts.length < 2 || parts.length > 5) return [];
  const matches = parts
    .map((text) => ({ text, match: rankJourneyTasks(tasks, text)[0] }))
    .filter((x) => x.match);
  return new Set(matches.map((x) => x.match.id)).size > 1 ? matches : [];
}
export const editAliases: Record<string, string[]> = {
  'edit-image-background': [
    '换背景',
    '背景换成',
    '更换背景',
    'replace background',
    'change background',
    '背景を変え',
    '背景変更',
  ],
  'edit-image-repair': [
    '老照片',
    '模糊照片',
    '修复照片',
    'restore photo',
    'blurry photo',
    '古い写真',
    '写真の修復',
  ],
  'edit-image-object': [
    '去掉物体',
    '去掉路人',
    '移除物体',
    'remove object',
    'remove person',
    '物体を消す',
    '人を消す',
  ],
  'edit-image-light': [
    '调亮',
    '太暗',
    '颜色偏',
    'too dark',
    'lighting',
    '色補正',
    '暗すぎ',
  ],
  'edit-image-text': [
    '图片文字',
    '海报文字',
    'image text',
    'poster text',
    '画像内の文字',
  ],
  'edit-video-trim': [
    '剪掉',
    '剪辑视频',
    '视频太长',
    'trim video',
    'cut video',
    '動画を短く',
    '動画の編集',
  ],
  'edit-video-captions': ['字幕', 'captions', 'subtitles'],
  'edit-video-audio': [
    '噪音',
    '降噪',
    '视频声音',
    'background noise',
    'video audio',
    '雑音',
    'ノイズ除去',
  ],
  'edit-video-reframe': [
    '横屏改竖屏',
    '横屏转竖屏',
    '竖屏裁剪',
    'vertical crop',
    'portrait video',
    '縦動画',
  ],
  'edit-video-continuity': [
    '角色不一致',
    '镜头接不上',
    '场景变了',
    'inconsistent character',
    'shots do not connect',
    '背景が変わる',
  ],
};
export function taskCategory(t: JourneyTask) {
  if (t.category === 'image' || t.category === 'video') return t.category;
  if (t.category !== 'creative') return t.category;
  if (/image|photo|character/.test(t.id)) return 'image';
  if (/clip|storyboard|production|editing|spatial/.test(t.id)) return 'video';
  return t.category;
}
export function rankJourneyTasks<T extends JourneyTask>(
  tasks: T[],
  query: string,
) {
  const q = query.trim().normalize('NFKC');
  if (!q) return [];
  return tasks
    .map((t) => {
      const terms = [t.label, ...(t.terms || []), ...(editAliases[t.id] || [])];
      const evidence = termEvidence(q, terms).filter((x) => x.length > 1);
      const direct = termEvidence(t.label, [q]).length > 0;
      const score =
        (direct ? 8 : 0) +
        evidence.reduce((n, x) => n + Math.min(6, x.length), 0) +
        (termEvidence(q, editAliases[t.id] || []).length ? 6 : 0);
      return {
        ...t,
        evidence: direct ? [q, ...evidence.filter((x) => x !== q)] : evidence,
        score,
      };
    })
    .filter((t) => t.score >= 2)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function briefChecks(b: WorkBrief, mode: Mode, l: Lang) {
  const checks = [];
  if (!b.materials.trim())
    checks.push(
      tr(
        l,
        mode === 'text'
          ? '如需处理原文、代码或文件，请补充原始资料。'
          : '如依赖参考图或原片，请在目标软件中上传对应素材。',
        mode === 'text'
          ? 'Supply source text, code or files if this task depends on them.'
          : 'Upload required references or original footage in the target tool.',
        mode === 'text'
          ? '原文・コード・ファイルが必要な作業は原資料を補足してください。'
          : '必要な参照画像や元映像は対象ツールへ添付してください。',
      ),
    );
  if (mode.includes('edit') && !b.preserve.trim())
    checks.push(
      tr(
        l,
        '还没有说明哪些部分不能改。',
        'Elements to preserve are not specified.',
        '変更しない部分が未指定です。',
      ),
    );
  if (b.goal.trim().length < 12)
    checks.push(
      tr(
        l,
        '需求较短；补充用途或期望结果通常会更准确。',
        'A short brief may benefit from its purpose or expected outcome.',
        '用途や期待する結果を加えると伝わりやすくなります。',
      ),
    );
  return checks.slice(0, 2);
}
