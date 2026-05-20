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
      <body className="bg-white text-gray-800 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
