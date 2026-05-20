"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RoundFeedbackProps {
  result: "correct" | "wrong" | null;
}

/**
 * 回合结果反馈动画
 * 猜对/猜错时显示全屏闪烁效果
 */
export function RoundFeedback({ result }: RoundFeedbackProps) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 pointer-events-none z-50 ${
            result === "correct"
              ? "bg-green-500/10 border-4 border-green-500/30"
              : "bg-red-500/10 border-4 border-red-500/30"
          }`}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="text-6xl md:text-8xl">
              {result === "correct" ? "✓" : "✗"}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
