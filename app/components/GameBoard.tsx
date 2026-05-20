"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { BucketedMovies } from "../lib/dataLoader";
import { useGame } from "../hooks/useGame";
import { PHASE_CONFIGS, PHASE_ORDER } from "../lib/constants";
import { GamePhase } from "../lib/types";
import { GameHeader, GameStats } from "./GameHeader";
import { MovieCard } from "./MovieCard";
import { RoundFeedback } from "./RoundFeedback";
import { PhaseTransition } from "./PhaseTransition";
import { GameOver } from "./GameOver";
import { getProxiedImageUrl } from "../lib/imageProxy";

interface GameBoardProps {
  data: BucketedMovies;
}

/**
 * 游戏主面板
 * 用户点击他认为评分更高的卡片来进行游戏
 */
export function GameBoard({ data }: GameBoardProps) {
  const { gameState, pendingGameOver, handleGuess, restart } = useGame(data);

  /** 是否显示阶段过渡动画 */
  const [showPhaseTransition, setShowPhaseTransition] = useState(true);

  /**
   * 左侧卡片的评分是否已知
   * - 游戏开始时为 false（两张都是新的）
   * - 切换后为 true（旧右边变成新左边，评分已揭示过）
   */
  const [leftRatingKnown, setLeftRatingKnown] = useState(false);

  /** 记录上一次的阶段，用于检测阶段变化 */
  const prevPhaseRef = useRef<GamePhase>(gameState.phase);

  /** 记录上一轮的 totalAnswered，用于检测切换发生 */
  const prevTotalRef = useRef(gameState.totalAnswered);

  // 检测阶段变化时显示过渡动画
  useEffect(() => {
    if (gameState.phase !== prevPhaseRef.current) {
      setShowPhaseTransition(true);
      prevPhaseRef.current = gameState.phase;
    }
  }, [gameState.phase]);

  // 检测卡片切换（roundResult 从非 null 变为 null，说明切换完成）
  // 切换完成后，左边的评分变为已知
  useEffect(() => {
    if (gameState.roundResult === null && prevTotalRef.current !== gameState.totalAnswered) {
      setLeftRatingKnown(true);
      prevTotalRef.current = gameState.totalAnswered;
    }
  }, [gameState.roundResult, gameState.totalAnswered]);

  // 预加载下一轮的电影封面图片
  useEffect(() => {
    if (gameState.nextMovie) {
      const img = new Image();
      img.src = getProxiedImageUrl(gameState.nextMovie.cover_url);
    }
  }, [gameState.nextMovie]);

  // 重新开始时重置
  const handleRestart = () => {
    setLeftRatingKnown(false);
    restart();
  };

  // 游戏结束或通关（等待停顿结束后再显示结算界面）
  if ((gameState.isGameOver || gameState.isVictory) && !pendingGameOver) {
    return <GameOver gameState={gameState} onRestart={handleRestart} />;
  }

  // 等待数据就绪
  if (!gameState.leftMovie || !gameState.rightMovie) {
    return null;
  }

  /** 是否处于揭示阶段（已猜但还没切换） */
  const isRevealed = gameState.roundResult !== null;

  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col bg-white">
      {/* 阶段过渡 */}
      <AnimatePresence>
        {showPhaseTransition && (
          <PhaseTransition
            phase={gameState.phase}
            onContinue={() => setShowPhaseTransition(false)}
          />
        )}
      </AnimatePresence>

      {/* 回合反馈 */}
      <RoundFeedback result={gameState.roundResult} />

      {/* 顶部信息栏 */}
      <GameHeader gameState={gameState} />

      {/* 提示语 */}
      <div className="text-center pt-1 pb-0.5 md:pt-2 md:pb-1">
        <h2 className="text-base md:text-xl font-medium text-gray-700">
          哪部影视的评分更高？
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          点击你认为评分更高的那部
        </p>
      </div>

      {/* 状态栏：连击、已答、血量 */}
      <GameStats gameState={gameState} />

      {/* 卡片区域 */}
      <div className="flex-1 flex flex-row items-center justify-center gap-4 md:gap-10 px-4 py-1 md:py-2">
        {/* 左侧卡片 */}
        <div className="flex-1 flex items-center justify-center max-w-[200px] md:max-w-[280px]">
          <MovieCard
            movie={gameState.leftMovie}
            revealed={isRevealed}
            ratingKnown={leftRatingKnown}
            side="left"
            onClick={() => handleGuess("left")}
            disabled={isRevealed}
          />
        </div>

        {/* VS 分隔 */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <span className="text-gray-400 font-bold text-lg md:text-2xl">
            VS
          </span>
        </div>

        {/* 右侧卡片：评分永远未知（等待揭示） */}
        <div className="flex-1 flex items-center justify-center max-w-[200px] md:max-w-[280px]">
          <MovieCard
            movie={gameState.rightMovie}
            revealed={isRevealed}
            ratingKnown={false}
            side="right"
            onClick={() => handleGuess("right")}
            disabled={isRevealed}
          />
        </div>
      </div>

      {/* 底部进度条 */}
      <ProgressBar
        phase={gameState.phase}
        questionIndex={gameState.questionIndex}
      />
    </div>
  );
}

/**
 * 底部进度条组件
 * 显示整体游戏进度和各阶段标签
 */
function ProgressBar({
  phase,
  questionIndex,
}: {
  phase: GamePhase;
  questionIndex: number;
}) {
  const config = PHASE_CONFIGS[phase];
  const phaseIndex = PHASE_ORDER.indexOf(phase);

  // 计算总进度百分比
  const totalPhases = PHASE_ORDER.length;
  const baseProgress = phaseIndex / totalPhases;
  const phaseProgress = config.infinite
    ? Math.min(questionIndex * 0.01, 0.2) / totalPhases
    : (questionIndex / config.questionCount) / totalPhases;

  const progress = Math.min((baseProgress + phaseProgress) * 100, 100);

  return (
    <div className="w-full px-4 pb-3 md:pb-4">
      <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00b51d] to-[#00d422] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 md:mt-2 text-[10px] md:text-xs text-gray-400">
        {PHASE_ORDER.map((p, i) => (
          <span
            key={p}
            className={
              i <= phaseIndex ? "text-[#00b51d] font-medium" : "text-gray-400"
            }
          >
            {PHASE_CONFIGS[p].name}
          </span>
        ))}
      </div>
    </div>
  );
}
