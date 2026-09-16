'use client';
import { useState } from 'react';
import { tr, type Lang } from '@/lib/workflow';
export default function FeedbackForm({
  locale: l,
  context,
}: {
  locale: Lang;
  context: string;
}) {
  const [summary, setSummary] = useState(''),
    [kind, setKind] = useState('missing'),
    [consent, setConsent] = useState(false),
    [website, setWebsite] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  async function submit() {
    if (!summary.trim() || !consent) {
      setMessage(
        tr(
          l,
          '请填写摘要并确认提交。',
          'Write a summary and confirm consent.',
          '要約を入力し送信を確認してください。',
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          context: context.slice(0, 200),
          kind,
          consent,
          website,
        }),
      });
      if (!r.ok) throw Error(String(r.status));
      setMessage(
        tr(
          l,
          '已收到，进入待审核流程。不会自动修改模板。',
          'Received for review. Templates are not changed automatically.',
          '受付済み。確認待ちとなり、テンプレートは自動変更されません。',
        ),
      );
      setSummary('');
      setConsent(false);
    } catch (e) {
      setMessage(
        String(e).includes('429')
          ? tr(
              l,
              '今天提交较多，请稍后再试。',
              'Daily limit reached; try later.',
              '本日の上限です。後ほどお試しください。',
            )
          : tr(
              l,
              '提交失败，内容仍保留，请重试。',
              'Could not submit; your text is preserved.',
              '送信失敗。内容は保持されています。',
            ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="feedback-panel">
      <summary>
        {tr(
          l,
          '没找到合适的？提交改进意见',
          'Not a match? Share feedback',
          '合わない場合は改善意見を送る',
        )}
      </summary>
      <p>
        {tr(
          l,
          '只提交你确认的需求摘要，不包含私人资料。短句、口语和错别字不会因此被丢弃。',
          'Submit only a summary you approve, without private information. Short or informal wording is welcome.',
          '確認した要約だけを送信し、個人情報は除いてください。短文や口語でも構いません。',
        )}
      </p>
      <label>
        {tr(l, '遇到的问题', 'Problem', '問題')}
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          {['missing', 'mismatch', 'unclear', 'quality'].map((x, i) => (
            <option key={x} value={x}>
              {
                [
                  tr(l, '缺少这个方向', 'Missing task', '分野がない'),
                  tr(l, '匹配错了', 'Wrong match', '一致しない'),
                  tr(l, '选项看不懂', 'Unclear choices', '選択肢が難しい'),
                  tr(l, '内容不好用', 'Unhelpful output', '内容が役に立たない'),
                ][i]
              }
            </option>
          ))}
        </select>
      </label>
      <label>
        {tr(l, '需求摘要', 'Request summary', '要望の要約')}
        <textarea
          maxLength={1000}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>
      <label className="feedback-trap" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>
      <label className="check-line">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {tr(
          l,
          '我同意将以上摘要提交到改进意见库。',
          'I agree to submit this summary for product improvement.',
          'この要約を改善用に送信することに同意します。',
        )}
      </label>
      <button disabled={busy} onClick={submit}>
        {busy
          ? tr(l, '提交中…', 'Submitting…', '送信中…')
          : tr(l, '提交意见', 'Submit feedback', '意見を送信')}
      </button>
      <output>{message}</output>
    </details>
  );
}
