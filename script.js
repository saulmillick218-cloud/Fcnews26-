const DEMO_NEWS = [
  {id:"demo1",status:"Rumour",headline:"Transfer rumour example — replace with live feed",club:"FCNEWS26",details:"If live news is unavailable, this sample card explains how reports will appear. It is not a current transfer report.",source:"Demo",sourceUrl:"",date:"DEMO"}
];
let activeFilter = "All";
let customNews = [];
try { customNews = JSON.parse(localStorage.getItem("fcnews26_posts") || "[]"); } catch(e) {}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function renderNews(items) {
  const filtered = activeFilter === "All" ? items : items.filter(item => item.status === activeFilter);
  const grid = document.getElementById("news-grid");
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No reports in this category right now.</div>';
    return;
  }
  grid.innerHTML = filtered.map(item => `
    <article class="news-card">
      <div class="card-top"></div><div class="card-content">
      <span class="badge ${escapeHTML((item.status || "Rumour").toLowerCase())}">${escapeHTML(item.status || "Rumour")}</span>
      <h3>${escapeHTML(item.headline || item.title)}</h3>
      <p>${escapeHTML(item.details || item.description || "Open the original report for more information.")}</p>
      <div class="card-meta"><span>${escapeHTML(item.club || "Transfer News")}</span><span>${escapeHTML(item.date || "LATEST")}</span></div>
      <div class="card-meta"><span>Source: ${escapeHTML(item.source || "News feed")}</span>${item.sourceUrl ? `<a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Read report ↗</a>` : ""}</div>
      </div>
    </article>`).join("");
}
async function loadNews() {
  const grid = document.getElementById("news-grid");
  grid.innerHTML = '<div class="empty-state">Loading latest transfer headlines…</div>';
  try {
    const response = await fetch("/api/transfers", { headers: { "Accept": "application/json" }});
    if (!response.ok) throw new Error("Feed unavailable");
    const payload = await response.json();
    const live = Array.isArray(payload.articles) ? payload.articles : [];
    const mapped = live.map((article, index) => ({
      id: article.id || `live-${index}`,
      status: "Rumour",
      headline: article.title || "Transfer news report",
      club: article.source || "Football News",
      details: article.description || "Open the original article for the full report.",
      source: article.source || "Original publisher",
      sourceUrl: article.url || "",
      date: article.date || "LATEST"
    }));
    const all = [...customNews, ...mapped];
    document.getElementById("feed-status").textContent = mapped.length ? `LIVE FEED · ${mapped.length} REPORTS` : "FEED UNAVAILABLE · DEMO";
    renderNews(all);
  } catch (error) {
    document.getElementById("feed-status").textContent = "LIVE FEED UNAVAILABLE";
    renderNews(customNews);
  }
}
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
  loadNews();
}));
document.getElementById("news-form").addEventListener("submit", event => {
  event.preventDefault();
  const headline = document.getElementById("headline").value.trim();
  const details = document.getElementById("details").value.trim();
  const source = document.getElementById("source").value.trim();
  if (!headline || !details || !source) {
    document.getElementById("form-message").textContent = "Please add a headline, details and source.";
    return;
  }
  customNews.unshift({
    id: Date.now(), status: document.getElementById("status").value, headline,
    club: document.getElementById("club").value.trim() || "Transfer News",
    details, source, sourceUrl: /^https?:\/\//i.test(source) ? source : "",
    date: new Date().toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"})
  });
  try { localStorage.setItem("fcnews26_posts", JSON.stringify(customNews)); } catch(e) {}
  event.target.reset();
  document.getElementById("form-message").textContent = "Saved on this device only; this form does not publish to every visitor.";
  loadNews();
});
document.getElementById("year").textContent = new Date().getFullYear();
loadNews();
