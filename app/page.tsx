'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Search,
  Star,
  Copy,
  Check,
  ArrowUpRight,
  ArrowRight,
  Code2,
  PenLine,
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  Lightbulb,
  X,
  BookOpen,
  SlidersHorizontal,
  LockKeyhole,
  LockKeyholeOpen,
  RefreshCw,
  Save,
  Download,
  FolderOpen,
  Database,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  defaultValues,
  compose,
  getOptions,
  refreshValues,
  validateValues,
  type Template,
  type Values,
  type Locks,
  type Category,
  type Plan,
  type Field,
} from '@/lib/prompt';
type Card = Pick<
  Template,
  'id' | 'title' | 'description' | 'categoryId' | 'kind' | 'tags' | 'content'
>;
type Catalog = {
  items: Card[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  favorites: string[];
  totals: { kind: string; count: number }[];
};
const moduleIcons: Record<string, typeof Code2> = {
  programming: Code2,
  writing: PenLine,
  office: BriefcaseBusiness,
  marketing: Lightbulb,
  study: GraduationCap,
  language: Languages,
  life: Heart,
  creative: Sparkles,
  business: SlidersHorizontal,
  thinking: BookOpen,
};
async function request<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, {
    ...(body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  const value = (await r.json()) as T & { error?: string };
  if (!r.ok) throw Error(value.error || '操作失败，请重试');
  return value;
}
export default function Home() {
  const [catalog, setCatalog] = useState<Catalog | null>(null),
    [category, setCategory] = useState(''),
    [kind, setKind] = useState('all'),
    [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [page, setPage] = useState(1),
    [tab, setTab] = useState('library'),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [refresh, setRefresh] = useState(0),
    [care, setCare] = useState(false),
    [help, setHelp] = useState(false),
    [aiInfo, setAiInfo] = useState(false),
    [plans, setPlans] = useState<Plan[]>([]);
  const [active, setActive] = useState<Template | null>(null),
    [values, setValues] = useState<Values>({}),
    [locks, setLocks] = useState<Locks>({}),
    [edited, setEdited] = useState<string | null>(null),
    [planId, setPlanId] = useState<string | undefined>(),
    [planTitle, setPlanTitle] = useState(''),
    [busy, setBusy] = useState(false),
    [favoriteBusy, setFavoriteBusy] = useState(''),
    [custom, setCustom] = useState<Record<string, string>>({}),
    [language, setLanguage] = useState('original');
  const detailRequest = useRef(0);
  const output = active
    ? (edited ??
      (language === 'translation' && active.translation
        ? active.translation
        : compose(active, values)))
    : '';
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError('');
    if (tab === 'plans') {
      request<{ plans: Plan[] }>('/api/plans')
        .then((v) => {
          if (live) setPlans(v.plans);
        })
        .catch((e) => {
          if (live) setError(e.message);
        })
        .finally(() => {
          if (live) setLoading(false);
        });
      return () => {
        live = false;
      };
    }
    const params = new URLSearchParams({
      q: query,
      category,
      kind,
      page: String(page),
      favorites: tab === 'favorites' ? '1' : '0',
    });
    request<Catalog>('/api/catalog?' + params)
      .then((v) => {
        if (live) setCatalog(v);
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [query, category, kind, page, tab, refresh]);
  function navigate(next: string) {
    setTab(next);
    setPage(1);
    setSearch('');
    setQuery('');
    setCategory('');
    setKind('all');
    setError('');
  }
  async function open(id: string, plan?: Plan) {
    const sequence = ++detailRequest.current;
    setBusy(true);
    try {
      const item = await request<Template>(
        '/api/templates/' + encodeURIComponent(id),
      );
      if (sequence !== detailRequest.current) return;
      setActive(item);
      setValues(plan?.values ?? defaultValues(item));
      setLocks(plan?.locks ?? {});
      setEdited(plan?.output ?? null);
      setPlanId(plan?.id);
      setPlanTitle(plan?.title ?? item.title);
      setCustom({});
      setLanguage('original');
      setNotice('');
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      if (sequence === detailRequest.current) setBusy(false);
    }
  }
  async function favorite(id: string) {
    if (favoriteBusy) return;
    const saved = !catalog?.favorites.includes(id);
    setFavoriteBusy(id);
    try {
      await request('/api/favorites', { templateId: id, saved });
      setRefresh((v) => v + 1);
      setNotice(saved ? '已保存收藏。' : '已取消收藏。');
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setFavoriteBusy('');
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice('已复制。粘贴到你使用的 AI 工具即可。');
    } catch {
      setNotice('浏览器不允许自动复制，请在详情中选择文字后手动复制。');
    }
  }
  async function copyCard(id: string) {
    setBusy(true);
    try {
      const item = await request<Template>(
        '/api/templates/' + encodeURIComponent(id),
      );
      await copy(item.content);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function update(key: string, value: string | string[]) {
    if (locks[key]) return;
    setValues((v) => ({ ...v, [key]: value }));
    setEdited(null);
  }
  function toggle(f: Field, word: string) {
    if (locks[f.key]) return;
    const current = Array.isArray(values[f.key])
      ? (values[f.key] as string[])
      : [];
    if (current.includes(word))
      update(
        f.key,
        current.filter((v) => v !== word),
      );
    else if (current.length < f.maxSelections)
      update(f.key, [...current, word]);
    else setNotice(`最多选择 ${f.maxSelections} 项，请先取消一项。`);
  }
  function addWord(f: Field) {
    const word = (custom[f.key] || '').trim();
    if (!word) return;
    if (word.length > 40) {
      setNotice('词条最多40字。');
      return;
    }
    if (f.type === 'multi') {
      const selected = (values[f.key] as string[]) || [];
      if (selected.includes(word)) {
        setCustom((c) => ({ ...c, [f.key]: '' }));
        return;
      }
      if (selected.length >= f.maxSelections) {
        setNotice(`最多选择${f.maxSelections}项。`);
        return;
      }
      toggle(f, word);
    } else update(f.key, word);
    setCustom((c) => ({ ...c, [f.key]: '' }));
  }
  function detect() {
    if (!active) return;
    const text = String(values.subject || '');
    if (!text.trim()) {
      setNotice('先填写需求，再提取已知词条。');
      return;
    }
    let found = 0;
    const next = { ...values };
    for (const f of active.fields) {
      if (locks[f.key]) continue;
      const matches = getOptions(f, values).filter((word) =>
        text.toLowerCase().includes(word.toLowerCase()),
      );
      if (matches.length) {
        next[f.key] =
          f.type === 'multi' ? matches.slice(0, f.maxSelections) : matches[0];
        found += matches.length;
      }
    }
    setValues(next);
    setEdited(null);
    setNotice(
      found
        ? `匹配到${found}个已知词条，已填入未锁定的字段。`
        : '暂未匹配到已知词条。可直接点击推荐词或自行填写。',
    );
  }
  async function save() {
    if (!active || busy) return;
    const errors = validateValues(active, values);
    if (errors.length) {
      setNotice(errors[0]);
      return;
    }
    setBusy(true);
    try {
      const result = await request<{ id: string }>('/api/plans', {
        id: planId,
        templateId: active.id,
        title: planTitle.trim() || active.title,
        values,
        locks,
        output,
      });
      setPlanId(result.id);
      setNotice('方案已保存到数据库，可在“我的方案”继续修改。');
      setRefresh((v) => v + 1);
    } catch (e) {
      setNotice((e as Error).message);
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
    a.download = 'AI-Made-Easy-prompt.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const totalCount = catalog?.totals.reduce((n, t) => n + t.count, 0) || 0;
  const pageCount = Math.max(1, Math.ceil((catalog?.total || 0) / 18));
  return (
    <div className={care ? 'app care' : 'app'}>
      <header className="header">
        <div className="header-inner">
          <a className="brand" href="#" onClick={() => navigate('library')}>
            <span className="brand-mark">
              <Sparkles size={21} />
            </span>
            AI Made Easy
          </a>
          <nav>
            <button
              className={'nav ' + (tab === 'library' ? 'active' : '')}
              onClick={() => navigate('library')}
            >
              模板广场
            </button>
            <button
              className={'nav ' + (tab === 'favorites' ? 'active' : '')}
              onClick={() => navigate('favorites')}
            >
              我的收藏<span>{catalog?.favorites.length || 0}</span>
            </button>
            <button
              className={'nav ' + (tab === 'plans' ? 'active' : '')}
              onClick={() => navigate('plans')}
            >
              我的方案
            </button>
          </nav>
          <label className="care-toggle">
            <Heart size={15} />
            <span>关怀模式</span>
            <Switch
              checked={care}
              onCheckedChange={setCare}
              aria-label="关怀模式，大字显示"
            />
          </label>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> BASIC MODE · 无需调用 AI
            </div>
            <h1>
              让每一个想法，<span>更容易开始。</span>
            </h1>
            <p>搜索模板，填入需求。选好关键词，把清晰的提示词带走。</p>
          </div>
          <div className="mode-tools">
            <span className="basic-mode">
              <Check size={15} />
              基础模式
            </span>
            <button onClick={() => setAiInfo(true)}>
              <Sparkles size={15} />
              AI 进阶模式<span>待接入</span>
            </button>
          </div>
        </section>
        {tab !== 'plans' && (
          <section className="explorer">
            <div className="search-line">
              <div className="search">
                <Search size={20} />
                <input
                  aria-label="搜索模板"
                  placeholder="想完成什么？试试：代码、产品介绍、日语…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button aria-label="清空搜索" onClick={() => setSearch('')}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="library-count">
                <b>{totalCount || '—'}</b>
                <span>条提示词</span>
              </div>
            </div>
            <div className="categories">
              <button
                className={'category ' + (!category ? 'selected' : '')}
                onClick={() => {
                  setCategory('');
                  setPage(1);
                }}
              >
                <SlidersHorizontal size={16} />
                全部模块
              </button>
              {catalog?.categories.map((c) => {
                const Icon = moduleIcons[c.id] || BookOpen;
                return (
                  <button
                    className={
                      'category ' + (category === c.id ? 'selected' : '')
                    }
                    key={c.id}
                    onClick={() => {
                      setCategory(c.id);
                      setPage(1);
                    }}
                    aria-pressed={category === c.id}
                  >
                    <Icon size={16} />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        <div className="results-head">
          <h2>
            {tab === 'plans'
              ? '我的方案'
              : tab === 'favorites'
                ? '我的收藏'
                : category
                  ? catalog?.categories.find((c) => c.id === category)?.name
                  : '找到适合你的起点'}
            <span>
              {tab === 'plans' ? plans.length : catalog?.total || 0} 个结果
            </span>
          </h2>
          <div className="results-tools">
            {tab !== 'plans' && (
              <Select
                value={kind}
                onValueChange={(v) => {
                  setKind(v || 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger aria-label="内容来源">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  <SelectItem value="custom">
                    可填写模板 ·{' '}
                    {catalog?.totals.find((t) => t.kind === 'custom')?.count ||
                      0}
                  </SelectItem>
                  <SelectItem value="imported">
                    AI Short 原文 ·{' '}
                    {catalog?.totals.find((t) => t.kind === 'imported')
                      ?.count || 0}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <button className="text-button" onClick={() => setHelp(true)}>
              <BookOpen size={14} />
              使用说明
            </button>
          </div>
        </div>
        {error ? (
          <div className="empty" role="alert">
            <Database size={28} />
            <p>{error}</p>
            <button onClick={() => setRefresh((v) => v + 1)}>重新加载</button>
          </div>
        ) : loading ? (
          <div className="loading-state" role="status">
            正在读取模板库…
          </div>
        ) : tab === 'plans' ? (
          <>
            <p className="plan-note">
              方案保存在数据库中，当前通过浏览器访客身份识别。清除 Cookie
              后无法自动找回，请导出重要内容。
            </p>
            <section className="cards">
              {plans.map((p) => (
                <article className="card plan-card" key={p.id}>
                  <span className="card-icon">
                    <FolderOpen size={20} />
                  </span>
                  <h2>{p.title}</h2>
                  <p>{new Date(p.updatedAt).toLocaleString('zh-CN')}</p>
                  <div className="excerpt">{p.output}</div>
                  <div className="card-bottom">
                    <button
                      className="details"
                      onClick={() => open(p.templateId, p)}
                    >
                      继续修改
                      <ArrowRight size={14} />
                    </button>
                    <button className="copy" onClick={() => copy(p.output)}>
                      <Copy size={14} />
                      复制
                    </button>
                  </div>
                </article>
              ))}
            </section>
            {!plans.length && (
              <div className="empty">
                <FolderOpen size={30} />
                <h2>还没有保存的方案</h2>
                <p>打开模板，填写需求后点击“保存方案”。</p>
                <button onClick={() => navigate('library')}>
                  浏览模板
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <section className="cards">
              {catalog?.items.map((p) => {
                const Icon = moduleIcons[p.categoryId] || BookOpen;
                return (
                  <article className="card" key={p.id}>
                    <div className="card-top">
                      <span
                        className={
                          'card-icon ' +
                          (p.kind === 'custom' ? 'custom-icon' : '')
                        }
                      >
                        <Icon size={20} />
                      </span>
                      <span className="card-category">
                        {
                          catalog.categories.find((c) => c.id === p.categoryId)
                            ?.name
                        }
                      </span>
                      <button
                        className={
                          'star ' +
                          (catalog.favorites.includes(p.id) ? 'saved' : '')
                        }
                        aria-label={
                          (catalog.favorites.includes(p.id)
                            ? '取消收藏'
                            : '收藏') + p.title
                        }
                        aria-pressed={catalog.favorites.includes(p.id)}
                        disabled={!!favoriteBusy}
                        onClick={() => favorite(p.id)}
                      >
                        <Star
                          size={18}
                          fill={
                            catalog.favorites.includes(p.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    </div>
                    <button
                      className="card-title"
                      disabled={busy}
                      onClick={() => open(p.id)}
                    >
                      {p.title}
                      <ArrowUpRight size={16} />
                    </button>
                    <p className="description">{p.description}</p>
                    <div className="tags">
                      {p.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearch(tag);
                            setCategory('');
                            setPage(1);
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <button className="excerpt" onClick={() => open(p.id)}>
                      {p.content}
                    </button>
                    <div className="card-bottom">
                      <span
                        className={
                          'source-badge ' +
                          (p.kind === 'custom' ? 'original' : '')
                        }
                      >
                        {p.kind === 'custom' ? '可填写模板' : 'AI Short 原文'}
                      </span>
                      <button
                        className="copy"
                        disabled={busy}
                        onClick={() =>
                          p.kind === 'custom' ? open(p.id) : copyCard(p.id)
                        }
                      >
                        {p.kind === 'custom' ? (
                          <PenLine size={14} />
                        ) : (
                          <Copy size={14} />
                        )}{' '}
                        {p.kind === 'custom' ? '填写需求' : '复制提示词'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
            {!catalog?.items.length && (
              <div className="empty">
                <Search size={30} />
                <h2>没有匹配的内容</h2>
                <p>换个关键词、模块或来源再试试。</p>
                <button onClick={() => navigate('library')}>查看全部</button>
              </div>
            )}
            {pageCount > 1 && (
              <Pagination className="pagination">
                <PaginationContent>
                  <PaginationItem>
                    <button
                      aria-label="上一页"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </PaginationItem>
                  {Array.from(
                    { length: Math.min(5, pageCount) },
                    (_, i) =>
                      Math.min(
                        Math.max(1, page - 2),
                        Math.max(1, pageCount - 4),
                      ) + i,
                  ).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <button
                      aria-label="下一页"
                      disabled={page >= pageCount}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
        <footer>
          <div>
            <Sparkles size={15} />
            AI Made Easy<span>基础模式 · 不调用 AI</span>
          </div>
          <p>
            部分内容来自{' '}
            <a
              href="https://github.com/rockbenben/ChatGPT-Shortcut"
              target="_blank"
              rel="noreferrer"
            >
              AI Short
            </a>{' '}
            · MIT ·{' '}
            <button onClick={() => setHelp(true)}>数据与使用说明</button>
          </p>
        </footer>
      </main>
      <Dialog
        open={!!active}
        onOpenChange={(v) => {
          if (!v) {
            detailRequest.current++;
            setActive(null);
          }
        }}
      >
        <DialogContent className={'builder-dialog ' + (care ? 'care' : '')}>
          <DialogHeader>
            <span className="detail-category">
              {active?.kind === 'custom'
                ? '基础模式 / 可填写模板'
                : 'AI Short / 导入原文'}
            </span>
            <DialogTitle>{active?.title}</DialogTitle>
            <DialogDescription>{active?.description}</DialogDescription>
          </DialogHeader>
          {active && (
            <div
              className={
                'builder-grid ' + (active.fields.length ? '' : 'text-only')
              }
            >
              {active.fields.length > 0 && (
                <section className="builder-form">
                  <div className="builder-section-title">
                    <h3>填写需求</h3>
                    <button className="text-button" onClick={detect}>
                      <Lightbulb size={14} />
                      匹配关键词
                    </button>
                  </div>
                  {active.fields.map((f) => (
                    <div className="form-field" key={f.key}>
                      <div className="field-head">
                        <label htmlFor={'field-' + f.key}>
                          {f.label}
                          {f.required && <em>*</em>}
                        </label>
                        <button
                          className={locks[f.key] ? 'lock locked' : 'lock'}
                          aria-label={
                            (locks[f.key] ? '解锁' : '锁定') + f.label
                          }
                          aria-pressed={!!locks[f.key]}
                          onClick={() =>
                            setLocks((l) => ({ ...l, [f.key]: !l[f.key] }))
                          }
                        >
                          {locks[f.key] ? (
                            <LockKeyhole size={14} />
                          ) : (
                            <LockKeyholeOpen size={14} />
                          )}{' '}
                          {locks[f.key] ? '已锁定' : '锁定'}
                        </button>
                      </div>
                      {f.type === 'textarea' ? (
                        <textarea
                          id={'field-' + f.key}
                          maxLength={12000}
                          disabled={!!locks[f.key]}
                          placeholder={'请输入' + f.label}
                          value={String(values[f.key] || '')}
                          onChange={(e) => update(f.key, e.target.value)}
                        />
                      ) : f.type === 'text' ? (
                        <input
                          id={'field-' + f.key}
                          maxLength={200}
                          disabled={!!locks[f.key]}
                          value={String(values[f.key] || '')}
                          onChange={(e) => update(f.key, e.target.value)}
                        />
                      ) : (
                        <p className="field-hint">
                          最多 {f.maxSelections} 项 · 点击词条可添加或取消
                        </p>
                      )}
                      {(f.options.length > 0 || f.type === 'multi') && (
                        <div className="word-options">
                          {Array.from(
                            new Set([
                              ...(f.type === 'multi' &&
                              Array.isArray(values[f.key])
                                ? (values[f.key] as string[])
                                : []),
                              ...getOptions(f, values),
                            ]),
                          ).map((word) => {
                            const selected =
                              f.type === 'multi'
                                ? ((values[f.key] as string[]) || []).includes(
                                    word,
                                  )
                                : values[f.key] === word;
                            return (
                              <button
                                key={word}
                                className={selected ? 'word selected' : 'word'}
                                disabled={!!locks[f.key]}
                                aria-pressed={selected}
                                onClick={() =>
                                  f.type === 'multi'
                                    ? toggle(f, word)
                                    : update(f.key, word)
                                }
                              >
                                {selected && <Check size={12} />} {word}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {f.type === 'multi' && (
                        <div className="custom-word">
                          <input
                            aria-label="自定义关键词"
                            maxLength={40}
                            disabled={!!locks[f.key]}
                            placeholder="添加自定义词条"
                            value={custom[f.key] || ''}
                            onChange={(e) =>
                              setCustom((c) => ({
                                ...c,
                                [f.key]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addWord(f);
                            }}
                          />
                          <button
                            aria-label="添加词条"
                            disabled={!!locks[f.key]}
                            onClick={() => addWord(f)}
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    className="refresh-words"
                    onClick={() => {
                      setValues(refreshValues(active, values, locks));
                      setEdited(null);
                      setNotice('已更新未锁定的推荐字段；自由填写内容保留。');
                    }}
                  >
                    <RefreshCw size={15} />
                    换一组推荐词
                  </button>
                  <p className="field-hint">
                    锁定的字段保持不变。关键词匹配基于词库规则。
                  </p>
                </section>
              )}
              <section className="builder-output">
                <div className="builder-section-title">
                  <h3>完整提示词</h3>
                  <span>{edited === null ? '实时生成' : '手动编辑'}</span>
                </div>
                {active.translation && (
                  <div className="translation-choice">
                    <button
                      className={language === 'original' ? 'selected' : ''}
                      onClick={() => {
                        setLanguage('original');
                        setEdited(null);
                      }}
                    >
                      原始提示词
                    </button>
                    <button
                      className={language === 'translation' ? 'selected' : ''}
                      onClick={() => {
                        setLanguage('translation');
                        setEdited(null);
                      }}
                    >
                      中文释义
                    </button>
                  </div>
                )}
                <textarea
                  aria-label="完整提示词"
                  className="prompt-output"
                  maxLength={20000}
                  value={output}
                  onChange={(e) => setEdited(e.target.value)}
                />
                <div className="output-meta">
                  <span>{output.length} 字符</span>
                  <button onClick={() => setEdited(null)}>恢复自动内容</button>
                </div>
                <p className="field-hint">
                  可直接编辑。修改左侧字段或切换语言会重新生成，覆盖手动编辑。
                </p>
                <label className="save-label" htmlFor="plan-title">
                  方案名称
                </label>
                <input
                  id="plan-title"
                  className="plan-title-input"
                  maxLength={100}
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                />
                <div className="output-actions">
                  <button
                    className="primary"
                    onClick={() => {
                      const errors = validateValues(active, values);
                      errors.length ? setNotice(errors[0]) : copy(output);
                    }}
                  >
                    <Copy size={15} />
                    复制提示词
                  </button>
                  <button className="secondary" disabled={busy} onClick={save}>
                    <Save size={15} />
                    {planId ? '更新方案' : '保存方案'}
                  </button>
                  <button
                    className="secondary"
                    aria-label="导出提示词"
                    onClick={download}
                  >
                    <Download size={16} />
                  </button>
                </div>
                {active.kind === 'imported' && (
                  <p className="source-note">
                    来源：AI Short，原编号 {active.sourceRecordId}，许可 MIT。
                    {active.sourceUrl &&
                      /^https?:\/\//.test(active.sourceUrl) && (
                        <a
                          href={active.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          查看上游引用 <ArrowUpRight size={12} />
                        </a>
                      )}
                  </p>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>让 AI 更容易使用</DialogTitle>
            <DialogDescription>
              搜索 → 填写 → 锁定与调整 → 复制或保存
            </DialogDescription>
          </DialogHeader>
          <div className="help-steps">
            <p>
              <b>基础模式</b>搜索数据库并按模板拼装内容，不需要模型或 API
              Key。推荐词基于固定词库和条件关联。
            </p>
            <p>
              <b>保存方案</b>
              填写内容、锁定状态和最终提示词一起保存在数据库。当前使用访客
              Cookie 识别，尚未提供跨设备登录。
            </p>
            <p>
              <b>内容来源</b>本次导入 AI Short 公开仓库的 279
              条简体中文精选记录，保留原文、中文释义、原编号及来源；不含在线社区或用户私有数据。另有
              10 个模块、每模块 3 个原创可填写模板。
            </p>
            <p>
              <b>关怀模式</b>
              启用大字与更宽松间距，方便阅读。专业领域的原始提示词保持上游内容，不代表内容经过专业验证。
            </p>
            <a
              href="https://github.com/rockbenben/ChatGPT-Shortcut/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
            >
              查看 AI Short MIT 许可 ↗
            </a>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={aiInfo} onOpenChange={setAiInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI 进阶模式，留给下一步</DialogTitle>
            <DialogDescription>
              按当前版本规划，尚未接入 OpenAI。
            </DialogDescription>
          </DialogHeader>
          <div className="help-steps">
            <p>
              后续可接入智能推荐、提示词优化和直接运行。目前只使用数据库与规则，不发送你的填写内容给模型，也不产生模型费用。
            </p>
            <p>基础模式已经可以完成模板搜索、填写、词条锁定与方案保存。</p>
          </div>
          <button className="primary" onClick={() => setAiInfo(false)}>
            继续使用基础模式
          </button>
        </DialogContent>
      </Dialog>
      {notice && (
        <div className="notice" role="status">
          <Check size={16} />
          {notice}
          <button aria-label="关闭提示" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
