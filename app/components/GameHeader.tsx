"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "../lib/types";
import { PHASE_CONFIGS, INITIAL_LIVES } from "../lib/constants";

interface GameHeaderProps {
  gameState: GameState;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

/**
 * 游戏说明弹窗
 */
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-xl max-w-sm w-[90%] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">游戏说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 leading-relaxed">
            <li>每轮显示两部电影或电视剧，点击你认为豆瓣评分更高的那部</li>
            <li>右边的条目在下一轮会变成左边的条目</li>
            <li>答错扣一条机会，游戏结束之前，你共有五次机会</li>
            <li>在五次机会用完之前回答35轮题，你就是豆瓣大师！</li>
          </ol>
          <a
            href="https://github.com/zimya/douban_master"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full py-2 bg-[#00b51d] hover:bg-[#009a18] text-white font-medium rounded-xl transition-colors text-center"
          >
            GitHub
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 游戏顶部信息栏
 * 左侧：阶段进度 | 中间：网站标题 | 右侧：GitHub + 帮助按钮
 */
export function GameHeader({ gameState, soundEnabled, onToggleSound }: GameHeaderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const config = PHASE_CONFIGS[gameState.phase];
  const progress = config.infinite
    ? `第 ${gameState.questionIndex + 1} 题`
    : `${gameState.questionIndex + 1} / ${config.questionCount}`;

  return (
    <>
      <div className="w-full flex items-center justify-between px-4 py-2 md:px-8 md:py-3">
        {/* 左侧：阶段进度 */}
        <div className="flex flex-col min-w-[80px]">
          <span className="text-xs text-[#00b51d] uppercase tracking-wider font-medium">
            {config.name}
          </span>
          <span className="text-sm text-gray-600 font-medium">{progress}</span>
        </div>

        {/* 中间：网站标题 */}
        <h1 className="text-xl md:text-2xl font-bold text-[#00b51d]">
          目标是豆瓣大师
        </h1>

        {/* 右侧：GitHub + 声音 + 帮助按钮 */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          {/* <a
            href="https://github.com/zimya/douban_master"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="GitHub 项目主页"
          >
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a> */}
          <button
            onClick={onToggleSound}
            className="p-1.5 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
            aria-label={soundEnabled ? "关闭音效" : "开启音效"}
          >
            {soundEnabled ? (
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-1.5 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
            aria-label="游戏说明"
          >
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* 帮助弹窗 */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}

/**
 * SVG 心形图标组件
 */
function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="22"
      height="22"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#ee5a24" />
        </linearGradient>
      </defs>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "url(#heartGradient)" : "none"}
        stroke={filled ? "none" : "#d1d5db"}
        strokeWidth={filled ? 0 : 1.5}
      />
    </svg>
  );
}

/**
 * 游戏状态栏
 * 显示连击数、已答数、血量，放在提示语下方
 */
export function GameStats({ gameState }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 py-1 mb-4 md:mb-6">
      {/* 连击 */}
      {gameState.streak > 0 && (
        <motion.span
          key={gameState.streak}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-xs md:text-sm text-orange-500 font-medium"
        >
          🔥 {gameState.streak} 连击
        </motion.span>
      )}

      {/* 已答 */}
      <span className="text-xs md:text-sm text-gray-500">
        {gameState.totalAnswered} 已答
      </span>

      {/* 血量显示 */}
      <div className="flex items-center gap-1">
        {Array.from({ length: INITIAL_LIVES }).map((_, i) => {
          const isAlive = i < gameState.lives;
          return (
            <div key={i} className="relative">
              <AnimatePresence>
                {isAlive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      y: [0, 30],
                      opacity: [1, 0],
                      scale: [1, 0.4],
                      transition: { duration: 0.5, ease: "easeIn" },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="relative"
                  >
                    <HeartIcon filled={true} />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* 空心底层（始终渲染，掉心后显示） */}
              {!isAlive && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <HeartIcon filled={false} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
