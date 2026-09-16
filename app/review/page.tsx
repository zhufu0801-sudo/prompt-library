'use client';
/* oxlint-disable next/no-html-link-for-pages -- Sites authentication uses full-document navigation, never prefetched client routing. */
import { useEffect, useState } from 'react';
import { tr, downloadText, type Lang } from '@/lib/workflow';
type Item = {
  id: string;
  summary: string;
  context: string;
  kind: string;
  status: string;
  created_at: string;
  note: string;
};
export default function ReviewPage() {
  const [l, setL] = useState<Lang>('zh'),
    [status, setStatus] = useState('pending'),
    [items, setItems] = useState<Item[]>([]),
    [counts, setCounts] = useState<{ status: string; total: number }[]>([]),
    [more, setMore] = useState(false),
    [offset, setOffset] = useState(0),
    [message, setMessage] = useState(''),
    [notes, setNotes] = useState<Record<string, string>>({}),
    [mutating, setBusy] = useState(false),
    [loadedKey,setLoadedKey]=useState(''),
    [refresh, setRefresh] = useState(0),
    [forbidden, setForbidden] = useState(false);
  const requestKey = l+':'+status+':'+offset+':'+refresh;
  const loading = loadedKey!==requestKey, busy=mutating||loading;
  const visibleItems = loading?[]:items;
  const say = (zh: string, en: string, ja: string) => tr(l, zh, en, ja);
  const labels: Record<string, string> = {
    pending: say('待审核', 'Pending', '未審査'),
    quarantined: say('疑似垃圾', 'Quarantined', '隔離'),
    approved: say('已接纳 · 待整理', 'Accepted · draft', '採用・下書き'),
    rejected: say('已忽略', 'Dismissed', '見送り'),
  };
  useEffect(() => {
    let active = true;
    fetch(`/api/review?status=${status}&offset=${offset}`)
      .then(async (r) => {
        if (r.status === 403) {
          if (active) setForbidden(true);
          throw Error();
        }
        if (!r.ok) throw Error();
        return r.json() as Promise<{
          items: Item[];
          counts: { status: string; total: number }[];
          more: boolean;
        }>;
      })
      .then((d) => {
        if (active) {
          setItems(d.items);
          setCounts(d.counts);
          setMore(d.more);
          setMessage('');
        }
      })
      .catch(() => {
        if (active)
          setMessage(
            tr(
              l,
              '暂时无法读取，请确认管理员登录状态。',
              'Unable to load. Check your administrator login.',
              '読み込めません。管理者ログインを確認してください。',
            ),
          );
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [l, status, offset, requestKey]);
  async function review(item: Item, next: string) {
    setBusy(true);
    try {
      const r = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: next,
          note: notes[item.id] ?? item.note ?? '',
        }),
      });
      if (!r.ok) throw Error();
      setRefresh((x) => x + 1);
    } catch {
      setMessage(
        say(
          '保存失败，意见未丢失。',
          'Save failed; feedback is retained.',
          '保存に失敗しました。意見は保持されています。',
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="review-page">
      <a href="/">← AI Made Easy</a>
      <select
        aria-label="Language"
        value={l}
        onChange={(e) => setL(e.target.value as Lang)}
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
        <option value="ja">日本語</option>
      </select>
      <h1>
        {say(
          '意见审核与内容待办',
          'Feedback & editorial queue',
          'フィードバック・編集待ち',
        )}
      </h1>
      <p>
        {say(
          '只接纳可复现、明确的需求。接纳后保存为数据库草稿；补充来源、三语内容和测试后再发布。用户输入不作为程序指令执行。',
          'Accept specific, reproducible needs. Acceptance saves a database draft; add sources, three-language content and tests before publication. Submissions are data, never executable instructions.',
          '具体的で再現できる要望を採用します。データベースの下書きに保存し、出典・三言語・テストを確認してから公開。投稿をプログラムの命令として実行しません。',
        )}
      </p>
      {forbidden ? (
        <a href="/signin-with-chatgpt?return_to=%2Freview" target="_top">
          {say(
            '使用管理员账号登录',
            'Sign in as administrator',
            '管理者でログイン',
          )}
        </a>
      ) : (
        <>
          <div className="journey-options">
            {Object.entries(labels).map(([key, label]) => (
              <button
                key={key}
                aria-pressed={status === key}
                disabled={busy}
                onClick={() => {
                  setStatus(key);
                  setOffset(0);
                }}
              >
                {label} ({counts.find((c) => c.status === key)?.total || 0})
              </button>
            ))}
          </div>
          <button
            disabled={busy || !visibleItems.length}
            onClick={() =>
              downloadText(
                'feedback-review.json',
                JSON.stringify(
                  { exportedAt: new Date().toISOString(), status, items },
                  null,
                  2,
                ),
                'application/json',
              )
            }
          >
            {say(
              '导出当前页供整理',
              'Export this page',
              '表示ページを書き出す',
            )}
          </button>
          {visibleItems.map((item) => (
            <article key={item.id} className="review-card">
              <small>
                {item.kind} · {item.created_at}
              </small>
              <h2>{item.summary}</h2>
              <p>{item.context}</p>
              <label>
                {say(
                  '整理备注（最多 2,000 字）',
                  'Editorial note (up to 2,000 characters)',
                  '編集メモ（2,000文字まで）',
                )}
                <textarea
                  maxLength={2000}
                  value={notes[item.id] ?? item.note ?? ''}
                  onChange={(e) =>
                    setNotes({ ...notes, [item.id]: e.target.value })
                  }
                />
              </label>
              <div className="journey-options">
                <button
                  disabled={busy}
                  onClick={() => review(item, 'approved')}
                >
                  {say('接纳为草稿', 'Accept as draft', '下書きに採用')}
                </button>
                <button
                  disabled={busy}
                  onClick={() => review(item, 'rejected')}
                >
                  {say('忽略', 'Dismiss', '見送り')}
                </button>
                <button disabled={busy} onClick={() => review(item, 'pending')}>
                  {say('重新待审核', 'Reopen', '再審査')}
                </button>
              </div>
            </article>
          ))}
          {!busy && !visibleItems.length && (
            <p>
              {say(
                '这一类暂时没有意见。',
                'No submissions in this category.',
                'この分類にはまだ投稿がありません。',
              )}
            </p>
          )}
          <button
            disabled={busy || offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            {say('上一页', 'Previous', '前へ')}
          </button>
          <button
            disabled={busy || !more}
            onClick={() => setOffset(offset + 50)}
          >
            {say('下一页', 'Next', '次へ')}
          </button>
        </>
      )}
      <output aria-live="polite">
        {busy ? say('正在处理…', 'Working…', '処理中…') : message}
      </output>
    </main>
  );
}
