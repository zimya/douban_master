-- 游戏记录表（每次游戏完整记录，目前只写不读）
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_answered INTEGER NOT NULL,
  max_streak INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 总答题数分布统计表
-- count: 答题数值 (1, 2, 3, ...)
-- total_answered: 有多少次游戏达到了这个答题数
CREATE TABLE IF NOT EXISTS stats_total_answered (
  count INTEGER PRIMARY KEY,
  total_answered INTEGER NOT NULL DEFAULT 0
);

-- 最高连击分布统计表
-- count: 连击数值 (1, 2, 3, ...)
-- max_streak: 有多少次游戏达到了这个最高连击
CREATE TABLE IF NOT EXISTS stats_max_streak (
  count INTEGER PRIMARY KEY,
  max_streak INTEGER NOT NULL DEFAULT 0
);
