import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "目标是豆瓣大师",
  description:
    "基于豆瓣电影数据库的 Higher Lower 游戏，猜猜哪部电影评分更高！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-white text-gray-800 antialiased overflow-hidden pb-10">
        {children}
        <footer className="fixed bottom-0 inset-x-0 z-40 py-3 text-center text-[11px] text-gray-400 bg-white">
          数据来源：<a href="https://movie.douban.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Douban</a> · 灵感来源：<a href="https://bangumi-master.logicry.cc/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Bangumi Master</a> · 数据截止至：2024年9月
        </footer>
      </body>
    </html>
  );
}
