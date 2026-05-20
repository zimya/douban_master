import { unzipSync } from "fflate";
import Papa from "papaparse";
import { Bucket, Movie } from "./types";
import { DATA_ZIP_PATH, CSV_FILENAME } from "./constants";

/**
 * 按桶分类的电影数据
 * key 为桶标签 (A/B/C/D)，value 为该桶内的电影数组
 */
export type BucketedMovies = Record<Bucket, Movie[]>;

/**
 * 从服务器加载压缩的 CSV 数据，解压并解析为按桶分类的电影列表
 */
export async function loadMovieData(): Promise<BucketedMovies> {
  // 1. 下载 zip 文件
  const response = await fetch(DATA_ZIP_PATH);
  const arrayBuffer = await response.arrayBuffer();
  const zipData = new Uint8Array(arrayBuffer);

  // 2. 使用 fflate 解压
  const unzipped = unzipSync(zipData);

  // 找到 CSV 文件（zip 内可能有多个文件，按文件名匹配）
  const csvKey = Object.keys(unzipped).find(
    (name) => name === CSV_FILENAME || name.endsWith(".csv")
  );
  if (!csvKey) {
    throw new Error(`在 zip 中未找到 CSV 文件: ${CSV_FILENAME}`);
  }

  const csvBytes = unzipped[csvKey];
  const csvText = new TextDecoder("utf-8").decode(csvBytes);

  // 3. 使用 PapaParse 解析 CSV
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  // 4. 转换为 Movie 对象并按桶分类
  const bucketed: BucketedMovies = { A: [], B: [], C: [], D: [] };

  for (const row of parsed.data) {
    const movie: Movie = {
      id: parseInt(row.id, 10),
      title: row.title,
      rating: parseFloat(row.rating),
      rating_count: parseInt(row.rating_count, 10),
      year: parseInt(row.year, 10),
      cover_url: row.cover_url,
      bucket: row.bucket as Bucket,
    };

    // 数据校验：跳过无效记录
    if (isNaN(movie.id) || isNaN(movie.rating) || !movie.bucket) {
      continue;
    }

    if (bucketed[movie.bucket]) {
      bucketed[movie.bucket].push(movie);
    }
  }

  return bucketed;
}
