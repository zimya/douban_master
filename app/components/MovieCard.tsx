"use client";

import { motion } from "framer-motion";
import { Movie } from "../lib/types";
import { getProxiedImageUrl } from "../lib/imageProxy";

interface MovieCardProps {
  movie: Movie;
  /** 当前轮是否揭示评分（点击后的遮罩动画） */
  revealed: boolean;
  /** 评分是否已知（上一轮揭示过，显示在信息栏中） */
  ratingKnown: boolean;
  /** 卡片位置，用于入场动画方向 */
  side: "left" | "right";
  /** 点击回调（用户选择此卡片为评分更高的） */
  onClick: () => void;
  /** 是否禁用点击（揭示阶段禁用） */
  disabled: boolean;
}

/**
 * 可点击的电影卡片
 * 展示封面图 + 标题 + 年份 + 评分（已知时）或问号
 * 点击表示"我认为这部评分更高"
 */
export function MovieCard({
  movie,
  revealed,
  ratingKnown,
  side,
  onClick,
  disabled,
}: MovieCardProps) {
  return (
    <motion.button
      key={movie.id}
      initial={{ opacity: 0, x: side === "left" ? -30 : 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center w-full cursor-pointer
        disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-[#00b51d] rounded-2xl"
      aria-label={`选择 ${movie.title}`}
    >
      {/* 卡片主体 */}
      <div
        className={`relative w-full max-w-[180px] md:max-w-[280px] rounded-2xl overflow-hidden
          shadow-xl shadow-black/20 transition-all duration-200
          ${!disabled ? "hover:shadow-[#00b51d]/30 hover:scale-[1.03] active:scale-[0.97]" : ""}`}
      >
        {/* 封面图 */}
        <div className="aspect-[2/3] w-full">
          <img
            src={getProxiedImageUrl(movie.cover_url)}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* 底部信息栏：标题 + 年份 + 评分/问号 */}
        <div className="bg-white/95 backdrop-blur-sm px-3 py-2.5 md:px-4 md:py-3 border-t border-gray-100">
          <h3 className="text-sm md:text-base font-bold text-gray-800 line-clamp-1 leading-tight">
            {movie.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            {movie.year}
          </p>
          {/* 评分行：已知显示评分，未知显示问号 */}
          <div className="mt-1.5 flex items-center gap-1">
            {ratingKnown ? (
              <>
                <span className="text-yellow-400 font-bold text-sm md:text-base">
                  {movie.rating.toFixed(1)}
                </span>
                <span className="text-gray-500 text-xs">
                  / {formatRatingCount(movie.rating_count)}人
                </span>
              </>
            ) : (
              <span className="text-gray-500 font-bold text-sm md:text-base">
                ???
              </span>
            )}
          </div>
        </div>

        {/* 当前轮揭示评分的遮罩动画 */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-yellow-400">
                {movie.rating.toFixed(1)}
              </div>
              <div className="text-xs md:text-sm text-gray-200 mt-1">
                {formatRatingCount(movie.rating_count)} 人评价
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

/**
 * 格式化评分人数
 * 例: 540605 -> "54.1万"
 */
function formatRatingCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + "万";
  }
  return count.toLocaleString();
}
