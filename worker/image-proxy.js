/**
 * Cloudflare Worker: 豆瓣图片代理
 *
 * 豆瓣图片服务器会检查 Referer 头，直接从浏览器请求会被拒绝。
 * 此 Worker 作为代理，添加必要的请求头来绕过限制。
 *
 * 部署方式: wrangler deploy --config worker/wrangler.toml
 * 使用方式: https://<worker-domain>/image?url=<encoded-douban-image-url>
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 仅处理 /image 路径
    if (url.pathname !== "/image") {
      return new Response("Not Found", { status: 404 });
    }

    const imageUrl = url.searchParams.get("url");
    if (!imageUrl) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }

    // 安全校验：仅允许豆瓣域名的图片
    const ALLOWED_HOSTS = [
      "img1.doubanio.com",
      "img2.doubanio.com",
      "img3.doubanio.com",
      "img9.doubanio.com",
    ];

    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return new Response("Forbidden: only douban images allowed", {
        status: 403,
      });
    }

    // 向豆瓣请求图片，附带必要的请求头
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:150.0) Gecko/20100101 Firefox/150.0",
        Accept:
          "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
        "Accept-Language":
          "zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5",
        Referer: "https://movie.douban.com/",
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch image", { status: response.status });
    }

    // 返回图片，设置缓存和 CORS 头
    const imageResponse = new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });

    return imageResponse;
  },
};
