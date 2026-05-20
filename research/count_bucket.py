import pandas as pd
import numpy as np

df = pd.read_csv("movies_exported.csv")

# 2. log 变换（避免 log(0)）
df["log_rating_count"] = np.log10(df["rating_count"] + 1)

# 3. 固定区间分桶
bins = [0, 3.5, 4, 5, np.inf]
labels = ["D", "C", "B", "A"]

df["bucket"] = pd.cut(
    df["log_rating_count"],
    bins=bins,
    labels=labels,
    right=False
)

print("切分完成")
# 4. 统计：每桶数量 + 原始 rating_count 均值
result = df.groupby("bucket").agg(
    count=("rating_count", "size"),
    mean_rating_count=("rating_count", "mean"),
    median_rating_count=("rating_count", "median"),
    mean_log_rating_count=("log_rating_count", "mean")
).reset_index()

print(result)
