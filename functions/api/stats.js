/**
 * Cloudflare Pages Function: 游戏统计 API
 *
 * POST /api/stats - 保存一次游戏记录（写入 games 表 + 更新分布统计表）
 * GET /api/stats - 获取总答题数分布（从 stats_total_answered 表读取）
 */

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const db = env.DB;

  if (request.method === "POST") {
    return handlePost(request, db, corsHeaders);
  }

  if (request.method === "GET") {
    return handleGet(request, db, corsHeaders);
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
}

async function handlePost(request, db, corsHeaders) {
  try {
    const body = await request.json();
    const { totalAnswered, maxStreak, duration } = body;

    if (
      typeof totalAnswered !== "number" ||
      typeof maxStreak !== "number" ||
      typeof duration !== "number"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 写入完整游戏记录（只写不读）
    await db
      .prepare(
        "INSERT INTO games (total_answered, max_streak, duration) VALUES (?, ?, ?)"
      )
      .bind(totalAnswered, maxStreak, duration)
      .run();

    // 更新总答题数分布统计（UPSERT）
    await db
      .prepare(
        `INSERT INTO stats_total_answered (count, total_answered) VALUES (?, 1)
         ON CONFLICT(count) DO UPDATE SET total_answered = total_answered + 1`
      )
      .bind(totalAnswered)
      .run();

    // 更新最高连击分布统计（UPSERT）
    await db
      .prepare(
        `INSERT INTO stats_max_streak (count, max_streak) VALUES (?, 1)
         ON CONFLICT(count) DO UPDATE SET max_streak = max_streak + 1`
      )
      .bind(maxStreak)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleGet(request, db, corsHeaders) {
  try {
    // 读取总答题数分布（行数很少，每个不同的答题数只有一行）
    const distribution = await db
      .prepare("SELECT count, total_answered FROM stats_total_answered ORDER BY count")
      .all();

    return new Response(
      JSON.stringify({
        distribution: distribution.results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
