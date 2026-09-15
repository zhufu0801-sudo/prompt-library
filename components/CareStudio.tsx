'use client';
import { useEffect, useRef, useState } from 'react';
import { HeartHandshake, Check, Copy, ArrowLeft, Download } from 'lucide-react';
import {
  analyzeCare,
  careIntents,
  composeCare,
  type CareLocale,
} from '../lib/care';
const words = {
  zh: {
    title: '关怀版',
    intro: '想让 AI 帮您做什么？用平常说话的方式写下来就好。',
    steps: ['说说需求', '核对意思', '复制给 AI'],
    input: '我想请 AI 帮忙',
    placeholder: '例如：我想给孙女写生日祝福，简短一点，别太肉麻。',
    examples: [
      '给孙女写生日祝福，简短自然一点。',
      '教我怎么把手机里的照片发给朋友。',
      '我想做两个人的晚饭，家里有鸡蛋和番茄。',
    ],
    analyze: '帮我整理',
    required: '请先写一句您想做的事情。',
    check: '先核对一下您的意思',
    guess: '根据您的话，下面这些事情可能相关。请选择这次最想做的一件。',
    unknown: '还不确定您的意思，请选一件最接近的事情。也可以选择“其他事情”。',
    yourWords: '您刚才说',
    goal: '这次想做什么？',
    more: '查看其他事情',
    extra: '再补充一点（可不填）',
    style: '希望 AI 怎样回答？',
    styles: ['简短直接', '一步一步讲', '给完整内容'],
    generate: '意思对了，生成提示词',
    back: '返回修改',
    output: '可以发给 AI 的内容',
    copy: '复制这段内容',
    copied: '已复制。现在去您常用的 AI 聊天窗口粘贴并发送。',
    copyFail: '暂时无法自动复制。请长按下方文字，选择“全选”，再选择“复制”。',
    download: '保存为文字文件',
    next: '接下来这样做',
    instructions: [
      '点击“复制这段内容”。',
      '打开您常用的 AI 软件，新建一次聊天。',
      '在输入框长按或右键粘贴，核对后发送。',
    ],
    privacy:
      '本页不会上传您填写的文字；关怀版只在当前页面整理需求，不直接生成 AI 回答。',
    how: '它怎样整理？',
    howBody:
      '根据本地词库找可能的事情，再由您核对。它不是大模型，遇到模糊或复杂的话可能判断不准。没有模型调用费用，也不会替您发送消息。',
    language: '切换语言会改变提示词的说明语言，您的原话会完整保留。',
    choose: '请选择一件事情后继续。',
  },
  en: {
    title: 'Care edition',
    intro: 'What would you like AI to help with? Write it in your own words.',
    steps: ['Describe your need', 'Check the meaning', 'Copy to AI'],
    input: 'I would like help with',
    placeholder:
      'For example: Write a short birthday message for my granddaughter. Keep it warm, not overly sentimental.',
    examples: [
      'Write a short, natural birthday message for my granddaughter.',
      'Teach me to send photos from my phone to a friend.',
      'Plan dinner for two using eggs and tomatoes.',
    ],
    analyze: 'Help me organize it',
    required: 'Please write one thing you would like help with.',
    check: 'Let’s check what you mean',
    guess:
      'These goals may match your words. Choose the one you want to work on now.',
    unknown:
      'The meaning is not clear yet. Pick the closest goal, or choose “Something else”.',
    yourWords: 'Your original words',
    goal: 'What would you like to do?',
    more: 'Show other goals',
    extra: 'Add a detail (optional)',
    style: 'How should AI answer?',
    styles: ['Short and direct', 'Step by step', 'Complete content'],
    generate: 'That’s right — create the prompt',
    back: 'Go back and edit',
    output: 'Content to send to AI',
    copy: 'Copy this content',
    copied: 'Copied. Paste it into your usual AI chat and send when ready.',
    copyFail:
      'Automatic copying is unavailable. Select all the text below and copy it manually.',
    download: 'Save a text file',
    next: 'What to do next',
    instructions: [
      'Select “Copy this content”.',
      'Open your usual AI app and start a chat.',
      'Paste into the message box, check it and send.',
    ],
    privacy:
      'This page does not upload your text. It organizes your request locally and does not generate an AI answer.',
    how: 'How does it work?',
    howBody:
      'Local word rules suggest possible goals for you to confirm. This is not a language model and can misunderstand ambiguous or complex requests. There are no model-call charges, and nothing is sent for you.',
    language:
      'Changing language updates the prompt instructions and preserves your original words.',
    choose: 'Please choose a goal to continue.',
  },
  ja: {
    title: 'かんたん版',
    intro: 'AIに何を手伝ってほしいですか？普段の言葉で書いてください。',
    steps: ['要望を書く', '意味を確認', 'AIにコピー'],
    input: 'AIに頼みたいこと',
    placeholder: '例：孫娘への誕生日のお祝いを短く書きたい。大げさにしないで。',
    examples: [
      '孫娘への誕生日のお祝いを短く自然に書きたい。',
      'スマホの写真を友人に送る方法を教えて。',
      '卵とトマトで2人分の夕食を作りたい。',
    ],
    analyze: '要望を整理する',
    required: '手伝ってほしいことを一つ書いてください。',
    check: '意味を確認しましょう',
    guess: '関連しそうな目的です。今回したいことを一つ選んでください。',
    unknown:
      'まだ意味を絞れていません。近いものか「そのほか」を選んでください。',
    yourWords: '書いてくださった内容',
    goal: '今回したいことは？',
    more: 'ほかの目的を見る',
    extra: '補足する（任意）',
    style: 'どんな答えがよいですか？',
    styles: ['短く直接', '一歩ずつ', '完成した内容'],
    generate: 'この意味でプロンプトを作る',
    back: '戻って直す',
    output: 'AIに送る内容',
    copy: 'この内容をコピー',
    copied: 'コピーしました。普段のAIチャットに貼り付けて送ってください。',
    copyFail:
      '自動コピーができません。下の文章をすべて選択し、コピーしてください。',
    download: 'テキストを保存',
    next: '次の使い方',
    instructions: [
      '「この内容をコピー」を押します。',
      '普段のAIアプリでチャットを開きます。',
      '入力欄に貼り付け、確認して送ります。',
    ],
    privacy:
      '入力文を送信せず、このページ内で整理します。AIの回答を直接生成する機能ではありません。',
    how: '整理の仕組み',
    howBody:
      '端末内の語句ルールで候補を出し、ご本人が確認します。言語モデルではなく、曖昧・複雑な要望は誤ることがあります。モデル利用料はかからず、勝手に送信しません。',
    language:
      '言語を変えると説明文が切り替わります。ご本人の原文は保たれます。',
    choose: '目的を選んでください。',
  },
};
export default function CareStudio({ locale }: { locale: CareLocale }) {
  const t = words[locale];
  const [step, setStep] = useState(0),
    [text, setText] = useState(''),
    [intent, setIntent] = useState(''),
    [extra, setExtra] = useState(''),
    [detail, setDetail] = useState<'short' | 'steps' | 'full'>('steps'),
    [showAll, setShowAll] = useState(false),
    [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null),
    outputRef = useRef<HTMLTextAreaElement>(null),
    inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (step > 0) heading.current?.focus();
  }, [step]);
  const analysis = analyzeCare(text);
  const options =
    showAll || analysis.unmatched
      ? careIntents
      : analysis.candidates.map((r) => r.intent);
  const selected = careIntents.find((i) => i.id === intent);
  const output = composeCare(text, intent, extra, locale, detail);
  function next() {
    if (!text.trim()) {
      setNotice(t.required);
      inputRef.current?.focus();
      return;
    }
    setIntent('');
    setExtra('');
    setShowAll(false);
    setNotice('');
    setStep(1);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setNotice(t.copied);
    } catch {
      setNotice(t.copyFail);
      outputRef.current?.focus();
      outputRef.current?.select();
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([output], { type: 'text/plain;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-Made-Easy-care-' + locale + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="care-workspace" aria-label={t.title}>
      <div className="care-title">
        <HeartHandshake aria-hidden="true" size={32} />
        <div>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </div>
      <ol className="care-steps" aria-label={t.title}>
        {t.steps.map((s, i) => (
          <li
            key={i}
            aria-current={step === i ? 'step' : undefined}
            className={step === i ? 'current' : step > i ? 'done' : ''}
          >
            <span>{step > i ? <Check size={20} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="care-panel">
        {step === 0 ? (
          <>
            <label htmlFor="care-input">{t.input}</label>
            <textarea
              ref={inputRef}
              id="care-input"
              value={text}
              maxLength={2000}
              rows={5}
              placeholder={t.placeholder}
              onChange={(e) => {
                setText(e.target.value);
                setNotice('');
              }}
            />
            <small>{text.length}/2000</small>
            <div className="care-examples">
              {t.examples.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setText(s);
                    setNotice('');
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button className="care-action" onClick={next}>
              {t.analyze}
            </button>
          </>
        ) : step === 1 ? (
          <>
            <h2 ref={heading} tabIndex={-1}>
              {t.check}
            </h2>
            <p>{analysis.unmatched ? t.unknown : t.guess}</p>
            <blockquote>
              <span>{t.yourWords}</span>
              {text}
            </blockquote>
            <fieldset>
              <legend>{t.goal}</legend>
              <div className="care-options">
                {options.map((i) => (
                  <button
                    key={i.id}
                    aria-pressed={intent === i.id}
                    onClick={() => {
                      setIntent(i.id);
                      setExtra('');
                      setNotice('');
                    }}
                  >
                    {intent === i.id && <Check size={20} />} {i.label[locale]}
                  </button>
                ))}
              </div>
            </fieldset>
            {!showAll && !analysis.unmatched && (
              <button className="care-more" onClick={() => setShowAll(true)}>
                {t.more}
              </button>
            )}
            {selected && (
              <div className="care-detail">
                <label htmlFor="care-extra">{selected.question[locale]}</label>
                <p>{t.extra}</p>
                <textarea
                  id="care-extra"
                  rows={3}
                  maxLength={1500}
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                />
              </div>
            )}
            <fieldset>
              <legend>{t.style}</legend>
              <div className="care-options">
                {(['short', 'steps', 'full'] as const).map((id, i) => (
                  <button
                    key={id}
                    aria-pressed={detail === id}
                    onClick={() => setDetail(id)}
                  >
                    {t.styles[i]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="care-actions">
              <button
                onClick={() => {
                  setStep(0);
                  setNotice('');
                }}
              >
                <ArrowLeft size={20} />
                {t.back}
              </button>
              <button
                className="care-action"
                onClick={() => {
                  if (!intent) {
                    setNotice(t.choose);
                    return;
                  }
                  setNotice('');
                  setStep(2);
                }}
              >
                {t.generate}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 ref={heading} tabIndex={-1}>
              {t.output}
            </h2>
            <p>
              {selected?.label[locale]} ·{' '}
              {t.styles[(['short', 'steps', 'full'] as const).indexOf(detail)]}
            </p>
            <div className="care-actions">
              <button className="care-action" onClick={copy}>
                <Copy size={22} />
                {t.copy}
              </button>
              <button onClick={download}>
                <Download size={22} />
                {t.download}
              </button>
            </div>
            <label className="sr-only" htmlFor="care-output">
              {t.output}
            </label>
            <textarea
              ref={outputRef}
              id="care-output"
              value={output}
              readOnly
              rows={13}
            />
            <p className="care-language-note">{t.language}</p>
            <div className="care-next">
              <h3>{t.next}</h3>
              <ol>
                {t.instructions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <button
              onClick={() => {
                setStep(1);
                setNotice('');
              }}
            >
              <ArrowLeft size={20} />
              {t.back}
            </button>
          </>
        )}
        {notice && (
          <p role="status" className="care-status">
            {notice}
          </p>
        )}
      </div>
      <p className="care-privacy">{t.privacy}</p>
      <details className="care-about">
        <summary>{t.how}</summary>
        <p>{t.howBody}</p>
      </details>
    </section>
  );
}
