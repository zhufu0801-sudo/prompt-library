import type { Metadata } from 'next';
import './globals.css';
import './studio.css';
import './workbench.css';
export const metadata: Metadata = {
  title: 'AI Made Easy · 让提示词更容易使用',
  description:
    '编程、AI图片、动画、WPS Office、文案与论文制作提示词。中英日三语，任务匹配、Skill文档下载和方案保存。',
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
