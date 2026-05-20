"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "../lib/types";
import { PHASE_CONFIGS, INITIAL_LIVES } from "../lib/constants";

interface GameHeaderProps {
  gameState: GameState;
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
            <li>在五次机会用完之前回答40轮题，你就是豆瓣大师！</li>
          </ol>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 bg-[#00b51d] hover:bg-[#009a18] text-white font-medium rounded-xl transition-colors"
          >
            知道了
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 游戏顶部信息栏
 * 左侧：阶段进度 | 中间：网站标题 | 右侧：GitHub + 帮助按钮
 */
export function GameHeader({ gameState }: GameHeaderProps) {
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

        {/* 右侧：GitHub + 帮助按钮 */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          <a
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
          </a>
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
      <div className="flex items-center gap-0.5">
        {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{
              scale: i < gameState.lives ? 1 : 0.7,
              opacity: i < gameState.lives ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-base md:text-lg"
          >
            {i < gameState.lives ? "❤️" : "🖤"}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
