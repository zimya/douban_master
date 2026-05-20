"use client";

import { motion } from "framer-motion";
import { GameState } from "../lib/types";
import {
  PHASE_CONFIGS,
  GAME_OVER_MESSAGE,
  PHASE_COMPLETION_MESSAGES,
} from "../lib/constants";

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

/**
 * 游戏结束/通关界面
 */
export function GameOver({ gameState, onRestart }: GameOverProps) {
  const isVictory = gameState.isVictory;
  const config = PHASE_CONFIGS[gameState.phase];

  const message = isVictory
    ? PHASE_COMPLETION_MESSAGES.master
    : GAME_OVER_MESSAGE;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center px-8 max-w-md"
      >
        {/* 图标 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl md:text-8xl mb-6"
        >
          {isVictory ? "🏆" : "💫"}
        </motion.div>

        {/* 标题 */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {isVictory ? "恭喜通关！" : "游戏结束"}
        </h2>

        {/* 消息 */}
        <p className="text-gray-300 text-lg mb-6 leading-relaxed">{message}</p>

        {/* 统计 */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {gameState.totalAnswered}
            </div>
            <div className="text-sm text-gray-500">总答题数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {config.name}
            </div>
            <div className="text-sm text-gray-500">到达阶段</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {gameState.lives}
            </div>
            <div className="text-sm text-gray-500">剩余血量</div>
          </div>
        </div>

        {/* 重新开始按钮 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600
            text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30
            transition-all duration-200"
        >
          再来一局
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
