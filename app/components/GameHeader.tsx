"use client";

import { motion } from "framer-motion";
import { GameState } from "../lib/types";
import { PHASE_CONFIGS, INITIAL_LIVES } from "../lib/constants";

interface GameHeaderProps {
  gameState: GameState;
}

/**
 * 游戏顶部信息栏
 * 左侧：阶段进度 | 中间：网站标题 | 右侧占位保持居中
 */
export function GameHeader({ gameState }: GameHeaderProps) {
  const config = PHASE_CONFIGS[gameState.phase];
  const progress = config.infinite
    ? `第 ${gameState.questionIndex + 1} 题`
    : `${gameState.questionIndex + 1} / ${config.questionCount}`;

  return (
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

      {/* 右侧占位，保持标题居中 */}
      <div className="min-w-[80px]" />
    </div>
  );
}

/**
 * 游戏状态栏
 * 显示连击数、已答数、血量，放在提示语下方
 */
export function GameStats({ gameState }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 py-1">
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
