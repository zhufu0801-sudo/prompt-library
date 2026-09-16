'use client';
/* eslint-disable react-hooks/exhaustive-deps, react/react-compiler -- Storage effects synchronize browser state; depending on the updated index would cause a loop. */
import { useEffect, useState, useRef } from 'react';
import { Film, Plus, Download, Save, Lock, Unlock } from 'lucide-react';
import {
  tr,
  adapters,
  modes,
  modeName,
  downloadText,
  type Lang,
  type Mode,
} from '@/lib/workflow';
import {
  newProject,
  starterProject,
  duplicateEpisode,
  newShot,
  uid,
  captureContext,
  reviseShot,
  restoreShot,
  parseProject,
  shotPrompt,
  projectChecklist,
  type VideoProject,
  type Shot,
  type ShotContent,
} from '@/lib/video-project';
const localPrefix = 'ame_video_v1_';
export default function VideoWorkspace({ locale: l }: { locale: Lang }) {
  const [project, setProject] = useState<VideoProject | null>(null),
    [revision, setRevision] = useState(0),
    [ep, setEp] = useState(''),
    [scene, setScene] = useState(''),
    [shot, setShot] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [title, setTitle] = useState(''),
    [kind, setKind] = useState<'single' | 'series'>('single'),
    [cloud, setCloud] = useState<{ id: string; title: string }[]>([]),
    [local, setLocal] = useState<{ id: string; title: string }[]>([]),
    [affected, setAffected] = useState<string[]>([]),
    [editing, setEditing] = useState(''),
    [baseline, setBaseline] = useState(''),
    [useStarter, setUseStarter] = useState(true),
    [directShot, setDirectShot] = useState(false);
  const say = (zh: string, en: string, ja: string) => tr(l, zh, en, ja);
  const activeProjectId = useRef<string | null>(null);
  async function refresh() {
    try {
      const r = await fetch('/api/projects');
      if (!r.ok) throw Error();
      setCloud(
        ((await r.json()) as { projects: { id: string; title: string }[] })
          .projects,
      );
    } catch {
      setMessage(
        say(
          '云端暂不可用，可继续本地编辑并导出备份。',
          'Cloud unavailable; continue locally and export a backup.',
          'クラウド利用不可。ローカル編集と書き出しは可能です。',
        ),
      );
    }
  }
  useEffect(() => {
    void refresh();
    try {
      const rows = JSON.parse(
        localStorage.getItem(localPrefix + 'index') || '[]',
      );
      if (Array.isArray(rows))
        setLocal(
          rows.filter(
            (x) => x && typeof x.id === 'string' && typeof x.title === 'string',
          ),
        );
    } catch {}
  }, []);
  useEffect(() => {
    if (!project) return;
    try {
      const raw = JSON.stringify(project);
      if (raw.length > 500000) throw Error();
      localStorage.setItem(
        localPrefix + project.id,
        JSON.stringify({ project, revision, baseline }),
      );
      const items = [
        { id: project.id, title: project.title },
        ...local.filter((x) => x.id !== project.id),
      ].slice(0, 30);
      localStorage.setItem(localPrefix + 'index', JSON.stringify(items));
      setLocal(items);
    } catch {
      setMessage(
        say(
          '本地存储已满或不可用，请立即导出项目备份。',
          'Local storage is full or unavailable. Export a backup now.',
          '保存領域不足または利用不可。今すぐ書き出してください。',
        ),
      );
    }
  }, [project, revision, baseline]);
  function activate(p: VideoProject, r = 0, b = '') {
    if (busy) return;
    activeProjectId.current = p.id;
    setProject(p);
    setRevision(r);
    setBaseline(b);
    setEp(p.episodes[0]?.id || '');
    setScene(p.episodes[0]?.scenes[0]?.id || '');
    setShot(p.episodes[0]?.scenes[0]?.shots[0]?.id || '');
    setEditing('');
    setAffected([]);
    setMessage('');
  }
  const episode = project?.episodes.find((x) => x.id === ep),
    currentScene = episode?.scenes.find((x) => x.id === scene),
    currentShot = currentScene?.shots.find((x) => x.id === shot);
  function change(fn: (p: VideoProject) => void) {
    if (!project) return;
    const p = structuredClone(project);
    fn(p);
    setProject(p);
  }
  function updateShot(patch: Partial<ShotContent>) {
    if (!currentShot || currentShot.locked) return;
    change((p) => {
      const s = p.episodes
        .find((x) => x.id === ep)!
        .scenes.find((x) => x.id === scene)!;
      s.shots = s.shots.map((x) =>
        x.id !== shot
          ? x
          : editing === shot
            ? { ...x, ...patch }
            : reviseShot(x, patch),
      );
    });
    setEditing(shot);
  }
  async function save() {
    if (!project) return;
    setBusy(true);
    try {
      const r = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, revision }),
      });
      if (!r.ok) throw Error(String(r.status));
      const body = (await r.json()) as { revision: number };
      if (activeProjectId.current !== project.id) return;
      setRevision(body.revision);
      setBaseline(JSON.stringify(project));
      setMessage(
        say(
          '项目已保存到当前访客的云端空间。',
          'Saved to this visitor’s cloud space.',
          '現在の訪問者のクラウド領域に保存済み。',
        ),
      );
      await refresh();
    } catch (e) {
      setMessage(
        String(e).includes('409')
          ? say(
              '云端版本已变化或达到数量限制。请先导出当前项目，再另存副本，避免覆盖。',
              'Cloud conflict or project limit. Export first, then save a new copy to avoid overwriting.',
              'クラウド競合または上限。書き出してから別名コピーを保存してください。',
            )
          : say(
              '保存失败，本地编辑仍保留，请导出备份后重试。',
              'Save failed. Local edits remain; export and retry.',
              '保存失敗。ローカル編集は保持。書き出して再試行。',
            ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function load(id: string, fromLocal: boolean) {
    try {
      if (fromLocal) {
        const x = JSON.parse(localStorage.getItem(localPrefix + id) || '');
        activate(
          parseProject(JSON.stringify(x.project)),
          x.revision || 0,
          x.baseline || '',
        );
      } else {
        const r = await fetch('/api/projects?id=' + encodeURIComponent(id));
        if (!r.ok) throw Error();
        const x = (await r.json()) as { project: unknown; revision: number };
        activate(
          parseProject(JSON.stringify(x.project)),
          x.revision,
          JSON.stringify(x.project),
        );
      }
    } catch {
      setMessage(
        say(
          '项目读取失败，未覆盖当前内容。',
          'Could not load; current content is unchanged.',
          '読込失敗。現在の内容は保持。',
        ),
      );
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error();
      const p = parseProject(await file.text());
      p.id = uid();
      activate(p);
      setMessage(
        say(
          '已作为新副本导入，不覆盖原项目。',
          'Imported as a new copy, preserving the original.',
          '原本を上書きせず、新規コピーとして取り込みました。',
        ),
      );
    } catch {
      setMessage(
        say(
          '文件格式、结构或大小无效。请使用本网站导出的 JSON 项目。',
          'Invalid file, structure or size. Use an exported project JSON.',
          '形式・構造・サイズが無効です。本サイトのJSONを使用してください。',
        ),
      );
    }
  }
  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    large = false,
    disabled = false,
  ) => (
    <label>
      {label}
      {large ? (
        <textarea
          value={value}
          maxLength={6000}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={100}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
  const allShots =
    project?.episodes.flatMap((e) =>
      e.scenes.flatMap((s) => s.shots.map((t) => ({ e, s, t }))),
    ) || [];
  const stale = project
    ? allShots.filter(
        ({ e, s, t }) =>
          t.context !== captureContext(project, e, s, t.entityIds),
      )
    : [];
  const output =
    project && episode && currentScene && currentShot
      ? shotPrompt(project, episode, currentScene, currentShot, l)
      : null;
  const shotText = output
    ? directShot && output.directAvailable
      ? output.direct
      : output.prompt
    : '';
  return (
    <section className="video-workspace">
      <div className="journey-title">
        <div>
          <span className="eyebrow">VIDEO WORKSPACE</span>
          <h1>
            {say(
              '让故事继续，而不是重新开始',
              'Keep the story moving',
              '物語を、続きから',
            )}
          </h1>
          <p>
            {say(
              '单片反复打磨，多集共用设定。这里整理项目与提示词，不直接生成视频。',
              'Iterate on one film or share settings across episodes. Organize projects and prompts; no video generation here.',
              '単作の改良も連作の設定共有も。ここでは計画とプロンプトを整理します。',
            )}
          </p>
        </div>
        <Film size={40} />
      </div>
      <details className="project-switch" open={!project}>
        <summary>
          {say(
            '创建、打开或导入项目',
            'Create, open or import a project',
            '作成・開く・取り込み',
          )}
        </summary>
        <div className="form-grid">
          {field(
            say('新项目名称', 'New project name', '新規プロジェクト名'),
            title,
            setTitle,
          )}
          <label>
            {say('项目类型', 'Project type', '種類')}
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as 'single' | 'series')}
            >
              <option value="single">
                {say('单条视频', 'Single video', '単作')}
              </option>
              <option value="series">
                {say('系列 / 多集', 'Series / episodes', 'シリーズ・連作')}
              </option>
            </select>
          </label>
        </div>
        <label className="check-line">
          <input
            type="checkbox"
            checked={useStarter}
            onChange={(e) => setUseStarter(e.target.checked)}
          />
          {say(
            '从远景—中景—近景的三镜头结构开始（故事由你填写）',
            'Start with wide, medium and close shots; you supply the story',
            '遠景・中景・近景の3カットで開始（物語は自分で記入）',
          )}
        </label>
        <button
          disabled={busy}
          onClick={() => {
            if (!title.trim()) {
              setMessage(
                say(
                  '先填写项目名称。',
                  'Enter a project name.',
                  '名前を入力してください。',
                ),
              );
              return;
            }
            activate(
              useStarter
                ? starterProject(title.trim(), kind, l)
                : newProject(title.trim(), kind),
            );
            setTitle('');
          }}
        >
          <Plus size={16} />
          {say('创建项目', 'Create project', '作成')}
        </button>
        <label className="file-input">
          {say(
            '导入项目 JSON（作为新副本）',
            'Import project JSON as a copy',
            'JSONを新規コピーとして取り込む',
          )}
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <div className="form-grid">
          <div>
            <h3>{say('本机草稿', 'Local drafts', 'ローカル下書き')}</h3>
            {local.map((x) => (
              <button key={x.id} onClick={() => load(x.id, true)}>
                {x.title}
              </button>
            ))}
          </div>
          <div>
            <h3>{say('云端已保存', 'Cloud saves', 'クラウド保存')}</h3>
            {cloud.map((x) => (
              <button key={x.id} onClick={() => load(x.id, false)}>
                {x.title}
              </button>
            ))}
          </div>
        </div>
      </details>
      {!project && (
        <div className="empty-workspace">
          <Film size={36} />
          <h2>
            {say('从一个故事开始', 'Start with a story', 'ひとつの物語から')}
          </h2>
          <p>
            {say(
              '展开上方入口创建项目，或导入以前的备份。',
              'Create a project above or import a previous backup.',
              '上から新規作成するか、バックアップを取り込んでください。',
            )}
          </p>
        </div>
      )}
      <output className="inline-status">{message}</output>
      {project && (
        <>
          <div className="project-toolbar">
            <strong>{project.title}</strong>
            <span>
              {baseline === JSON.stringify(project)
                ? say('云端已同步', 'Cloud synced', '同期済み')
                : say(
                    '有未保存到云端的改动',
                    'Unsaved cloud changes',
                    'クラウド未保存の変更',
                  )}
            </span>
            <button onClick={save} disabled={busy}>
              <Save size={17} />
              {say('保存项目', 'Save project', '保存')}
            </button>
            <button
              onClick={() =>
                downloadText(
                  project.title + '.json',
                  JSON.stringify(project, null, 2),
                  'application/json',
                )
              }
            >
              <Download size={17} />
              {say('导出备份', 'Export backup', 'バックアップ')}
            </button>
            <button
              onClick={() => {
                const p = structuredClone(project);
                p.id = uid();
                p.title = p.title.slice(0, 90) + ' copy';
                activate(p);
              }}
            >
              {say('另存副本', 'New copy', 'コピー作成')}
            </button>
            <button
              onClick={() => {
                const text = allShots
                  .map(({ e, s, t }, i) => {
                    const o = shotPrompt(project, e, s, t, l);
                    return `## ${i + 1}. ${e.title} / ${s.title} / ${t.title}\n${t.seconds}s / ${t.actual}s\n\n${o.prompt}\n\n${o.assets}\n\n${o.settings}\n\n${t.result}`;
                  })
                  .join('\n\n---\n\n');
                downloadText(project.title + '-production.md', text);
              }}
            >
              {say('导出逐镜制作清单', 'Export shot package', 'カット制作一覧')}
            </button>
          </div>
          <div className="production-progress">
            <strong>
              {say('制作进度', 'Production progress', '制作の進み具合')}
            </strong>
            <progress
              max={Math.max(1, allShots.length)}
              value={allShots.filter((x) => x.t.status === 'approved').length}
            />
            <span>
              {allShots.filter((x) => x.t.status === 'approved').length} /{' '}
              {allShots.length}{' '}
              {say('镜头已确认', 'shots approved', 'カット確認済み')} ·{' '}
              {allShots.reduce((n, x) => n + x.t.seconds, 0)}s
            </span>
          </div>
          <p className="storage-note">
            {say(
              '云端按当前浏览器访客隔离，不是账号同步。清除 Cookie 或换设备前请导出；导入会创建副本。文字资料会在点击保存后上传，媒体仅记录文件名或链接。',
              'Cloud storage is browser-visitor scoped, not account sync. Export before clearing cookies or changing devices. Saving uploads text; media remains filenames or links.',
              'クラウドはブラウザー訪問者単位です。Cookie削除・端末変更前に書き出してください。保存時に文章を送信し、媒体は名称やリンクのみ記録。',
            )}
          </p>
          <details className="project-settings">
            <summary>
              {say(
                '共用设定与角色',
                'Shared settings and characters',
                '共通設定・キャラクター',
              )}
            </summary>
            {field(
              say('项目名称', 'Project name', 'プロジェクト名'),
              project.title,
              (v) =>
                change((p) => {
                  p.title = v;
                }),
            )}
            {field(
              say(
                '世界观、画风与固定规则',
                'World, visual style and fixed rules',
                '世界観・画風・固定ルール',
              ),
              project.bible,
              (v) =>
                change((p) => {
                  p.bible = v;
                }),
              true,
            )}
            {project.entities.map((a, i) => (
              <div className="entity-row" key={a.id}>
                {field(
                  say(
                    '角色 / 道具名称',
                    'Character / prop name',
                    '人物・小道具名',
                  ),
                  a.name,
                  (v) =>
                    change((p) => {
                      p.entities[i].name = v;
                    }),
                )}
                {field(
                  say(
                    '固定特征（服装变化放在单集状态）',
                    'Fixed traits (episode changes go below)',
                    '固定特徴（変化は各話の状態へ）',
                  ),
                  a.fixed,
                  (v) =>
                    change((p) => {
                      p.entities[i].fixed = v;
                    }),
                  true,
                )}
              </div>
            ))}
            <button
              disabled={project.entities.length >= 50}
              onClick={() =>
                change((p) => {
                  p.entities.push({ id: uid(), name: '', fixed: '' });
                })
              }
            >
              <Plus size={16} />
              {say(
                '添加角色或道具',
                'Add character or prop',
                '人物・道具を追加',
              )}
            </button>
          </details>
          {stale.length > 0 && (
            <details className="impact-panel">
              <summary>
                {say(
                  '设定变化：选择要更新的镜头',
                  'Settings changed: choose affected shots',
                  '設定変更：更新するカットを選択',
                )}{' '}
                ({stale.length})
              </summary>
              <p>
                {say(
                  '旧镜头不会自动覆盖。锁定镜头需要先解锁；勾选后仅更新设定快照，动作和版本保留。',
                  'Existing shots are never overwritten automatically. Unlock first; selected updates replace context snapshots while preserving actions and history.',
                  '旧カットは自動上書きしません。ロック解除後に選択すると、動作と履歴を保ち設定スナップショットだけ更新。',
                )}
              </p>
              {stale.map(({ e, s, t }) => (
                <label className="check-line" key={t.id}>
                  <input
                    type="checkbox"
                    disabled={t.locked}
                    checked={affected.includes(t.id)}
                    onChange={(v) =>
                      setAffected(
                        v.target.checked
                          ? [...affected, t.id]
                          : affected.filter((x) => x !== t.id),
                      )
                    }
                  />
                  {e.title} / {s.title} /{' '}
                  {t.title ||
                    say('未命名镜头', 'Untitled shot', '無題のカット')}
                  {t.locked ? ' 🔒' : ''}
                </label>
              ))}
              <button
                disabled={!affected.length}
                onClick={() => {
                  change((p) => {
                    for (const e of p.episodes)
                      for (const s of e.scenes)
                        s.shots = s.shots.map((t) =>
                          affected.includes(t.id) && !t.locked
                            ? reviseShot(t, {
                                context: captureContext(p, e, s, t.entityIds),
                              })
                            : t,
                        );
                  });
                  setAffected([]);
                  setEditing('');
                }}
              >
                {say(
                  '更新选中镜头的设定快照',
                  'Update selected snapshots',
                  '選択した設定を更新',
                )}
              </button>
            </details>
          )}
          <div className="production-layout">
            <aside className="episode-rail">
              <h2>{say('故事结构', 'Story structure', '物語の構造')}</h2>
              {project.episodes.map((e) => (
                <div key={e.id}>
                  <button
                    className={ep === e.id ? 'selected' : ''}
                    onClick={() => {
                      setEp(e.id);
                      setScene(e.scenes[0]?.id || '');
                      setShot('');
                      setEditing('');
                    }}
                  >
                    {e.title ||
                      say('未命名单集', 'Untitled episode', '無題の話')}
                  </button>
                  {ep === e.id &&
                    e.scenes.map((s) => (
                      <button
                        className={scene === s.id ? 'selected sub' : 'sub'}
                        key={s.id}
                        onClick={() => {
                          setScene(s.id);
                          setShot('');
                          setEditing('');
                        }}
                      >
                        {s.title ||
                          say(
                            '未命名场景',
                            'Untitled scene',
                            '無題の場面',
                          )}{' '}
                        · {s.shots.length}
                      </button>
                    ))}
                </div>
              ))}
              <button
                disabled={project.episodes.length >= 30}
                onClick={() => {
                  const id = uid();
                  change((p) => {
                    p.episodes.push({
                      id,
                      title:
                        say('第', 'Episode ', '第') + (p.episodes.length + 1),
                      synopsis: '',
                      continuity: '',
                      scenes: [],
                    });
                  });
                  setEp(id);
                  setScene('');
                  setShot('');
                }}
              >
                <Plus size={16} />
                {say('添加单集 / 影片', 'Add episode / film', '話・作品を追加')}
              </button>
            </aside>
            <div className="production-main">
              {episode && (
                <details className="episode-reuse">
                  <summary>
                    {say(
                      '复用这一集的制作结构',
                      'Reuse this episode structure',
                      'この話の構成を再利用',
                    )}
                  </summary>
                  <p>
                    {say(
                      '复制场景、镜头动作和参考资料供你修改；新一集的故事、衔接、制作结果和确认状态会清空，原集不变。',
                      'Copies scenes, shot directions and references for revision. Story, continuity, results and approvals reset; the original stays unchanged.',
                      '場面・カット指示・参照資料をコピー。物語・接続・結果・確認状態はリセットし、元の話は保持します。',
                    )}
                  </p>
                  <button
                    disabled={busy || project.episodes.length >= 30}
                    onClick={() => {
                      try {
                        const e = duplicateEpisode(project, episode.id, l);
                        change((p) => {
                          p.episodes.push(e);
                        });
                        setEp(e.id);
                        setScene(e.scenes[0]?.id || '');
                        setShot(e.scenes[0]?.shots[0]?.id || '');
                        setEditing('');
                      } catch {
                        setMessage(
                          say(
                            '已达到项目容量限制，请另建项目。',
                            'Project capacity reached; start another project.',
                            '容量上限です。別のプロジェクトを作成してください。',
                          ),
                        );
                      }
                    }}
                  >
                    {say(
                      '作为新一集复用',
                      'Reuse as a new episode',
                      '次の話として再利用',
                    )}
                  </button>
                </details>
              )}
              {episode ? (
                <>
                  <div className="form-grid">
                    {field(
                      say('单集名称', 'Episode name', '話の名前'),
                      episode.title,
                      (v) =>
                        change((p) => {
                          p.episodes.find((x) => x.id === ep)!.title = v;
                        }),
                    )}
                    {field(
                      say('本集故事', 'Episode story', '今回の物語'),
                      episode.synopsis,
                      (v) =>
                        change((p) => {
                          p.episodes.find((x) => x.id === ep)!.synopsis = v;
                        }),
                      true,
                    )}
                  </div>
                  {field(
                    say(
                      '本集状态与上集衔接（确认后填写）',
                      'Confirmed episode state and continuity',
                      '確認済みの状態・前話との接続',
                    ),
                    episode.continuity,
                    (v) =>
                      change((p) => {
                        p.episodes.find((x) => x.id === ep)!.continuity = v;
                      }),
                    true,
                  )}
                  <button
                    disabled={episode.scenes.length >= 50}
                    onClick={() => {
                      const id = uid();
                      change((p) => {
                        p.episodes
                          .find((x) => x.id === ep)!
                          .scenes.push({
                            id,
                            title:
                              say('场景 ', 'Scene ', '場面 ') +
                              (episode.scenes.length + 1),
                            setting: '',
                            shots: [],
                          });
                      });
                      setScene(id);
                      setShot('');
                    }}
                  >
                    <Plus size={16} />
                    {say('添加场景', 'Add scene', '場面を追加')}
                  </button>
                  {currentScene && (
                    <>
                      <div className="form-grid">
                        {field(
                          say('场景名称', 'Scene name', '場面名'),
                          currentScene.title,
                          (v) =>
                            change((p) => {
                              p.episodes
                                .find((x) => x.id === ep)!
                                .scenes.find((x) => x.id === scene)!.title = v;
                            }),
                        )}
                        {field(
                          say(
                            '地点、时间、人物位置与道具状态',
                            'Location, time, positions and prop state',
                            '場所・時間・人物位置・道具状態',
                          ),
                          currentScene.setting,
                          (v) =>
                            change((p) => {
                              p.episodes
                                .find((x) => x.id === ep)!
                                .scenes.find((x) => x.id === scene)!.setting =
                                v;
                            }),
                          true,
                        )}
                      </div>
                      <div className="shot-strip">
                        {currentScene.shots.map((s, i) => (
                          <button
                            className={shot === s.id ? 'selected' : ''}
                            key={s.id}
                            onClick={() => {
                              setShot(s.id);
                              setEditing('');
                            }}
                          >
                            {i + 1}. {s.title || say('镜头', 'Shot', 'カット')}{' '}
                            {s.locked ? '🔒' : ''}
                          </button>
                        ))}
                        <button
                          disabled={
                            allShots.length >= 500 ||
                            currentScene.shots.length >= 100
                          }
                          onClick={() => {
                            const t = newShot(
                              captureContext(
                                project,
                                episode,
                                currentScene,
                                [],
                              ),
                            );
                            change((p) => {
                              p.episodes
                                .find((x) => x.id === ep)!
                                .scenes.find((x) => x.id === scene)!
                                .shots.push(t);
                            });
                            setShot(t.id);
                            setEditing('');
                          }}
                        >
                          <Plus size={16} />
                          {say('添加镜头', 'Add shot', 'カット追加')}
                        </button>
                      </div>
                      <p>
                        {say(
                          '计划总时长 / 已填实际时长',
                          'Planned / entered actual duration',
                          '予定時間 / 入力済み実時間',
                        )}
                        :{' '}
                        {currentScene.shots.reduce((n, s) => n + s.seconds, 0)}s
                        / {currentScene.shots.reduce((n, s) => n + s.actual, 0)}
                        s
                      </p>
                    </>
                  )}
                  {currentShot && (
                    <div className="shot-editor">
                      <div className="project-toolbar">
                        <h3>{say('镜头编辑', 'Shot editor', 'カット編集')}</h3>
                        {[-1, 1].map((direction) => (
                          <button
                            key={direction}
                            disabled={
                              currentShot.locked ||
                              !currentScene ||
                              currentScene.shots.findIndex(
                                (t) => t.id === shot,
                              ) +
                                direction <
                                0 ||
                              currentScene.shots.findIndex(
                                (t) => t.id === shot,
                              ) +
                                direction >=
                                currentScene.shots.length
                            }
                            onClick={() =>
                              change((p) => {
                                const shots = p.episodes
                                  .find((e) => e.id === ep)!
                                  .scenes.find((s) => s.id === scene)!.shots;
                                const i = shots.findIndex((t) => t.id === shot);
                                const target = i + direction;
                                if (target >= 0 && target < shots.length)
                                  [shots[i], shots[target]] = [
                                    shots[target],
                                    shots[i],
                                  ];
                              })
                            }
                          >
                            {direction < 0
                              ? say('镜头前移', 'Move shot earlier', '前へ移動')
                              : say('镜头后移', 'Move shot later', '後へ移動')}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            change((p) => {
                              const x = p.episodes
                                .find((x) => x.id === ep)!
                                .scenes.find((x) => x.id === scene)!
                                .shots.find((x) => x.id === shot)!;
                              x.locked = !x.locked;
                            });
                            setEditing('');
                          }}
                        >
                          {currentShot.locked ? (
                            <Unlock size={16} />
                          ) : (
                            <Lock size={16} />
                          )}{' '}
                          {currentShot.locked
                            ? say('解锁修改', 'Unlock', 'ロック解除')
                            : say(
                                '锁定已确认镜头',
                                'Lock approved shot',
                                '確認済みカットをロック',
                              )}
                        </button>
                      </div>
                      <fieldset disabled={currentShot.locked}>
                        <legend>
                          {say('镜头内容', 'Shot content', 'カット内容')}
                        </legend>
                        {field(
                          say(
                            '镜头名称 / 目的',
                            'Shot name / purpose',
                            '名前・目的',
                          ),
                          currentShot.title,
                          (v) => updateShot({ title: v }),
                        )}
                        <div className="form-grid">
                          <label>
                            {say('景别', 'Shot size', '画角')}
                            <select
                              value={currentShot.size}
                              onChange={(e) =>
                                updateShot({
                                  size: e.target.value as Shot['size'],
                                })
                              }
                            >
                              <option value="close">
                                {say('近景', 'Close', '近景')}
                              </option>
                              <option value="medium">
                                {say('中景', 'Medium', '中景')}
                              </option>
                              <option value="wide">
                                {say('远景', 'Wide', '遠景')}
                              </option>
                            </select>
                          </label>
                          <label>
                            {say('计划秒数', 'Planned seconds', '予定秒数')}
                            <input
                              type="number"
                              min={0}
                              max={3600}
                              value={currentShot.seconds}
                              onChange={(e) =>
                                updateShot({
                                  seconds: Math.max(
                                    0,
                                    Math.min(3600, Number(e.target.value)),
                                  ),
                                })
                              }
                            />
                          </label>
                          <label>
                            {say(
                              '实际秒数（未制作填0）',
                              'Actual seconds (0 if pending)',
                              '実秒数（未制作は0）',
                            )}
                            <input
                              type="number"
                              min={0}
                              max={3600}
                              value={currentShot.actual}
                              onChange={(e) =>
                                updateShot({
                                  actual: Math.max(
                                    0,
                                    Math.min(3600, Number(e.target.value)),
                                  ),
                                })
                              }
                            />
                          </label>
                        </div>
                        <div className="entity-picks">
                          {project.entities.map((a) => (
                            <label className="check-line" key={a.id}>
                              <input
                                type="checkbox"
                                checked={currentShot.entityIds.includes(a.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...currentShot.entityIds, a.id]
                                    : currentShot.entityIds.filter(
                                        (x) => x !== a.id,
                                      );
                                  updateShot({
                                    entityIds: ids,
                                    context: captureContext(
                                      project,
                                      episode,
                                      currentScene!,
                                      ids,
                                    ),
                                  });
                                }}
                              />
                              {a.name ||
                                say(
                                  '未命名角色',
                                  'Unnamed character',
                                  '無名の人物',
                                )}
                            </label>
                          ))}
                        </div>
                        {(
                          [
                            'action',
                            'start',
                            'end',
                            'dialogue',
                            'preserve',
                            'references',
                            'result',
                            'issue',
                          ] as const
                        ).map((key, i) => (
                          <div key={key}>
                            {field(
                              [
                                say(
                                  '动作与运镜',
                                  'Action and camera',
                                  '動作・カメラ',
                                ),
                                say('开始状态', 'Start state', '開始状態'),
                                say('结束状态', 'End state', '終了状態'),
                                say(
                                  '台词、字幕或声音',
                                  'Dialogue, captions or sound',
                                  '台詞・字幕・音',
                                ),
                                say('必须保留', 'Must preserve', '保持条件'),
                                say(
                                  '参考素材文件名 / 链接与用途',
                                  'Reference filenames / links and purpose',
                                  '参照素材名・リンク・用途',
                                ),
                                say(
                                  '制作结果与素材位置',
                                  'Result notes and asset location',
                                  '結果・素材の場所',
                                ),
                                say(
                                  '只需要修改的问题',
                                  'Specific repair needed',
                                  '修正が必要な問題',
                                ),
                              ][i],
                              currentShot[key],
                              (v) => updateShot({ [key]: v }),
                              true,
                            )}
                          </div>
                        ))}
                        <div className="form-grid">
                          <label>
                            {say('使用软件', 'Tool', 'ツール')}
                            <select
                              value={currentShot.tool}
                              onChange={(e) =>
                                updateShot({ tool: e.target.value })
                              }
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
                              value={currentShot.mode}
                              onChange={(e) =>
                                updateShot({ mode: e.target.value as Mode })
                              }
                            >
                              {modes
                                .filter((x) => x !== 'text')
                                .map((m) => (
                                  <option key={m} value={m}>
                                    {modeName(m, l)}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <label>
                            {say('制作状态', 'Production status', '制作状況')}
                            <select
                              value={currentShot.status}
                              onChange={(e) =>
                                updateShot({
                                  status: e.target.value as Shot['status'],
                                })
                              }
                            >
                              {['draft', 'making', 'review', 'approved'].map(
                                (s, i) => (
                                  <option key={s} value={s}>
                                    {
                                      [
                                        say('草稿', 'Draft', '下書き'),
                                        say('制作中', 'In progress', '制作中'),
                                        say('待检查', 'Review', '要確認'),
                                        say('已确认', 'Approved', '確認済み'),
                                      ][i]
                                    }
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                        </div>
                      </fieldset>
                      <button
                        disabled={currentShot.locked}
                        onClick={() => {
                          updateShot({});
                          setEditing('');
                          setMessage(
                            say(
                              '已结束本次编辑；下次修改会保留当前版本。',
                              'Editing checkpoint set; your next change will retain this version.',
                              '編集区切りを設定。次の変更時に現在の版を保持します。',
                            ),
                          );
                        }}
                      >
                        {say(
                          '保留当前版本，继续下一轮修改',
                          'Keep this version before the next revision',
                          '現在の版を残して次の修正へ',
                        )}
                      </button>
                      <details>
                        <summary>
                          {say(
                            '版本历史（最近10次编辑批次）',
                            'Version history (last 10 editing sessions)',
                            '変更履歴（最近10回）',
                          )}{' '}
                          · {currentShot.history.length}
                        </summary>
                        {currentShot.history.map((h, i) => (
                          <div className="version-row" key={h.at + '-' + i}>
                            <span>
                              {h.at} · {h.content.title} ·{' '}
                              {h.content.action.slice(0, 90)}
                            </span>
                            <button
                              disabled={currentShot.locked}
                              onClick={() => {
                                change((p) => {
                                  const s = p.episodes
                                    .find((x) => x.id === ep)!
                                    .scenes.find((x) => x.id === scene)!;
                                  s.shots = s.shots.map((x) =>
                                    x.id === shot ? restoreShot(x, i) : x,
                                  );
                                });
                                setEditing('');
                              }}
                            >
                              {say(
                                '恢复这个版本',
                                'Restore version',
                                'この版を復元',
                              )}
                            </button>
                          </div>
                        ))}
                      </details>
                      {output && (
                        <div className="shot-output">
                          <h3>
                            {say(
                              '本镜可复制内容',
                              'Copyable shot prompt',
                              'コピー用プロンプト',
                            )}
                          </h3>
                          {output.directAvailable && (
                            <label className="check-line">
                              <input
                                type="checkbox"
                                checked={directShot}
                                onChange={(e) =>
                                  setDirectShot(e.target.checked)
                                }
                              />
                              {say(
                                '只显示制作软件用的简洁指令',
                                'Show concise production instruction',
                                '制作ツール用の簡潔な指示を表示',
                              )}
                            </label>
                          )}
                          <textarea
                            readOnly
                            value={shotText}
                            aria-label={say(
                              '镜头提示词',
                              'Shot prompt',
                              'カットプロンプト',
                            )}
                          />
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(shotText);
                                setMessage(
                                  say(
                                    '已复制镜头提示词。',
                                    'Shot prompt copied.',
                                    'カット指示をコピーしました。',
                                  ),
                                );
                              } catch {
                                setMessage(
                                  say(
                                    '复制失败，请选择文本手动复制。',
                                    'Select the text and copy manually.',
                                    '文章を選択してコピーしてください。',
                                  ),
                                );
                              }
                            }}
                          >
                            {say('复制提示词', 'Copy prompt', 'コピー')}
                          </button>
                          <button
                            onClick={() =>
                              downloadText(
                                'shot.txt',
                                [shotText, output.assets, output.settings].join(
                                  '\n\n',
                                ),
                              )
                            }
                          >
                            {say(
                              '下载提示词与准备事项',
                              'Download prompt and checklist',
                              '指示と準備事項を保存',
                            )}
                          </button>
                          <p>{output.assets}</p>
                          <p>{output.settings}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p>
                  {say(
                    '先添加一集或一部影片。',
                    'Add an episode or film to begin.',
                    '話または作品を追加してください。',
                  )}
                </p>
              )}
            </div>
          </div>
          <details className="continuity-check">
            <summary>
              {say(
                '连续性与缺项检查（文字规则）',
                'Continuity and missing-input checks (text rules)',
                '連続性・不足の確認（文章ルール）',
              )}
            </summary>
            <p>
              {say(
                '只检查填写的文字与关联，不分析实际画面，也不保证角色外观一致。',
                'Checks text and references only; it does not inspect footage or guarantee visual identity.',
                '文章と関連のみ確認。映像の解析や外見一致の保証はしません。',
              )}
            </p>
            {projectChecklist(project, l).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </details>
        </>
      )}
    </section>
  );
}
