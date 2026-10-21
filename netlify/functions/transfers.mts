export default async (request) => {
  const feedUrl =
    "https://news.google.com/rss/search?q=football+transfer&hl=en-IN&gl=IN&ceid=IN:en";

  try {
    const response = await fetch(feedUrl);

    if (!response.ok) {
      throw new Error("Google News feed unavailable");
    }

    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const get = (block, tag) => {
      const match = block.match(
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
      );

      return match
        ? match[1]
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
            .replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .trim()
        : "";
    };

    const articles = items
      .map((item, index) => ({
        id: String(index + 1),
        title: get(item[1], "title"),
        url: get(item[1], "link"),
        date: get(item[1], "pubDate"),
        source: get(item[1], "source") || "Google News",
        description: get(item[1], "description").replace(
          /<[^>]*>/g,
          ""
        ),
      }))
      .filter((item) => item.title && item.url);

    return new Response(JSON.stringify({ articles }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        articles: [],
        error: "Transfer news is temporarily unavailable",
      }),
      {
        status: 502,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      }
    );
  }
};
