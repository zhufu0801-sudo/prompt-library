import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'CodePrompt · 编程提示词工具箱',description:'发现、收藏、一键复制，12 个精选编程提示词，覆盖代码解释、调试、重构、测试与接口设计。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}

