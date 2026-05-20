import csv
import math


def load_columns(filepath: str):
    """从 CSV 文件中读取 rating 和 rating_count 两列数据。"""
    ratings = []
    rating_counts = []

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                ratings.append(float(row["rating"]))
                rating_counts.append(int(row["rating_count"]))
            except (ValueError, KeyError):
                continue

    return ratings, rating_counts


def mean(values: list[float]) -> float:
    """计算均值。"""
    if not values:
        return 0.0
    return sum(values) / len(values)


def std(values: list[float]) -> float:
    """计算总体标准差。"""
    if not values:
        return 0.0
    avg = mean(values)
    variance = sum((x - avg) ** 2 for x in values) / len(values)
    return math.sqrt(variance)


def main():
    filepath = "movies_exported.csv"
    ratings, rating_counts = load_columns(filepath)

    print(f"共计 {len(ratings)} 条有效记录\n")
    print(f"{'字段':<15}{'均值':<15}{'标准差':<15}")
    print("-" * 45)
    print(f"{'rating':<15}{mean(ratings):<15.4f}{std(ratings):<15.4f}")
    print(f"{'rating_count':<15}{mean(rating_counts):<15.2f}{std(rating_counts):<15.2f}")


if __name__ == "__main__":
    main()
