'use client';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  Code2,
  Clapperboard,
  ImageIcon,
  FileText,
  PenLine,
  GraduationCap,
  Star,
  Copy,
  LockKeyhole,
  LockKeyholeOpen,
  Languages,
  ArrowUpRight,
  Search,
  RefreshCw,
  Download,
  Save,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  defaultValues,
  refreshValues,
  getOptions,
  type Template,
  type Values,
  type Locks,
  type Plan,
  type Field,
} from '@/lib/prompt';
import {
  composeStudio,
  taskFields,
  analyzeTask,
  taskKey,
  briefQuestion,
  matchingSkills,
  toolAdapter,
  translateValues,
  localeOf,
  type Locale,
} from '@/lib/studio';
import { ui } from '@/lib/studio-ui';
async function api<T>(url: string, body?: unknown): Promise<T> {
  const r = await fetch(
    url,
    body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  );
  if (!r.ok) throw Error('REQUEST_FAILED');
  return r.json();
}
export default function Home() {
  const [locale, setLocale] = useState<Locale>('zh'),
    [ready, setReady] = useState(false),
    [templates, setTemplates] = useState<Template[]>([]),
    [favorites, setFavorites] = useState<string[]>([]),
    [plans, setPlans] = useState<Plan[]>([]);
  const [active, setActive] = useState<Template | null>(null),
    [values, setValues] = useState<Values>({}),
    [locks, setLocks] = useState<Locks>({}),
    [edited, setEdited] = useState<string | null>(null),
    [meta, setMeta] = useState(true),
    [skillMode, setSkillMode] = useState(false),
    [planId, setPlanId] = useState<string | undefined>(),
    [title, setTitle] = useState('');
  const [tab, setTab] = useState('library'),
    [search, setSearch] = useState(''),
    [category, setCategory] = useState('all'),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false),
    [revision, setRevision] = useState(0),
    [notice, setNotice] = useState(''),
    [care, setCare] = useState(false),
    [help, setHelp] = useState(false),
    [custom, setCustom] = useState<Record<string, string>>({});
  const t = ui[locale];
  const fields = active ? taskFields(active, values, locale) : [];
  const analysis = active ? analyzeTask(active, values, locale) : null;
  const question = active ? briefQuestion(active,values,locale) : null;
  const skills = active ? matchingSkills(active,values) : [];
  const skillText = {
   zh:{ordinary:'普通提示词',withSkill:'附带 Skill',empty:'这个任务暂未收录合适的 Skill，仍可使用普通提示词。',download:'下载 Skill ZIP',source:'GitHub 来源',instructions:'使用方法与依赖',note:'GitHub 来源文档包或注明的适配版，附中英日使用说明。已核对来源和 MIT 许可，未在各 AI 工具中运行验证；不含模型或执行脚本。',next:'补充一项关键信息',fill:'前往填写'},
   en:{ordinary:'Standard prompt',withSkill:'With Skill',empty:'No suitable Skill is included for this task yet. The standard prompt remains available.',download:'Download Skill ZIP',source:'GitHub source',instructions:'Usage and dependencies',note:'GitHub-based documentation, original or labeled adaptation, with zh/en/ja instructions. Source and MIT license checked; not runtime-tested in each AI tool. No model or executable scripts included.',next:'One useful detail',fill:'Fill in'},
   ja:{ordinary:'通常プロンプト',withSkill:'Skill 付き',empty:'このタスクに合う Skill は未収録です。通常プロンプトは利用できます。',download:'Skill ZIPを保存',source:'GitHub 出典',instructions:'使用方法・依存関係',note:'GitHubの原文または明記した調整版と、中英日の使用説明。出典とMIT許諾を確認済み。各AIでの動作検証は未実施。モデル・実行スクリプトは含みません。',next:'補足するとよい情報',fill:'入力する'}
  }[locale];
  const analysisText = {
    zh: {title:'需求细化',intro:'根据文字匹配候选场景，请核对后使用。不会自动理解代码或图片。',task:'可选任务',evidence:'匹配词',empty:'填写具体需求后，将显示匹配场景。未匹配时仍使用所选任务的基础规范。',missing:'可补充的信息（若已写在需求中，无需重复）',apply:'切换为',details:'细分交付要求已加入元提示词；关闭元提示词辅助可移除。'},
    en: {title:'Refine your brief',intro:'Text-based scenario suggestions; check their relevance. Code and images are not automatically understood.',task:'Possible tasks',evidence:'Matched terms',empty:'Describe your goal to see matching scenarios. Otherwise, the selected task’s base rules apply.',missing:'Optional details to add (do not repeat information already in your goal)',apply:'Switch to',details:'Scenario deliverables are included with meta-prompt guidance. Turn it off to omit them.'},
    ja: {title:'要件を具体化',intro:'入力文から候補を照合します。適合性をご確認ください。コードや画像を自動理解する機能ではありません。',task:'タスク候補',evidence:'一致した語',empty:'具体的な目的を入力すると候補が表示されます。一致しない場合は選択中タスクの基本要件を使用します。',missing:'補足できる項目（目的に記載済みなら重複不要）',apply:'切り替え',details:'詳細な納品要件はメタプロンプト補助に含まれます。オフにすると除外できます。'}
  }[locale];
  useEffect(() => {
    try {
      setLocale(localeOf(localStorage.getItem('ame_locale')));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.title = 'AI Made Easy · ' + ui[locale].library;
    try {
      localStorage.setItem('ame_locale', locale);
    } catch {}
    let live = true;
    setLoading(true);
    setFailed(false);
    api<{ templates: Template[]; favorites: string[] }>(
      '/api/studio?locale=' + locale,
    )
      .then((data) => {
        if (!live) return;
        setTemplates(data.templates);
        setFavorites(data.favorites);
      })
      .catch(() => {
        if (live) setFailed(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [locale, ready, revision]);
  useEffect(() => {
    if (!active) return;
    const next = templates.find((x) => x.id === active.id);
    if (next && next !== active) {
      setValues((v) => translateValues(active, next, v, locks));
      setActive(next);
    }
  }, [templates, active, locks]);
  useEffect(() => {
    if (tab !== 'plans') return;
    let live = true;
    api<{ plans: Plan[] }>('/api/plans')
      .then((x) => {
        if (live) setPlans(x.plans);
      })
      .catch(() => {
        if (live) setNotice(t.error);
      });
    return () => {
      live = false;
    };
  }, [tab, revision, t.error]);
  function changeLocale(value: string | null) {
    const next = localeOf(value);
    setLocale(next);
    setNotice(ui[next].preserved);
  }
  function open(item: Template, plan?: Plan) {
    setActive(item);
    setValues(plan?.values ?? defaultValues(item));
    setLocks(plan?.locks ?? {});
    setEdited(plan?.output ?? null);
    setPlanId(plan?.id);
    setTitle(plan?.title ?? item.title);
    setMeta(true);
    setSkillMode(!!plan?.values.skill_id);
    setCustom({});
    setNotice('');
  }
  async function openPlan(plan: Plan) {
    setBusy(true);
    try {
      open(
        templates.find((x) => x.id === plan.templateId) ??
          (await api<Template>(
            '/api/templates/' + encodeURIComponent(plan.templateId),
          )),
        plan,
      );
    } catch {
      setNotice(t.error);
    } finally {
      setBusy(false);
    }
  }
  function update(key: string, value: string | string[]) {
    if (locks[key]) return;
    setValues((v) => ({ ...v, [key]: value, ...((key==='task'||key==='medium') && !locks.scenario ? {scenario:active?.fields.find(f=>f.key==='scenario')?.options[0] || ''} : {}), ...((key==='task'||key==='medium')?{skill_id:''}:{}) }));
    setEdited(null);
  }
  function word(f: Field, value: string) {
    if (locks[f.key]) return;
    if (f.type !== 'multi') {
      update(f.key, value);
      return;
    }
    const old = Array.isArray(values[f.key]) ? (values[f.key] as string[]) : [];
    if (old.includes(value))
      update(
        f.key,
        old.filter((x) => x !== value),
      );
    else if (old.length < f.maxSelections && value.length <= 40)
      update(f.key, [...old, value]);
    else setNotice(t.limit);
  }
  const output = active
    ? (edited ?? composeStudio(active, values, locale, meta))
    : '';
  async function favorite(id: string) {
    if (busy) return;
    setBusy(true);
    try {
      const saved = !favorites.includes(id);
      await api('/api/favorites', { templateId: id, saved });
      setFavorites((v) => (saved ? [...v, id] : v.filter((x) => x !== id)));
      setNotice(t.favorited);
    } catch {
      setNotice(t.error);
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setNotice(t.copied);
    } catch {
      setNotice(t.copyFail);
    }
  }
  async function save() {
    if (!active || busy) return;
    if (!String(values.subject || '').trim()) {
      setNotice(t.required);
      return;
    }
    setBusy(true);
    try {
      const r = await api<{ id: string }>('/api/plans', {
        id: planId,
        templateId: active.id,
        title: title.trim() || active.title,
        values,
        locks,
        output,
      });
      setPlanId(r.id);
      setNotice(t.saved);
      setRevision((x) => x + 1);
    } catch {
      setNotice(t.error);
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([output], { type: 'text/plain;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-Made-Easy-' + locale + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function example() {
    if (!active || locks.subject || String(values.subject || '').trim()) return;
    const sample = fields.find(f => f.key === 'subject')?.options[0];
    if (sample) update('subject', sample);
  }
  const filtered = templates.filter(
    (x) =>
      (tab !== 'favorites' || favorites.includes(x.id)) &&
      (category === 'all' || x.id === category) &&
      [x.title, x.description, ...x.tags]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const languagePicker = (
    <Select value={locale} onValueChange={changeLocale}>
      <SelectTrigger aria-label={t.preference} className="studio-language">
        <Languages size={17} />
        <SelectValue>{locale==='zh'?'简体中文':locale==='ja'?'日本語':'English'}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh">简体中文</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
  return (
    <div className={'studio' + (care ? ' studio-care' : '')}>
      <header className="studio-header">
        <a className="studio-brand" href="#" onClick={() => setTab('library')}>
          <Sparkles />
          AI Made Easy
        </a>
        <nav>
          {(['library', 'favorites', 'plans'] as const).map((key) => (
            <button
              key={key}
              className={tab === key ? 'selected' : ''}
              onClick={() => {
                setTab(key);
                setSearch('');
                setCategory('all');
              }}
            >
              {t[key]}
            </button>
          ))}
        </nav>
        <div className="studio-header-tools">
          <label className="studio-toggle">
            <Switch checked={care} onCheckedChange={setCare} />
            <span>{t.care}</span>
          </label>
          {languagePicker}
        </div>
      </header>
      <main className="studio-main">
        <div className="studio-heading">
          <div>
            <span className="studio-eyebrow">AI MADE EASY</span>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>
          <button onClick={() => setHelp(true)}>{t.help}</button>
        </div>
        <div className="studio-toolbar">
          <div className="studio-filters">
            <button
              className={category === 'all' ? 'selected' : ''}
              onClick={() => setCategory('all')}
            >
              {t.all}
            </button>
            {templates.map((x) => (
              <button
                key={x.id}
                className={category === x.id ? 'selected' : ''}
                onClick={() => setCategory(x.id)}
              >
                {x.title}
              </button>
            ))}
          </div>
          {tab !== 'plans' && (
            <label className="studio-search">
              <Search size={18} />
              <input
                aria-label={t.search}
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
        </div>
        {failed ? (
          <div role="alert">
            {t.error}{' '}
            <button onClick={() => setRevision((x) => x + 1)}>{t.retry}</button>
          </div>
        ) : loading ? (
          <p role="status">{t.loading}</p>
        ) : tab === 'plans' ? (
          <>
            <p>{t.oldPlans}</p>
            <div className="studio-grid">
              {plans.map((p) => (
                <article className="studio-card" key={p.id}>
                  <h2>{p.title}</h2>
                  <p className="studio-excerpt">{p.output}</p>
                  <button disabled={busy} onClick={() => openPlan(p)}>
                    {t.update}
                    <ArrowUpRight size={18} />
                  </button>
                </article>
              ))}
            </div>
            {!plans.length && <p>{t.empty}</p>}
          </>
        ) : (
          <div className="studio-grid">
            {filtered.map((item, i) => (
              <article className="studio-card" key={item.id}>
                <div className="studio-card-top">
                  <span
                    className={
                      'studio-icon ' +
                      (item.id === 'custom-animation' ? 'animation' : '')
                    }
                  >
                    {item.id === 'custom-animation' ? (
                      <Clapperboard />
                      ) : item.id==='custom-image'?<ImageIcon/>:item.id==='custom-office'?<FileText/>:item.id==='custom-copy'?<PenLine/>:item.id==='custom-paper-writing'?<GraduationCap/>:<Code2/>}
                  </span>
                  <span className="studio-index">0{i + 1}</span>
                  <button
                    disabled={busy}
                    aria-label={t.favorites + ' · ' + item.title}
                    aria-pressed={favorites.includes(item.id)}
                    onClick={() => favorite(item.id)}
                  >
                    <Star
                      size={20}
                      fill={
                        favorites.includes(item.id) ? 'currentColor' : 'none'
                      }
                    />
                  </button>
                </div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className="studio-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="studio-card-bottom">
                  <span>
                    <Sparkles size={15} />
                    {t.meta}
                  </span>
                  <button className="studio-primary" onClick={() => open(item)}>
                    {t.use}
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </article>
            ))}
            {!filtered.length && <p>{t.empty}</p>}
          </div>
        )}
        <p className="studio-footnote">{t.modeNote}</p>
        <p className="studio-footnote">{t.userData}</p>
      </main>
      {!active && notice && (
        <div className="studio-notice" role="status">
          {notice}
        </div>
      )}
      <Dialog
        open={!!active}
        onOpenChange={(v) => {
          if (!v) setActive(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={'studio-dialog' + (care ? ' studio-care' : '')}
        >
          <DialogHeader>
            <div className="studio-dialog-top">
              <DialogTitle>{active?.title}</DialogTitle>
              <div className="studio-header-tools">
                {languagePicker}
                <button onClick={() => setActive(null)}>{t.close}</button>
              </div>
            </div>
            <DialogDescription>{t.modeNote}</DialogDescription>
          </DialogHeader>
          {active && (
            <div className="studio-builder">
              <section>
                <div className="studio-section-head">
                  <h3>{t.form}</h3>
                  <button title={t.sampleHelp} onClick={example}>
                    {t.sample}
                  </button>
                </div>
                <div className="studio-meta">
                  <label>
                    <Switch
                      checked={meta}
                      onCheckedChange={(v) => {
                        setMeta(v);
                        setEdited(null);
                      }}
                    />
                    {t.meta}
                  </label>
                  <p>{t.metaHelp}</p>
                </div>
                <div className="studio-skill">
                  <div className="studio-options">
                    <button aria-pressed={!skillMode} onClick={()=>{setSkillMode(false);update('skill_id','');}}>{skillText.ordinary}</button>
                    <button aria-pressed={skillMode} onClick={()=>{setSkillMode(true);update('skill_id',skills[0]?.id||'');}}>{skillText.withSkill}</button>
                  </div>
                  {skillMode && <>
                    <p>{skillText.note}</p>
                    {skills.length===0?<p>{skillText.empty}</p>:skills.map(s=><div key={s.id}>
                      <label><input type="radio" name="skill" checked={values.skill_id===s.id} onChange={()=>update('skill_id',s.id)}/> {s.labels[locale]}</label>
                      <p><a href={s.download} download>{skillText.download}</a> · <a href={s.source} target="_blank" rel="noreferrer">{skillText.source}</a> · MIT · {Math.ceil(s.bytes/1024)} KB</p>
                      <details><summary>{skillText.instructions}</summary><p>{s.usage[locale]}</p><p>SHA-256: <code className="studio-hash">{s.sha256}</code></p></details>
                    </div>)}
                  </>}
                </div>
                {question && <div className="studio-question"><strong>{skillText.next}</strong><p>{question.text}</p><button onClick={()=>document.getElementById('field-'+question.key)?.focus()}>{skillText.fill}</button></div>}
                {analysis && (
                  <details className="studio-analysis">
                    <summary>{analysisText.title}</summary>
                    <p>{analysisText.intro}</p>
                    {analysis.candidates.some(c=>c.id!==analysis.current) && <div className="studio-options">
                      <span>{analysisText.task}: </span>
                      {analysis.candidates.filter(c=>c.id!==analysis.current).map(c=><button key={c.id}
                        disabled={!!locks[taskKey(active)]}
                        title={analysisText.evidence+': '+c.evidence.join(', ')}
                        onClick={()=>update(taskKey(active),c.label)}>{analysisText.apply} {c.label}</button>)}
                    </div>}
                    {analysis.scenarios.length ? <>
                      {analysis.scenarios.map(s=><div key={s.id}><strong>{s.labels[locale]}</strong><p>{analysisText.evidence}: {s.evidence.join(' / ')}</p><p>{s.details[locale]}</p>{s.source && <a href={s.source.url} target="_blank" rel="noreferrer">Prompts.chat · {s.source.title} · CC0</a>}</div>)}
                      {meta && <p>{analysisText.details}</p>}
                    </> : <p>{analysisText.empty}</p>}
                    {!!analysis.missing.length && <details><summary>{analysisText.missing}</summary>
                      {analysis.missing.map(key=><p key={key}><strong>{fields.find(f=>f.key===key)?.label}: </strong>{fields.find(f=>f.key===key)?.placeholder}</p>)}
                    </details>}
                  </details>
                )}
                {fields.map((f) => (
                  <div className="studio-field" key={f.key}>
                    <div className="studio-field-head">
                      <label htmlFor={'field-' + f.key}>
                        {f.label}
                        <small>
                          {f.required ? t.requiredLabel : t.optional}
                        </small>
                      </label>
                      <button
                        aria-label={
                          (locks[f.key] ? t.unlock : t.lock) + ' ' + f.label
                        }
                        aria-pressed={!!locks[f.key]}
                        onClick={() =>
                          setLocks((v) => ({ ...v, [f.key]: !v[f.key] }))
                        }
                      >
                        {locks[f.key] ? (
                          <LockKeyhole size={17} />
                        ) : (
                          <LockKeyholeOpen size={17} />
                        )}
                      </button>
                    </div>
                    {f.type === 'textarea' ? (
                      <textarea
                        id={'field-' + f.key}
                        placeholder={f.placeholder}
                        required={f.required}
                        maxLength={12000}
                        disabled={!!locks[f.key]}
                        rows={f.key === 'subject' ? 4 : 2}
                        value={String(values[f.key] || '')}
                        onChange={(e) => update(f.key, e.target.value)}
                      />
                    ) : (f.key === 'scenario' || f.key === 'tool') ? (
                      <select id={'field-'+f.key} disabled={!!locks[f.key]} value={String(values[f.key] || f.options[0])} onChange={e=>update(f.key,e.target.value)}>
                        {!f.options.includes(String(values[f.key] || f.options[0])) && <option value={String(values[f.key])}>{String(values[f.key])} ({locale==='zh'?'当前任务不适用':locale==='ja'?'現在のタスク対象外':'not applicable to this task'})</option>}
                        {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'text' ? (
                      <input
                        id={'field-' + f.key}
                        placeholder={f.placeholder}
                        maxLength={200}
                        disabled={!!locks[f.key]}
                        value={String(values[f.key] || '')}
                        onChange={(e) => update(f.key, e.target.value)}
                      />
                    ) : null}
                    {f.key==='tool' && <p className="studio-tool-help">{toolAdapter(active,values).guidance[locale]}</p>}
                    {f.key!=='tool' && f.key!=='scenario' && <div className="studio-options">
                      {[
                        ...new Set([
                          ...getOptions(f, values),
                          ...(Array.isArray(values[f.key])
                            ? (values[f.key] as string[])
                            : []),
                        ]),
                      ].map((w) => (
                        <button
                          disabled={!!locks[f.key]}
                          key={w}
                          aria-pressed={
                            Array.isArray(values[f.key])
                              ? (values[f.key] as string[]).includes(w)
                              : values[f.key] === w
                          }
                          onClick={() => word(f, w)}
                        >
                          {w}
                        </button>
                      ))}
                    </div>}
                    {f.type === 'multi' && (
                      <div className="studio-add">
                        <input
                          id={'field-' + f.key}
                          aria-label={t.word}
                          placeholder={t.word}
                          maxLength={40}
                          disabled={!!locks[f.key]}
                          value={custom[f.key] || ''}
                          onChange={(e) =>
                            setCustom((v) => ({
                              ...v,
                              [f.key]: e.target.value,
                            }))
                          }
                        />
                        <button
                          disabled={!!locks[f.key]}
                          onClick={() => {
                            const value = custom[f.key]?.trim();
                            if (value) {
                              word(f, value);
                              setCustom((v) => ({ ...v, [f.key]: '' }));
                            }
                          }}
                        >
                          {t.add}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="studio-actions">
                  <button
                    onClick={() => {
                      setValues(refreshValues({...active, fields}, values, {...locks,task:true,medium:true,scenario:true,tool:true}));
                      setEdited(null);
                    }}
                  >
                    <RefreshCw size={16} />
                    {t.refresh}
                  </button>

                </div>
              </section>
              <section className="studio-preview">
                <h3>{t.preview}</h3>
                <p>{t.previewHelp}</p>
                <textarea
                  aria-label={t.preview}
                  className="studio-output"
                  maxLength={20000}
                  value={output}
                  onChange={(e) => setEdited(e.target.value)}
                />
                {edited !== null && (
                  <button title={t.resetHelp} onClick={() => setEdited(null)}>
                    {t.reset}
                  </button>
                )}
                <label className="studio-field">
                  {t.titleLabel}
                  <input
                    value={title}
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <div className="studio-actions">
                  <button className="studio-primary" onClick={copy}>
                    <Copy size={16} />
                    {t.copy}
                  </button>
                  <button
                    disabled={busy || output.length > 20000}
                    onClick={save}
                  >
                    <Save size={16} />
                    {planId ? t.update : t.save}
                  </button>
                  <button onClick={download}>
                    <Download size={16} />
                    {t.download}
                  </button>
                </div>
                {notice && (
                  <p role="status" className="studio-inline-notice">
                    {notice}
                  </p>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t.help}</DialogTitle>
            <DialogDescription>{t.helpText}</DialogDescription>
          </DialogHeader>
          <button onClick={() => setHelp(false)}>{t.close}</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
