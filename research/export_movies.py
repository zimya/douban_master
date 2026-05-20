"""
从 movies.db 中读取数据，剔除 rating 为 0 的记录，
将 id, title, rating, rating_count, year, cover_url 导出为新的 db 和 csv 文件。
"""

import sqlite3
import csv
import math
from pathlib import Path

BASE_DIR = Path(__file__).parent
SOURCE_DB = BASE_DIR / "movies.db"
OUTPUT_DB = BASE_DIR / "movies_exported.db"
OUTPUT_CSV = BASE_DIR / "movies_exported.csv"

COLUMNS = ["id", "title", "rating", "rating_count", "year", "cover_url"]
OUTPUT_COLUMNS = COLUMNS + ["bucket"]

# 分桶逻辑：对 log10(rating_count+1) 按区间划分
# [0, 3.5) -> D, [3.5, 4) -> C, [4, 5) -> B, [5, inf) -> A
BUCKET_BINS = [0, 3.5, 4, 5, float("inf")]
BUCKET_LABELS = ["D", "C", "B", "A"]


def get_bucket(rating_count: int) -> str:
    log_val = math.log10(rating_count + 1)
    for i in range(len(BUCKET_BINS) - 1):
        if BUCKET_BINS[i] <= log_val < BUCKET_BINS[i + 1]:
            return BUCKET_LABELS[i]
    return BUCKET_LABELS[-1]


def export():
    # 连接源数据库，读取数据
    src_conn = sqlite3.connect(SOURCE_DB)
    src_cursor = src_conn.cursor()

    query = f"SELECT {', '.join(COLUMNS)} FROM movies WHERE rating != 0 AND rating_count > 1000"
    src_cursor.execute(query)
    rows = src_cursor.fetchall()
    src_conn.close()

    # 计算 bucket 列（rating_count 是第 4 列，索引 3）
    rows = [row + (get_bucket(row[3]),) for row in rows]

    print(f"共读取 {len(rows)} 条有效记录（已剔除 rating=0 及 rating_count<=1000）")

    # 导出到新的 db
    if OUTPUT_DB.exists():
        OUTPUT_DB.unlink()

    dst_conn = sqlite3.connect(OUTPUT_DB)
    dst_cursor = dst_conn.cursor()

    columns_def = ", ".join([
        "id INTEGER PRIMARY KEY",
        "title TEXT",
        "rating REAL",
        "rating_count INTEGER",
        "year INTEGER",
        "cover_url TEXT",
        "bucket TEXT",
    ])
    dst_cursor.execute(f"CREATE TABLE movies ({columns_def})")

    placeholders = ", ".join(["?"] * len(OUTPUT_COLUMNS))
    dst_cursor.executemany(f"INSERT INTO movies VALUES ({placeholders})", rows)
    dst_conn.commit()
    dst_conn.close()
    print(f"已导出到新数据库: {OUTPUT_DB}")

    # 导出到 csv
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(OUTPUT_COLUMNS)
        writer.writerows(rows)
    print(f"已导出到 CSV 文件: {OUTPUT_CSV}")


if __name__ == "__main__":
    export()
