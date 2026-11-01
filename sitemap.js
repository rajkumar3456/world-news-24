// /sitemap.xml — होम पेज + हर प्रकाशित खबर। Google Search Console में यही लिंक जमा करें।

const SUPABASE_URL = "https://djisddzzclxekdvovcdz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaXNkZHp6Y2x4ZWtkdm92Y2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODEzNjcsImV4cCI6MjEwODg1NzM2N30.xKLhwRdXNVhkY4oZq6b8J27aymel9kH-JT_rChDeTWQ";
const SITE_URL = (process.env.SITE_URL || "https://astonishing-sprinkles-5e3025.netlify.app").replace(/\/$/, "");

exports.handler = async () => {
  let rows = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/news?select=id,created_at&order=created_at.desc&limit=1000`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!r.ok) throw new Error("Supabase " + r.status);
    rows = await r.json();
  } catch (e) {
    return { statusCode: 502, headers: { "Content-Type": "text/plain" }, body: "sitemap unavailable" };
  }
  const latest = rows[0] && rows[0].created_at ? new Date(rows[0].created_at).toISOString() : new Date().toISOString();
  const urls = [`<url><loc>${SITE_URL}/</loc><lastmod>${latest}</lastmod><changefreq>hourly</changefreq><priority>1.0</priority></url>`]
    .concat(rows.map((x) => `<url><loc>${SITE_URL}/post/${x.id}</loc><lastmod>${new Date(x.created_at).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`));
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`,
  };
};
