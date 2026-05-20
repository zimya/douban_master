"use client";

import { useState, useEffect } from "react";
import { loadMovieData, BucketedMovies } from "./lib/dataLoader";
import { LoadingScreen } from "./components/LoadingScreen";
import { GameBoard } from "./components/GameBoard";

/**
 * 游戏主页面
 * 负责数据加载和顶层状态管理
 */
export default function Home() {
  /** 按桶分类的电影数据（加载完成后非 null） */
  const [data, setData] = useState<BucketedMovies | null>(null);
  /** 加载错误信息 */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovieData()
      .then(setData)
      .catch((err) => {
        console.error("数据加载失败:", err);
        setError(err.message || "数据加载失败");
      });
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
        <div className="text-center px-8">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="text-xl text-white mb-2">加载失败</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <LoadingScreen />;
  }

  return <GameBoard data={data} />;
}
