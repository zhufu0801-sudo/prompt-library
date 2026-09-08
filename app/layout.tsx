import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AI Made Easy · 让提示词更容易使用',
  description:
    '10 个模块、30 个可填写模板与 AI Short 公开精选提示词。搜索、填写、锁定关键词、保存方案，基础模式无需调用 AI。',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
