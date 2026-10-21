export default async () => {
  const feedUrl = "https://news.google.com/rss/search?q=football+transfer+news&hl=en-IN&gl=IN&ceid=IN:en";
  try {
    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "FCNEWS26 transfer news feed" },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error("Upstream feed request failed");
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 20).map((match, index) => {
      const block = match[1];
      const get = (tag) => {
        const found = block.match(new RegExp(`<${tag}[^>]*>([\\\\s\\\\S]*?)<\\\\/${tag}>`, "i"));
        if (!found) return "";
        return found[1].replace(/<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/g, "$1")
          .replace(/<[^>]*>/g, " ")
          .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\\d+);/g, (_, n) => String.fromCharCode(Number(n)))
          .replace(/\\s+/g, " ").trim();
      };
      const title = get("title");
      const link = get("link");
      const pubDate = get("pubDate");
      const source = get("source") || "Google News feed";
      const description = get("description").replace(/https?:\\/\\/\\S+/g, "").slice(0, 260);
      return { id: `${index}-${title}`, title, url: link, date: pubDate ? new Date(pubDate).toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"}) : "LATEST", source, description };
    }).filter(item => item.title && item.url);
    return new Response(JSON.stringify({ articles: items, updatedAt: new Date().toISOString() }), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=900", "access-control-allow-origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ articles: [], error: "Transfer news feed temporarily unavailable" }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" }
    });
  }
};

export const config = { path: "/api/transfers" };
