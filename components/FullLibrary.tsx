'use client';
import { useEffect, useState } from 'react';
import type { Template } from '@/lib/prompt';
import type { Locale } from '@/lib/studio';
import { categoryNames } from '@/lib/categories';
import { ui } from '@/lib/studio-ui';
type Result = { items: Template[]; total: number; pageSize: number };
export default function FullLibrary({
  locale,
  favoritesOnly,
  onOpen,
}: {
  locale: Locale;
  favoritesOnly: boolean;
  onOpen: (t: Template) => void;
}) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState(''),
    [page, setPage] = useState(1),
    [data, setData] = useState<Result | null>(null),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  const t = ui[locale],
    labels = {
      zh: {
        note: '完整资料库包含原创模板与 AI Short 提示词，资料保留原文。需要三语辅助填写，请使用模板广场。',
        previous: '上一页',
        next: '下一页',
        count: '条结果',
      },
      en: {
        note: 'Browse original templates and AI Short prompts in their source language. Use the template library for guided Chinese, English and Japanese forms.',
        previous: 'Previous',
        next: 'Next',
        count: 'results',
      },
      ja: {
        note: 'オリジナルテンプレートとAI Shortを原文で閲覧できます。中英日の入力補助はテンプレート広場をご利用ください。',
        previous: '前へ',
        next: '次へ',
        count: '件',
      },
    }[locale];
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setData(null);
      setError(false);
      const p = new URLSearchParams({ q: query, category, page: String(page) });
      if (favoritesOnly) p.set('favorites', '1');
      fetch('/api/catalog?' + p, { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json() as Promise<Result>;
        })
        .then(setData)
        .catch((e) => {
          if (e.name !== 'AbortError') setError(true);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category, page, favoritesOnly, retry]);
  async function open(id: string) {
    setBusy(true);
    try {
      const r = await fetch('/api/templates/' + encodeURIComponent(id));
      if (!r.ok) throw Error();
      onOpen(await r.json());
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="full-library">
      <p>{labels.note}</p>
      <div className="catalog-controls">
        <input
          aria-label={t.search}
          placeholder={t.search}
          value={query}
          maxLength={150}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label={t.all}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t.all}</option>
          {Object.entries(categoryNames[locale]).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p role="alert">
          {t.error}{' '}
          <button onClick={() => setRetry((x) => x + 1)}>{t.retry}</button>
        </p>
      ) : !data ? (
        <output>{t.loading}</output>
      ) : (
        <>
          <p aria-live="polite">
            {data.total} {labels.count}
          </p>
          <div className="catalog-list">
            {data.items.map((item) => (
              <article key={item.id}>
                <div>
                  <span className="catalog-category">
                    {categoryNames[locale][item.categoryId]}
                  </span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <small>
                    {item.sourceId === 'aishort'
                      ? 'AI Short · MIT'
                      : 'AI Made Easy'}
                  </small>
                </div>
                <button disabled={busy} onClick={() => open(item.id)}>
                  {t.use}
                </button>
              </article>
            ))}
          </div>
          {!data.items.length && <p>{t.empty}</p>}
          <div className="catalog-pages">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              {labels.previous}
            </button>
            <span>
              {page} / {Math.max(1, Math.ceil(data.total / data.pageSize))}
            </span>
            <button
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              {labels.next}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
