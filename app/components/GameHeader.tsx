"use client";

import { motion } from "framer-motion";
import { GameState } from "../lib/types";
import { PHASE_CONFIGS, INITIAL_LIVES } from "../lib/constants";

interface GameHeaderProps {
  gameState: GameState;
}

/**
 * 游戏顶部信息栏
 * 显示当前阶段、进度、血量
 */
export function GameHeader({ gameState }: GameHeaderProps) {
  const config = PHASE_CONFIGS[gameState.phase];
  const progress = config.infinite
    ? `第 ${gameState.questionIndex + 1} 题`
    : `${gameState.questionIndex + 1} / ${config.questionCount}`;

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 md:px-8">
      {/* 阶段信息 */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {config.name}
        </span>
        <span className="text-sm text-gray-300 font-medium">{progress}</span>
      </div>

      {/* 血量显示 */}
      <div className="flex items-center gap-1">
        {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{
              scale: i < gameState.lives ? 1 : 0.7,
              opacity: i < gameState.lives ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-xl md:text-2xl"
          >
            {i < gameState.lives ? "❤️" : "🖤"}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
