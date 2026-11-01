// World News24 — हर खबर का अपना पेज: /post/123
// Google/WhatsApp/Facebook को पूरा HTML (title, description, फोटो, खबर) सीधे मिलता है।

const SUPABASE_URL = "https://djisddzzclxekdvovcdz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaXNkZHp6Y2x4ZWtkdm92Y2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODEzNjcsImV4cCI6MjEwODg1NzM2N30.xKLhwRdXNVhkY4oZq6b8J27aymel9kH-JT_rChDeTWQ";
// अपना डोमेन बदलने पर सिर्फ़ यही लाइन (या Netlify में SITE_URL environment variable) बदलें
const SITE_URL = (process.env.SITE_URL || "https://astonishing-sprinkles-5e3025.netlify.app").replace(/\/$/, "");
const FALLBACK_IMG = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function sb(query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/news?${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!r.ok) throw new Error("Supabase " + r.status);
  return r.json();
}

const HEAD_CSS = `
:root{--red:#d71920;--ink:#111827;--muted:#667085;--line:#e5e7eb;--bg:#f5f7fb}
*{box-sizing:border-box}body{margin:0;font-family:Arial,"Noto Sans Devanagari",sans-serif;color:var(--ink);background:var(--bg)}
a{color:inherit;text-decoration:none}
header{background:#fff;border-bottom:1px solid var(--line)}.head{max-width:1000px;margin:auto;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:10px}.logo{background:var(--red);color:#fff;font-weight:900;font-size:20px;padding:10px 8px;border-radius:7px;letter-spacing:-1px}
.brand b{font-size:22px;font-weight:900;letter-spacing:-1px}.brand b span{color:var(--red)}
.home{font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:6px;padding:9px 12px;background:#fff}.home:hover{border-color:var(--red);color:var(--red)}
main{max-width:820px;margin:22px auto;padding:0 18px}
.article{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.article img.cover{width:100%;max-height:430px;object-fit:cover;display:block}
.abody{padding:24px 26px 30px}
.tag{display:inline-block;background:var(--red);color:#fff;border-radius:3px;padding:5px 8px;font-size:11px;font-weight:800}
h1{font-size:clamp(24px,4vw,34px);line-height:1.3;margin:12px 0}
.ameta{font-size:12px;color:var(--muted);margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.asummary{font-size:18px;font-weight:700;line-height:1.6;color:#344054;margin:0 0 18px}
.atext p{font-size:17px;line-height:1.85;margin:0 0 16px;color:#1f2937}
.src{font-size:12px;color:var(--muted)}.src a{color:var(--red)}
.share{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}
.share a,.share button{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:6px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
.share a:hover,.share button:hover{border-color:var(--red);color:var(--red)}
.ad-wrap{margin:18px auto;text-align:center}.ad-label{font-size:10px;color:#98a2b3;letter-spacing:1.5px;margin-bottom:5px}
.ad-box{display:flex;justify-content:center;overflow:hidden;max-width:100%}
.sponsor-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px dashed #cbd5e1;border-radius:9px;padding:14px 16px;margin:18px 0}
.sponsor-bar span{font-size:10px;color:#98a2b3;letter-spacing:1.5px}.sponsor-bar a{font-size:14px;font-weight:700}.sponsor-bar a:hover{color:var(--red)}.sponsor-bar em{font-style:normal;color:var(--red);font-weight:800;font-size:13px}
.sec{display:flex;border-bottom:2px solid var(--ink);margin:26px 0 14px}.sec h2{font-size:18px;margin:0;background:var(--ink);color:#fff;padding:9px 14px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.rcard{display:flex;background:#fff;border:1px solid var(--line);border-radius:9px;overflow:hidden;min-height:100px}
.rcard img{width:36%;object-fit:cover}.rcard div{padding:11px}.rcard small{color:var(--muted);font-size:11px}.rcard h3{font-size:15px;line-height:1.4;margin:4px 0 0}
.rcard:hover{border-color:var(--red)}
footer{margin-top:40px;background:#101827;color:#aab4c4;padding:24px 18px;text-align:center;font-size:12px;border-top:4px solid var(--red)}
footer a{color:#fff}
@media(max-width:640px){.grid{grid-template-columns:1fr}.abody{padding:18px 16px 24px}.atext p{font-size:16px}.sponsor-bar{flex-direction:column;align-items:flex-start}}
`;

const AD_HELPER = `
function adBanner(show,key,w,h){
  if(!show)return;
  var o="{'key':'"+key+"','format':'iframe','height':"+h+",'width':"+w+",'params':{}}";
  document.write('<div class="ad-box" style="min-height:'+h+'px"><scr'+'ipt>atOptions='+o+';</scr'+'ipt><scr'+'ipt src="https://bicea.org/22/'+key+'"></scr'+'ipt></div>');
}
var AD_MOBILE=window.matchMedia("(max-width:760px)").matches;
var AD_DESKTOP=!AD_MOBILE;
`;

function layout({ title, desc, canonical, robots, extraHead, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#d71920">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${esc(canonical)}">
${extraHead || ""}
<script>${AD_HELPER}</script>
<style>${HEAD_CSS}</style>
</head>
<body>
<header><div class="head">
<a class="brand" href="/" aria-label="World News24 Home"><div class="logo">WN24</div><b>WORLD <span>NEWS24</span></b></a>
<a class="home" href="/">← सभी खबरें</a>
</div></header>
${bodyHtml}
<footer>© ${new Date().getFullYear()} <a href="/">World News24</a>. सर्वाधिकार सुरक्षित।</footer>
<!-- Adsterra Popunder -->
<script data-cfasync="false" src="https://afders.org/1/e7beb4e780e59eb7af624e271b1f57b4"></script>
<!-- Adsterra Social Bar -->
<script data-cfasync="false" src="https://bicea.org/14/2312caa7850d318da62734b5806006ac"></script>
</body></html>`;
}

function renderPost(post, related) {
  const url = `${SITE_URL}/post/${post.id}`;
  const title = String(post.title || "").trim();
  const desc = String(post.summary || post.content || "").replace(/\s+/g, " ").trim().slice(0, 155);
  const img = post.image || FALLBACK_IMG;
  const author = post.author || "World News24";
  const iso = post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString();
  const dateText = new Date(iso).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const paras = String(post.content || post.summary || "")
    .split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: title.slice(0, 110),
    description: desc,
    image: [img],
    datePublished: iso,
    dateModified: iso,
    articleSection: post.category || "समाचार",
    inLanguage: "hi",
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: "World News24", logo: { "@type": "ImageObject", url: FALLBACK_IMG } },
  };
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  const relHtml = related.length
    ? `<div class="sec"><h2>और खबरें</h2></div><section class="grid">${related
        .map((r) => `<a class="rcard" href="/post/${esc(r.id)}"><img loading="lazy" src="${esc(r.image || FALLBACK_IMG)}" alt=""><div><small>${esc(r.category)}</small><h3>${esc(r.title)}</h3></div></a>`)
        .join("")}</section>`
    : "";

  const extraHead = `
<meta property="og:type" content="article">
<meta property="og:site_name" content="World News24">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:locale" content="hi_IN">
<meta property="article:published_time" content="${esc(iso)}">
<meta property="article:section" content="${esc(post.category || "")}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script type="application/ld+json">${ldJson}</script>`;

  const shareText = encodeURIComponent(title + " " + url);
  const bodyHtml = `
<div class="ad-wrap" style="max-width:820px;padding:0 18px"><div class="ad-label">विज्ञापन</div>
<script>adBanner(AD_DESKTOP,'906b652d97e7508c12a4ba75c8ebb2d8',728,90);adBanner(AD_MOBILE,'73fd81e802a403d9e8069b9d0c2a18f1',320,50);</script>
</div>
<main>
<article class="article">
<img class="cover" src="${esc(img)}" alt="${esc(title)}">
<div class="abody">
<span class="tag">${esc(post.category || "समाचार")}</span>
<h1>${esc(title)}</h1>
<div class="ameta">${esc(author)} · <time datetime="${esc(iso)}">${esc(dateText)}</time></div>
${post.content && post.summary ? `<p class="asummary">${esc(post.summary)}</p>` : ""}
<div class="atext">${paras}</div>
${post.source_url ? `<p class="src">स्रोत: <a href="${esc(post.source_url)}" target="_blank" rel="noopener noreferrer nofollow">मूल स्रोत ↗</a></p>` : ""}
<div class="share">
<a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener noreferrer">WhatsApp पर शेयर</a>
<a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer">Facebook</a>
<a href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank" rel="noopener noreferrer">X</a>
</div>
</div>
</article>

<div class="sponsor-bar"><span>SPONSORED</span><a href="https://arwf.org/4/21484c20866fcdee0df1570c2b531796" target="_blank" rel="nofollow sponsored noopener">विशेष ऑफ़र और सिफ़ारिशें देखें</a><em>देखें ↗</em></div>

<div class="ad-wrap"><div class="ad-label">विज्ञापन</div>
<script>adBanner(true,'ae5ef13ece87d9a3f65f4a1c6146bc1b',300,250);</script>
</div>

${relHtml}
</main>`;

  return layout({ title: `${title} | World News24`, desc, canonical: url, robots: "index,follow,max-image-preview:large", extraHead, bodyHtml });
}

function notFound() {
  return {
    statusCode: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" },
    body: layout({
      title: "खबर नहीं मिली | World News24",
      desc: "यह खबर उपलब्ध नहीं है।",
      canonical: SITE_URL + "/",
      robots: "noindex",
      bodyHtml: `<main><div class="article"><div class="abody"><h1>यह खबर नहीं मिली</h1><p>हो सकता है यह खबर हटा दी गई हो या लिंक गलत हो।</p><p><a class="home" href="/">← होम पेज पर जाएँ</a></p></div></div></main>`,
    }),
  };
}

exports.handler = async (event) => {
  const m = String(event.path || event.rawUrl || "").match(/\/post\/(\d+)/);
  if (!m) return notFound();
  let post, related = [];
  try {
    const rows = await sb(`select=*&id=eq.${m[1]}&limit=1`);
    post = rows[0];
    if (post) related = await sb(`select=id,title,image,category,created_at&id=neq.${m[1]}&order=created_at.desc&limit=4`);
  } catch (e) {
    return { statusCode: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }, body: "खबर अभी लोड नहीं हो पाई। थोड़ी देर बाद फिर कोशिश करें।" };
  }
  if (!post) return notFound();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
    body: renderPost(post, related),
  };
};
