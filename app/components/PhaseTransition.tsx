"use client";

import { motion } from "framer-motion";
import { GamePhase } from "../lib/types";
import { PHASE_CONFIGS } from "../lib/constants";

interface PhaseTransitionProps {
  phase: GamePhase;
  onContinue: () => void;
}

/**
 * 阶段过渡动画组件
 * 当玩家进入新阶段时显示
 */
export function PhaseTransition({ phase, onContinue }: PhaseTransitionProps) {
  const config = PHASE_CONFIGS[phase];

  /** 各阶段的图标 */
  const phaseIcons: Record<GamePhase, string> = {
    novice: "🌱",
    apprentice: "📖",
    veteran: "👓",
    expert: "🎓",
    master: "👑",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="text-6xl md:text-8xl mb-6"
        >
          {phaseIcons[phase]}
        </motion.div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          {config.name}
        </h2>

        <p className="text-gray-500 text-lg mb-2">
          {config.infinite
            ? "无限挑战模式"
            : `共 ${config.questionCount} 题`}
        </p>

        <p className="text-gray-400 text-sm mb-8">
          评分差控制: ≥ {config.minRatingDiff}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="px-8 py-3 bg-[#00b51d] hover:bg-[#009a18]
            text-white font-bold rounded-xl shadow-lg shadow-green-500/30
            transition-all duration-200"
        >
          开始挑战
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
