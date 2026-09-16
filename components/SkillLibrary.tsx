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
    (
      s.id +
      ' ' +
      Object.values(s.labels).join(' ') +
      ' ' +
      Object.values(fit[s.id as keyof typeof fit].scope).join(' ')
    )
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
      <details className="skill-library-note">
        <summary>
          {tr(
            locale,
            'WorkBuddy 视频推荐：收录与核对情况',
            'WorkBuddy video: reviewed recommendations',
            'WorkBuddy動画の推薦：収録・確認状況',
          )}
        </summary>
        <p>
          {tr(
            locale,
            '视频只展示名称，没有给出仓库地址。以下为核实过的对应开源项目或轻量适配版，不能确认与作者安装的版本完全相同。',
            'The video shows names without repository URLs. These are reviewed matching projects or lightweight adaptations, not verified as the exact versions installed by the author.',
            '動画には名称のみが表示され、リポジトリURLはありません。対応する公開プロジェクトや軽量調整版を確認しましたが、作者の導入版との一致は未確認です。',
          )}
        </p>
        <div className="skill-links">
          {[
            'ame-find-skills',
            'humanizer',
            'ame-skill-creator',
            'ame-editable-slides',
          ].map((id) => {
            const skill = skills.find((s) => s.id === id)!;
            return (
              <button
                type="button"
                className="studio-secondary"
                key={id}
                onClick={() => setQuery(id)}
              >
                {skill.labels[locale]}
              </button>
            );
          })}
          <button
            type="button"
            className="studio-secondary"
            onClick={() => setQuery('wps')}
          >
            {tr(
              locale,
              '查看已有办公 Skills',
              'Existing office Skills',
              '既存のオフィスSkills',
            )}
          </button>
          <button
            type="button"
            className="studio-secondary"
            onClick={() => setQuery('')}
          >
            {tr(locale, '查看全部', 'Show all', 'すべて表示')}
          </button>
        </div>
        <p>
          {tr(
            locale,
            'Finder Skills 对应技能查找；Humanizer 保留原版指令；Skill Creator 与 PPT Master 提供标明来源的指令适配版。办公类已有 WPS 文档、表格清洗和演示文稿内容，并非 WorkBuddy 自带办公工具的副本。',
            'Finder Skills maps to Skill discovery. Humanizer retains its original instructions; Skill Creator and PPT Master are attributed instruction adaptations. Existing WPS document, data-cleaning and presentation packs cover office tasks; they are not copies of WorkBuddy’s built-in tools.',
            'Finder SkillsはSkill検索に対応。Humanizerは原文を収録し、Skill CreatorとPPT Masterは出典を示した指示調整版です。既存のWPS文書・表整理・スライドSkillは、WorkBuddy内蔵ツールの複製ではありません。',
          )}
        </p>
        <p>
          {tr(
            locale,
            'Self Improving、Proactive Agent、Smart Chart：尚未确认视频中所指的具体来源，暂不提供同名下载，也未启用自动学习或后台执行。',
            'Self Improving, Proactive Agent and Smart Chart: the exact sources shown in the video remain unconfirmed, so no same-name downloads or automatic background execution are enabled.',
            'Self Improving・Proactive Agent・Smart Chartは動画が指す原典を特定できていないため、同名ダウンロードや自動学習・バックグラウンド実行は未提供です。',
          )}
        </p>
        <a
          href="https://www.douyin.com/video/7686124900007972150"
          target="_blank"
          rel="noreferrer"
        >
          {tr(
            locale,
            '查看推荐视频',
            'View the recommendation video',
            '推薦動画を見る',
          )}
        </a>
      </details>
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
