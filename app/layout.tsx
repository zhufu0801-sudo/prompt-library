import type { Metadata } from 'next';
import './globals.css';
import './studio.css';
export const metadata: Metadata = {
  title: 'AI Made Easy · 让提示词更容易使用',
  description:
    '编程、AI 动画与图片制作提示词。支持中文、日本語和 English，元提示词辅助、字段锁定和方案保存。',
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
