"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { GameState } from "../lib/types";
import {
  PHASE_CONFIGS,
  GAME_OVER_MESSAGES,
  PHASE_COMPLETION_MESSAGES,
  INITIAL_LIVES,
} from "../lib/constants";

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

/** D1 返回的分布数据格式 */
interface DistributionRow {
  count: number;
  total_answered: number;
}

interface StatsData {
  distribution: DistributionRow[];
}

interface PersonalBest {
  bestTotal: number;
  bestStreak: number;
}

const LOCAL_STORAGE_KEY = "douban_master_personal_best";

function getPersonalBest(): PersonalBest {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return { bestTotal: 0, bestStreak: 0 };
}

function updatePersonalBest(totalAnswered: number, maxStreak: number): PersonalBest {
  const current = getPersonalBest();
  const updated: PersonalBest = {
    bestTotal: Math.max(current.bestTotal, totalAnswered),
    bestStreak: Math.max(current.bestStreak, maxStreak),
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

/**
 * 游戏结束/通关界面
 */
export function GameOver({ gameState, onRestart }: GameOverProps) {
  const isVictory = gameState.isVictory;
  const config = PHASE_CONFIGS[gameState.phase];
  const [stats, setStats] = useState<StatsData | null>(null);
  const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasSaved = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const message = isVictory
    ? PHASE_COMPLETION_MESSAGES.master
    : GAME_OVER_MESSAGES[gameState.phase];

  // 计算答题时长（秒）
  const duration = gameState.endTime
    ? Math.round((gameState.endTime - gameState.startTime) / 1000)
    : Math.round((Date.now() - gameState.startTime) / 1000);

  // 计算准确率
  const correctCount = gameState.totalAnswered - (INITIAL_LIVES - gameState.lives);
  const accuracy =
    gameState.totalAnswered > 0
      ? Math.round((correctCount / gameState.totalAnswered) * 100)
      : 0;

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min > 0) {
      return `${min}分${sec}秒`;
    }
    return `${sec}秒`;
  };

  // 保存游戏记录并获取统计数据
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    // 更新本地历史最佳
    const best = updatePersonalBest(gameState.totalAnswered, gameState.maxStreak);
    setPersonalBest(best);

    const saveAndFetch = async () => {
      try {
        // 保存当前游戏记录到 D1
        const postRes = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalAnswered: gameState.totalAnswered,
            maxStreak: gameState.maxStreak,
            duration,
          }),
        });
        if (!postRes.ok) {
          console.warn("保存统计失败:", postRes.status, await postRes.text());
        }

        // 获取分布统计数据
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          console.warn("获取统计失败:", res.status, await res.text());
        }
      } catch (err) {
        console.error("统计数据请求失败:", err);
      }
    };

    saveAndFetch();
  }, [gameState.totalAnswered, gameState.maxStreak, duration]);

  // 保存结果为图片
  const handleSaveImage = useCallback(async () => {
    if (!contentRef.current || isSaving) return;
    setIsSaving(true);
    try {
      // 显示快照专属标题和脚注
      const titleEl = contentRef.current.querySelector(".snapshot-title");
      const footnoteEl = contentRef.current.querySelector(".snapshot-footnote");
      if (titleEl) titleEl.classList.remove("hidden");
      if (footnoteEl) footnoteEl.classList.remove("hidden");

      const { snapdom } = await import("@zumer/snapdom");
      const result = await snapdom(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      await result.download({
        filename: `豆瓣大师_${config.name}_${gameState.totalAnswered}题`,
        type: "png",
      });

      // 恢复隐藏
      if (titleEl) titleEl.classList.add("hidden");
      if (footnoteEl) footnoteEl.classList.add("hidden");
    } catch (err) {
      console.error("保存图片失败:", err);
      // 确保异常时也恢复隐藏
      const titleEl = contentRef.current?.querySelector(".snapshot-title");
      const footnoteEl = contentRef.current?.querySelector(".snapshot-footnote");
      if (titleEl) titleEl.classList.add("hidden");
      if (footnoteEl) footnoteEl.classList.add("hidden");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, config.name, gameState.totalAnswered]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center px-6 py-8 max-w-md w-full"
      >
        {/* 快照区域（不包含按钮） */}
        <div ref={contentRef} className="p-6">
        {/* 快照标题（仅截图时可见） */}
        <div className="text-lg font-bold text-[#00b51d] mb-4 hidden snapshot-title">目标是豆瓣大师</div>

        {/* 图标 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-5xl md:text-7xl mb-4"
        >
          {isVictory ? "🏆" : "💫"}
        </motion.div>

        {/* 标题 */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {isVictory ? "恭喜通关！" : "游戏结束"}
        </h2>

        {/* 消息 */}
        <p className="text-gray-600 text-base mb-5 leading-relaxed">
          {message}
        </p>

        {/* 到达阶段 */}
        <div className="mb-5">
          <span className="inline-block px-4 py-1.5 bg-[#00b51d]/10 text-[#00b51d] font-bold rounded-full text-sm">
            {config.name}
          </span>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatItem label="总答题数" value={`${gameState.totalAnswered}`} />
          <StatItem label="最高连击" value={`${gameState.maxStreak}`} />
          <StatItem label="答题时长" value={formatDuration(duration)} />
          <StatItem label="准确率" value={`${accuracy}%`} />
        </div>

        {/* 历史最佳（来自 localStorage） */}
        {personalBest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-5 p-3 bg-yellow-50 rounded-xl border border-yellow-200"
          >
            <div className="text-sm font-medium text-yellow-700 mb-1">
              历史最佳
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <span className="text-gray-700">
                总答题数{" "}
                <span className="font-bold text-yellow-600">
                  {personalBest.bestTotal}
                </span>
              </span>
              <span className="text-gray-700">
                最高连击{" "}
                <span className="font-bold text-yellow-600">
                  {personalBest.bestStreak}
                </span>
              </span>
            </div>
          </motion.div>
        )}

        {/* 柱状统计图 */}
        {stats && stats.distribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Histogram
              distribution={stats.distribution}
              currentValue={gameState.totalAnswered}
            />
          </motion.div>
        )}

        {/* 快照脚注（仅截图时可见） */}
        <div className="text-[10px] text-gray-400 mt-4 hidden snapshot-footnote">
          数据来源：Douban · 数据截止至：2024年9月
        </div>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-center gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="px-8 py-3 bg-[#00b51d] hover:bg-[#009a18]
              text-white font-bold rounded-xl shadow-lg shadow-green-500/30
              transition-all duration-200"
          >
            再来一局
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveImage}
            disabled={isSaving}
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200
              text-gray-700 font-bold rounded-xl
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "保存中..." : "保存结果"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

/**
 * 柱状统计图组件
 * 显示所有玩家的总答题数分布，高亮当前用户位置
 * 数据格式: [{count: 5, total_answered: 12}, ...] 表示答了5题的有12次
 * >=60 截尾在本地完成
 */
function Histogram({
  distribution,
  currentValue,
}: {
  distribution: DistributionRow[];
  currentValue: number;
}) {
  const TAIL_THRESHOLD = 60;

  // 判断是否需要截尾
  const hasOverThreshold = distribution.some((r) => r.count > TAIL_THRESHOLD);

  // 构建本地桶：将 >=50 的合并
  const buckets: Map<number, number> = new Map();
  let totalGames = 0;

  for (const row of distribution) {
    const key = hasOverThreshold ? Math.min(row.count, TAIL_THRESHOLD) : row.count;
    buckets.set(key, (buckets.get(key) || 0) + row.total_answered);
    totalGames += row.total_answered;
  }

  // 确定范围
  const allKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
  if (allKeys.length === 0) return null;

  const minKey = allKeys[0];
  const maxKey = allKeys[allKeys.length - 1];

  // 生成连续的 key 序列（填充中间空缺）
  const visibleKeys: number[] = [];
  for (let i = minKey; i <= maxKey; i++) {
    visibleKeys.push(i);
  }

  // 找到最大频次用于归一化
  const maxCount = Math.max(...visibleKeys.map((k) => buckets.get(k) || 0));

  // 当前用户所在的桶
  const currentBucket = hasOverThreshold
    ? Math.min(currentValue, TAIL_THRESHOLD)
    : currentValue;

  // 如果桶太多，进行合并
  const MAX_BARS = 25;
  let displayData: { label: string; count: number; highlighted: boolean }[];

  if (visibleKeys.length <= MAX_BARS) {
    displayData = visibleKeys.map((key) => ({
      label:
        hasOverThreshold && key === TAIL_THRESHOLD
          ? `≥${TAIL_THRESHOLD}`
          : `${key}`,
      count: buckets.get(key) || 0,
      highlighted: key === currentBucket,
    }));
  } else {
    // 合并桶
    const groupSize = Math.ceil(visibleKeys.length / MAX_BARS);
    displayData = [];
    for (let i = 0; i < visibleKeys.length; i += groupSize) {
      const group = visibleKeys.slice(i, i + groupSize);
      const count = group.reduce((sum, k) => sum + (buckets.get(k) || 0), 0);
      const highlighted = group.includes(currentBucket);
      const first = group[0];
      const last = group[group.length - 1];
      const label =
        hasOverThreshold && last === TAIL_THRESHOLD
          ? `≥${first}`
          : first === last
          ? `${first}`
          : `${first}-${last}`;
      displayData.push({ label, count, highlighted });
    }
  }

  const displayMaxCount = Math.max(...displayData.map((d) => d.count));

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-3 font-medium">
        全部玩家答题数分布（共 {totalGames} 次游戏）
      </div>
      <div className="flex items-end justify-center gap-[2px] h-24">
        {displayData.map((bar, idx) => {
          const height =
            displayMaxCount > 0
              ? Math.max((bar.count / displayMaxCount) * 100, 4)
              : 4;
          return (
            <div
              key={idx}
              className="flex flex-col items-end justify-end flex-1 min-w-0 h-full"
            >
              <div
                className={`w-full rounded-t-sm transition-all ${
                  bar.highlighted ? "bg-[#00b51d]" : "bg-gray-300"
                }`}
                style={{ height: `${height}%` }}
                title={`${bar.label}: ${bar.count}次`}
              />
            </div>
          );
        })}
      </div>
      {/* X 轴标签 */}
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        <span>{displayData[0]?.label}</span>
        <span className="text-[#00b51d] font-medium">
          你: {currentValue}题
        </span>
        <span>{displayData[displayData.length - 1]?.label}</span>
      </div>
    </div>
  );
}
