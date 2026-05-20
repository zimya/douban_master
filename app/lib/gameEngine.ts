import { BucketedMovies } from "./dataLoader";
import { Movie, GamePhase, GameState } from "./types";
import {
  PHASE_CONFIGS,
  PHASE_ORDER,
  INITIAL_LIVES,
  MAX_DRAW_ATTEMPTS,
} from "./constants";

/**
 * 从指定桶中随机抽取一个满足评分差条件的电影
 *
 * @param data - 按桶分类的电影数据
 * @param phase - 当前游戏阶段
 * @param referenceMovie - 参考电影（用于计算评分差）
 * @param usedIds - 已使用的电影 ID 集合
 * @returns 抽取到的电影，如果无法满足条件则放宽限制
 */
export function drawMovie(
  data: BucketedMovies,
  phase: GamePhase,
  referenceMovie: Movie | null,
  usedIds: Set<number>
): Movie | null {
  const config = PHASE_CONFIGS[phase];
  const { buckets, minRatingDiff } = config;

  // 合并所有可用桶的电影
  const pool: Movie[] = [];
  for (const bucket of buckets) {
    pool.push(...data[bucket]);
  }

  // 过滤掉已使用的电影
  const available = pool.filter((m) => !usedIds.has(m.id));

  if (available.length === 0) {
    return null;
  }

  // 如果没有参考电影（游戏开始时），直接随机抽取
  if (!referenceMovie) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // 尝试抽取满足评分差条件的电影
  for (let attempt = 0; attempt < MAX_DRAW_ATTEMPTS; attempt++) {
    const candidate = available[Math.floor(Math.random() * available.length)];
    const diff = Math.abs(candidate.rating - referenceMovie.rating);
    if (diff >= minRatingDiff) {
      return candidate;
    }
  }

  // 如果多次尝试后仍无法满足条件，放宽限制直接随机返回
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * 创建初始游戏状态
 */
export function createInitialState(): GameState {
  return {
    phase: "novice",
    questionIndex: 0,
    totalAnswered: 0,
    lives: INITIAL_LIVES,
    leftMovie: null,
    rightMovie: null,
    usedIds: new Set(),
    isGameOver: false,
    isVictory: false,
    roundResult: null,
  };
}

/**
 * 初始化游戏：抽取前两个电影
 */
export function initializeGame(
  state: GameState,
  data: BucketedMovies
): GameState {
  const first = drawMovie(data, state.phase, null, state.usedIds);
  if (!first) return state;

  const newUsedIds = new Set(state.usedIds);
  newUsedIds.add(first.id);

  const second = drawMovie(data, state.phase, first, newUsedIds);
  if (!second) return state;
  newUsedIds.add(second.id);

  return {
    ...state,
    leftMovie: first,
    rightMovie: second,
    usedIds: newUsedIds,
  };
}

/**
 * 获取下一个阶段
 */
function getNextPhase(currentPhase: GamePhase): GamePhase | null {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex < PHASE_ORDER.length - 1) {
    return PHASE_ORDER[currentIndex + 1];
  }
  return null;
}

/**
 * 第一步：判定用户猜测的对错
 *
 * 用户点击他认为评分更高的那张卡片（"left" 或 "right"）。
 * 只更新 roundResult、lives、totalAnswered、questionIndex，
 * 不切换卡片（leftMovie 和 rightMovie 保持不变）。
 * 这样 UI 可以先揭示两张卡片的评分。
 *
 * @param state - 当前游戏状态
 * @param pickedSide - 用户选择的那一侧（认为评分更高的）
 */
export function judgeGuess(
  state: GameState,
  pickedSide: "left" | "right"
): GameState {
  if (!state.leftMovie || !state.rightMovie) return state;

  const leftRating = state.leftMovie.rating;
  const rightRating = state.rightMovie.rating;

  // 用户选了哪边，就看那边是否 >= 另一边
  const isCorrect =
    pickedSide === "left"
      ? leftRating >= rightRating
      : rightRating >= leftRating;

  const newLives = isCorrect ? state.lives : state.lives - 1;
  const newTotalAnswered = state.totalAnswered + 1;
  const newQuestionIndex = state.questionIndex + 1;

  // 血量耗尽 → 游戏结束
  if (newLives <= 0) {
    return {
      ...state,
      lives: 0,
      totalAnswered: newTotalAnswered,
      questionIndex: newQuestionIndex,
      isGameOver: true,
      roundResult: "wrong",
    };
  }

  return {
    ...state,
    lives: newLives,
    totalAnswered: newTotalAnswered,
    questionIndex: newQuestionIndex,
    roundResult: isCorrect ? "correct" : "wrong",
  };
}

/**
 * 第二步：切换卡片
 *
 * 在揭示评分动画结束后调用。
 * 将当前右边移到左边，从对应桶中抽取新的右边，清除 roundResult。
 */
export function advanceToNext(
  state: GameState,
  data: BucketedMovies
): GameState {
  if (!state.rightMovie) return state;

  const config = PHASE_CONFIGS[state.phase];

  // 检查是否完成当前阶段（questionIndex 已在 judgeGuess 中递增）
  const phaseComplete =
    !config.infinite && state.questionIndex >= config.questionCount;

  if (phaseComplete) {
    const nextPhase = getNextPhase(state.phase);

    if (!nextPhase) {
      // 所有阶段完成（理论上不会到这里，master 是 infinite）
      return {
        ...state,
        isVictory: true,
        roundResult: null,
      };
    }

    // 进入下一阶段：当前右边移到左边，从新阶段的桶中抽取新右边
    const newUsedIds = new Set(state.usedIds);
    const newLeft = state.rightMovie;
    const newRight = drawMovie(data, nextPhase, newLeft, newUsedIds);

    if (newRight) {
      newUsedIds.add(newRight.id);
    }

    return {
      ...state,
      phase: nextPhase,
      questionIndex: 0,
      leftMovie: newLeft,
      rightMovie: newRight,
      usedIds: newUsedIds,
      roundResult: null,
    };
  }

  // 正常流转：当前右边移到左边，抽取新的右边
  const newUsedIds = new Set(state.usedIds);
  const newLeft = state.rightMovie;
  const newRight = drawMovie(data, state.phase, newLeft, newUsedIds);

  if (newRight) {
    newUsedIds.add(newRight.id);
  }

  return {
    ...state,
    leftMovie: newLeft,
    rightMovie: newRight,
    usedIds: newUsedIds,
    roundResult: null,
  };
}
