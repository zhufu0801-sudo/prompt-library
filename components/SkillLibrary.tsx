'use client';
import { useState } from 'react';
import { Download, ExternalLink, Search } from 'lucide-react';
import skills from '../data/studio/skills.json';
import fit from '../data/studio/skill-fit.json';
import audit from '../data/studio/skill-audit.json';
import { tr } from '@/lib/workflow';
import type { Locale } from '../lib/studio';
export default function SkillLibrary({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState('');
  const t = {
    zh: {
      title: 'Skill 下载中心',
      intro: '先看适用范围，再下载。普通提示词无需安装 Skill。',
      search: '搜索 Skill',
      download: '下载 ZIP',
      backup: '备用下载',
      source: '原始来源',
      usage: '使用方法与所需工具',
      note: '下载包是指令文档，包含使用说明与许可证。部分内容需要目标 AI 的工具支持；不代表免费生成图片或视频，也未在所有 AI 中验证运行。',
      none: '没有匹配的 Skill。',
      verified: '包内检查：2026-09-16',
    },
    en: {
      title: 'Skill downloads',
      intro:
        'Check the scope before downloading. Standard prompts need no Skill installation.',
      search: 'Search Skills',
      download: 'Download ZIP',
      backup: 'Backup download',
      source: 'Original source',
      usage: 'Usage and required tools',
      note: 'Packages contain instructions, usage notes and licenses. Some workflows require tools in your AI app; downloads do not provide free media generation or certify every AI runtime.',
      none: 'No matching Skill.',
      verified: 'Package checked: 2026-09-16',
    },
    ja: {
      title: 'Skillダウンロード',
      intro:
        '対象範囲を確認して保存してください。通常プロンプトはSkill不要です。',
      search: 'Skillを検索',
      download: 'ZIPを保存',
      backup: '予備ダウンロード',
      source: '原典',
      usage: '使い方・必要な機能',
      note: '指示文、使用説明、許諾を含む文書です。一部の手順は対象AIの機能が必要です。無料の媒体生成や全AIでの動作を保証するものではありません。',
      none: '一致するSkillがありません。',
      verified: 'パッケージ確認：2026-09-16',
    },
  }[locale];
  const filtered = skills.filter((s) =>
    (s.labels[locale] + ' ' + fit[s.id as keyof typeof fit].scope[locale])
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="skill-library">
      <h2>{t.title}</h2>
      <p>
        {skills.length} Skills · {t.intro}
      </p>
      <label className="studio-search">
        <Search size={20} />
        <input
          aria-label={t.search}
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p className="skill-library-note">{t.note}</p>
      <a href="/downloads/skill-audit.json" download>
        {tr(
          locale,
          '下载全部 Skill 检查报告',
          'Download all Skill checks',
          '全Skillの検査結果を保存',
        )}
      </a>
      <div className="skill-download-list">
        {filtered.map((s) => (
          <article key={s.id}>
            <div className="skill-download-title">
              <h3>{s.labels[locale]}</h3>
              <span>{s.license}</span>
            </div>
            <p>{fit[s.id as keyof typeof fit].scope[locale]}</p>
            <div className="skill-links">
              <a className="studio-primary" href={s.download} download>
                <Download size={18} />
                {t.download}
              </a>
              <a
                href={
                  'https://raw.githubusercontent.com/zhufu0801-sudo/prompt-library/main/public' +
                  s.download
                }
                target="_blank"
                rel="noreferrer"
              >
                {t.backup}
              </a>
              <a href={s.source} target="_blank" rel="noreferrer">
                <ExternalLink size={16} />
                {t.source}
              </a>
            </div>
            <small>
              {t.verified} · {Math.ceil(s.bytes / 1024)} KB
            </small>
            <details>
              <summary>{t.usage}</summary>
              <p>{s.usage[locale]}</p>
              <p className="skill-checks">
                {tr(
                  locale,
                  '已核对：ZIP 完整性、文件哈希、入口文件、许可证、三语用法。外部 AI 实际运行：尚未逐个验证。',
                  'Checked: ZIP integrity, hashes, entrypoint, license and three-language usage. Execution in external AI apps has not been individually verified.',
                  'ZIP・ハッシュ・入口・許諾・三言語の使い方を検査済み。外部AIでの実動作は個別未検証です。',
                )}
              </p>
              {audit[s.id as keyof typeof audit]?.externalLinks.length > 0 && (
                <p>
                  {tr(
                    locale,
                    '入口还引用外部文档，使用前请核对这些依赖。',
                    'The entrypoint references external documents; check these dependencies before use.',
                    '入口に外部文書参照があります。利用前に確認してください。',
                  )}
                </p>
              )}
              <p className="skill-checksum">SHA-256: {s.sha256}</p>
            </details>
          </article>
        ))}
      </div>
      {!filtered.length && <p>{t.none}</p>}
    </section>
  );
}
