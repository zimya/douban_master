import { GamePhase, PhaseConfig } from "./types";

/**
 * 图片代理 Worker 地址
 * 豆瓣图片服务器会校验 Referer，需要通过 Worker 代理请求。
 * 部署后替换为你的 Worker 域名。
 */
export const IMAGE_PROXY_URL = "/api/image";

/** 玩家初始血量 */
export const INITIAL_LIVES = 5;

/** 数据文件路径（相对于 public 目录） */
export const DATA_ZIP_PATH = "/data.zip";

/** zip 内的 CSV 文件名 */
export const CSV_FILENAME = "movies_exported.csv";

/**
 * 各阶段配置
 * - novice: 豆瓣新手，10 题，从 A 桶抽取，评分差 > 1
 * - apprentice: 豆瓣学徒，10 题，从 A/B 桶抽取，评分差 > 0.5
 * - veteran: 豆瓣老手，10 题，从 B/C 桶抽取，评分差 > 0.5
 * - expert: 豆瓣专家，5 题，从 C/D 桶抽取，评分差 > 0.5
 * - master: 豆瓣大师，无限题，从 D 桶抽取，评分差 > 0.1
 */
export const PHASE_CONFIGS: Record<GamePhase, PhaseConfig> = {
  novice: {
    name: "豆瓣新手",
    questionCount: 10,
    infinite: false,
    buckets: ["A"],
    minRatingDiff: 1,
  },
  apprentice: {
    name: "豆瓣学徒",
    questionCount: 10,
    infinite: false,
    buckets: ["A", "B"],
    minRatingDiff: 0.5,
  },
  veteran: {
    name: "豆瓣老手",
    questionCount: 10,
    infinite: false,
    buckets: ["B", "C"],
    minRatingDiff: 0.5,
  },
  expert: {
    name: "豆瓣专家",
    questionCount: 5,
    infinite: false,
    buckets: ["C", "D"],
    minRatingDiff: 0.3,
  },
  master: {
    name: "豆瓣大师",
    questionCount: 5,
    infinite: true,
    buckets: ["D"],
    minRatingDiff: 0.1,
  },
};

/** 阶段顺序 */
export const PHASE_ORDER: GamePhase[] = [
  "novice",
  "apprentice",
  "veteran",
  "expert",
  "master",
];

/**
 * 各阶段通过后的结束语
 */
export const PHASE_COMPLETION_MESSAGES: Record<GamePhase, string> = {
  novice: "🎬 恭喜你通过了新手试炼！你已经对豆瓣热门影视有了基本认知。",
  apprentice: "📚 学徒阶段完成！你对中等热度的作品也有不错的判断力。",
  veteran: "🎯 老手阶段完成！你对冷门片的判断力已经相当不错了。",
  expert: "🏆 专家认证通过！你对冷门佳作的嗅觉令人佩服。",
  master: "👑 你已经是真正的豆瓣大师！没有什么影视作品能难倒你。",
};

/** 游戏结束（血量耗尽）时各阶段的结算语 */
export const GAME_OVER_MESSAGES: Record<GamePhase, string> = {
  novice:
    "运气有些背哟！不过没关系，每一次尝试都是对电影的热爱。",
  apprentice:
    "你是一个不折不扣的影迷，豆瓣top250想必你已烂熟于心，看到片名就知道分数。但是冷门片还要加强哦！",
  veteran:
    "哎呀，老司机翻车啦~不过别灰心，你只是被冷门片摆了一道，你离大师只有一部《逐梦演艺圈》的距离！",
  expert:
    "恐怖如斯！你的阅片量连硬盘都望尘莫及。你还是研究豆瓣评分的专家，距离大师已经不远了，再接再厉！",
  master:
    "太强了！你简直是人行自走影视库，当之无愧的豆瓣大师，《731》开分前都得问问你！",
};

/** 抽题最大重试次数（防止死循环） */
export const MAX_DRAW_ATTEMPTS = 100;
