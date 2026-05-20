"use client";

import { motion } from "framer-motion";

/**
 * 数据加载中的等待界面
 */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#00b51d]/30 border-t-[#00b51d] rounded-full"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-gray-600 text-lg"
      >
        正在加载豆瓣数据库...
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 text-gray-400 text-sm"
      >
        首次加载约需数秒
      </motion.p>
    </div>
  );
}
