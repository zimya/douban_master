"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { GameState } from "../lib/types";
import { BucketedMovies } from "../lib/dataLoader";
import {
  createInitialState,
  initializeGame,
  judgeGuess,
  advanceToNext,
} from "../lib/gameEngine";

/** 揭示评分后的停顿时间（毫秒） */
const REVEAL_DELAY = 1500;

/**
 * 游戏状态管理 Hook
 *
 * 交互流程：
 * 1. 用户点击他认为评分更高的卡片 → 揭示两张卡片的评分
 * 2. 停顿 REVEAL_DELAY 后 → 执行卡片切换（评分高的移到左边，新卡片出现在右边）
 */
export function useGame(data: BucketedMovies | null) {
  const [gameState, setGameState] = useState<GameState>(createInitialState());

  /** 是否处于游戏结束前的停顿阶段（让用户看清最后一题结果） */
  const [pendingGameOver, setPendingGameOver] = useState(false);

  /** 防止组件卸载后 setTimeout 回调执行 */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 数据加载完成后初始化游戏
  useEffect(() => {
    if (data) {
      const initial = createInitialState();
      const initialized = initializeGame(initial, data);
      setGameState(initialized);
    }
  }, [data]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /**
   * 处理用户点击卡片
   * @param pickedSide - 用户认为评分更高的那一侧
   */
  const handleGuess = useCallback(
    (pickedSide: "left" | "right") => {
      if (!data || gameState.roundResult !== null) return;
      if (!gameState.leftMovie || !gameState.rightMovie) return;

      // 第一步：判定对错，设置 roundResult（触发评分揭示动画）
      const judged = judgeGuess(gameState, pickedSide);
      setGameState(judged);

      // 如果游戏结束，延迟同样时间后再显示结算界面
      if (judged.isGameOver || judged.isVictory) {
        setPendingGameOver(true);
        timerRef.current = setTimeout(() => {
          setPendingGameOver(false);
        }, REVEAL_DELAY);
        return;
      }

      // 第二步：延迟后执行卡片切换
      timerRef.current = setTimeout(() => {
        setGameState((prev) => {
          const advanced = advanceToNext(prev, data);
          return advanced;
        });
      }, REVEAL_DELAY);
    },
    [data, gameState]
  );

  /**
   * 重新开始游戏
   */
  const restart = useCallback(() => {
    if (!data) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPendingGameOver(false);
    const initial = createInitialState();
    const initialized = initializeGame(initial, data);
    setGameState(initialized);
  }, [data]);

  return {
    gameState,
    pendingGameOver,
    handleGuess,
    restart,
  };
}
