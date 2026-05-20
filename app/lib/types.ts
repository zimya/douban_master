/**
 * 豆瓣条目数据结构
 */
export interface Movie {
  id: number;
  title: string;
  rating: number;
  rating_count: number;
  year: number;
  cover_url: string;
  bucket: Bucket;
}

/**
 * 数据桶分类
 * A: 高热度 (log10(rating_count+1) >= 5, 即评分人数 >= 10万)
 * B: 中高热度 (log10(rating_count+1) in [4, 5), 即评分人数 1万~10万)
 * C: 中热度 (log10(rating_count+1) in [3.5, 4), 即评分人数 ~3000~10000)
 * D: 低热度 (log10(rating_count+1) < 3.5, 即评分人数 < ~3000)
 */
export type Bucket = "A" | "B" | "C" | "D";

/**
 * 游戏阶段
 */
export type GamePhase = "novice" | "apprentice" | "expert" | "master";

/**
 * 游戏阶段配置
 */
export interface PhaseConfig {
  /** 阶段名称（中文） */
  name: string;
  /** 该阶段的题目数量（master 阶段为无限） */
  questionCount: number;
  /** 是否为无限模式 */
  infinite: boolean;
  /** 从哪些桶中抽取题目 */
  buckets: Bucket[];
  /** 最小评分差（用于控制难度） */
  minRatingDiff: number;
}

/**
 * 游戏状态
 */
export interface GameState {
  /** 当前阶段 */
  phase: GamePhase;
  /** 当前阶段内的题目序号（从 0 开始） */
  questionIndex: number;
  /** 总答题数 */
  totalAnswered: number;
  /** 剩余血量 */
  lives: number;
  /** 左侧条目 */
  leftMovie: Movie | null;
  /** 右侧条目 */
  rightMovie: Movie | null;
  /** 预加载的下一个条目（当前轮显示时已在后台加载图片） */
  nextMovie: Movie | null;
  /** 已抽取过的条目 ID 集合（防止重复） */
  usedIds: Set<number>;
  /** 游戏是否结束 */
  isGameOver: boolean;
  /** 游戏是否通关 */
  isVictory: boolean;
  /** 当前回合的答题结果（用于动画） */
  roundResult: "correct" | "wrong" | null;
}
