'use client';
/* oxlint-disable next/no-html-link-for-pages -- Sites authentication uses full-document navigation, never prefetched client routing. */
import { useEffect, useState } from 'react';
import { tr, type Lang } from '@/lib/workflow';
export default function AccountMenu({ locale: l }: { locale: Lang }) {
  const [account, setAccount] = useState<{
    signedIn: boolean;
    email: string | null;
    admin: boolean;
  } | null>(null);
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false);
  const say = (zh: string, en: string, ja: string) => tr(l, zh, en, ja);
  useEffect(() => {
    let active = true;
    fetch('/api/account')
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json() as Promise<{
          signedIn: boolean;
          email: string | null;
          admin: boolean;
        }>;
      })
      .then((x) => {
        if (active) setAccount(x);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  async function transfer() {
    setBusy(true);
    try {
      const r = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim-guest-data', consent }),
      });
      if (!r.ok) throw Error();
      setMessage(
        say(
          '已归入账号。刷新页面后查看收藏、方案和视频项目。',
          'Imported. Refresh to see favorites, plans and video projects.',
          '移行しました。再読込すると保存した内容を確認できます。',
        ),
      );
      setConsent(false);
    } catch {
      setMessage(
        say(
          '未能迁移，原数据仍保留，请稍后重试。',
          'Transfer failed. Original data is retained; please retry.',
          '移行できません。元データは保持されています。再試行してください。',
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="account-menu">
      <summary>{say('我的保存', 'My saves', '保存データ')}</summary>
      <div className="account-panel">
        <strong>
          {account?.signedIn
            ? say('账号保存', 'Account storage', 'アカウント保存')
            : say('访客模式', 'Guest mode', 'ゲストモード')}
        </strong>
        <p>
          {say(
            '方案、收藏和视频项目支持云端保存。登录同一账号可跨设备读取；尚未点击保存的编辑仍是本机草稿。',
            'Plans, favorites and video projects can be saved online. Sign in on another device to access saved items; unsaved edits remain local drafts.',
            'プラン・お気に入り・動画企画をクラウドに保存できます。同じアカウントで別端末から利用可能。未保存の編集は端末内の下書きです。',
          )}
        </p>
        {account?.signedIn ? (
          <>
            <p>{account.email}</p>
            <label>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              {say(
                '这台浏览器的访客收藏、方案和云端视频项目属于我，同意归入当前账号。',
                'The guest favorites, plans and cloud video projects in this browser are mine. Move them into this account.',
                'このブラウザのゲスト保存データは私のものです。現在のアカウントへ移行します。',
              )}
            </label>
            <button
              className="studio-primary"
              disabled={!consent || busy}
              onClick={transfer}
            >
              {say(
                '归入我的账号',
                'Import into my account',
                'アカウントへ移行',
              )}
            </button>
            {account.admin && (
              <a href="/review">
                {say('意见审核', 'Feedback review', 'フィードバック審査')}
              </a>
            )}
            <a href="/signout-with-chatgpt?return_to=%2F" target="_top">
              {say('退出账号', 'Sign out', 'ログアウト')}
            </a>
          </>
        ) : (
          <a
            className="studio-primary"
            href="/signin-with-chatgpt?return_to=%2F"
            target="_top"
          >
            {say(
              '使用 ChatGPT 账号登录',
              'Sign in with ChatGPT',
              'ChatGPTでログイン',
            )}
          </a>
        )}
        <output aria-live="polite">{message}</output>
      </div>
    </details>
  );
}
