#!/usr/bin/env node
/**
 * scripts/publish.js  (chineselaw.kr — Korean edition)
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE:
 *   node scripts/publish.js          (or: npm run publish)
 *
 * HOW TO PUBLISH A KOREAN ARTICLE:
 *   1. Save the Korean text file in articles-src/ as:
 *        YYYYMMDD-kr.txt
 *      Line 1:   Korean article title
 *      Line 2+:  Article body (blank line = paragraph break)
 *
 *   2. Keep articles-data.js in sync with chinese.law/articles-data.js
 *      (so language-switcher links to other languages work correctly).
 *
 *   3. Run: node scripts/publish.js
 *
 *   4. Commit and push — Cloudflare Pages auto-deploys in ~1 minute.
 */

"use strict";
const fs   = require("fs");
const path = require("path");
const vm   = require("vm");

const ROOT      = path.join(__dirname, "..");
const SRC_DIR   = path.join(ROOT, "articles-src");
const DATA_FILE = path.join(ROOT, "articles-data.js");

const SITE_URL  = "https://chineselaw.kr";   // this site
const MAIN_SITE = "https://chinese.law";     // multilingual master site

const SITE_TITLE_KO = "중국 법률 실무 지식 베이스";
const DISCLAIMER_KO = "면책 고지: 이 웹사이트의 자료는 일반 정보 제공 목적으로만 제공되며 법률 자문을 구성하지 않습니다. 이 웹사이트를 열람하거나 연락하는 행위만으로 변호사-의뢰인 관계가 형성되지 않습니다.";

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJson(str) {
  return String(str).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function isoDate(yyyymmdd) {
  return `${yyyymmdd.slice(0,4)}-${yyyymmdd.slice(4,6)}-${yyyymmdd.slice(6,8)}`;
}

/** Parse a text file → { title, bodyHtml, description } */
function parseTxt(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");
  const title = lines[0].replace(/^#+\s*/, "").trim();
  const body  = lines.slice(1).join("\n").trim();
  const paragraphs = body
    .split(/\n{2,}/)
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
  const bodyHtml = paragraphs.map(p => `<p>${p}</p>`).join("\n    ");
  let description = paragraphs[0] || title;
  if (description.length > 155) description = description.slice(0, 152) + "...";
  return { title, bodyHtml, description };
}

function loadArticlesData() {
  const src = fs.readFileSync(DATA_FILE, "utf8");
  const match = src.match(/var ARTICLES_DATA\s*=\s*(\[[\s\S]*\]);/);
  if (!match) throw new Error("Cannot find ARTICLES_DATA in articles-data.js");
  const ctx = vm.createContext({});
  vm.runInContext("result = " + match[1], ctx);
  return ctx.result;
}

function saveArticlesData(articles) {
  const src = fs.readFileSync(DATA_FILE, "utf8");
  const updated = src.replace(
    /var ARTICLES_DATA\s*=\s*\[[\s\S]*\];/,
    "var ARTICLES_DATA = " + JSON.stringify(articles, null, 2) + ";"
  );
  fs.writeFileSync(DATA_FILE, updated, "utf8");
}

/**
 * Generate one Korean article HTML page for chineselaw.kr.
 * Language switcher: KR = this site, all others → chinese.law.
 */
function makeArticleHtml(slug, title, bodyHtml, date, description, entry) {
  const canonical = `${SITE_URL}/articles/${slug}.html`;

  // hreflang: ko → this site, others → chinese.law
  const hrefLangLines = [
    `  <link rel="alternate" hreflang="ko" href="${SITE_URL}/articles/${slug}.html" />`,
    `  <link rel="alternate" hreflang="en" href="${MAIN_SITE}/articles/${slug}.html" />`,
  ];
  if (entry.ja && entry.ja.title)
    hrefLangLines.push(`  <link rel="alternate" hreflang="ja" href="${MAIN_SITE}/ja/articles/${slug}.html" />`);
  if (entry.fr && entry.fr.title)
    hrefLangLines.push(`  <link rel="alternate" hreflang="fr" href="${MAIN_SITE}/fr/articles/${slug}.html" />`);
  if (entry.ru && entry.ru.title)
    hrefLangLines.push(`  <link rel="alternate" hreflang="ru" href="${MAIN_SITE}/ru/articles/${slug}.html" />`);
  if (entry.es && entry.es.title)
    hrefLangLines.push(`  <link rel="alternate" hreflang="es" href="${MAIN_SITE}/es/articles/${slug}.html" />`);
  hrefLangLines.push(`  <link rel="alternate" hreflang="x-default" href="${MAIN_SITE}/articles/${slug}.html" />`);

  // JSON-LD
  const jsonLdObj = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": date,
    "dateModified": date,
    "inLanguage": "ko",
    "url": canonical,
    "author": { "@type": "Organization", "name": SITE_TITLE_KO, "url": SITE_URL },
    "publisher": { "@type": "Organization", "name": SITE_TITLE_KO, "url": SITE_URL },
    "isPartOf": { "@type": "WebSite", "name": SITE_TITLE_KO, "url": SITE_URL }
  };
  if (entry.tags && entry.tags.length) jsonLdObj.keywords = entry.tags.join(", ");
  const jsonLdStr = escapeJson(JSON.stringify(jsonLdObj, null, 2));

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | ${SITE_TITLE_KO}</title>
  <meta name="description" content="${escapeAttr(description)}" />
  <link rel="canonical" href="${canonical}" />
${hrefLangLines.join("\n")}
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="${escapeAttr(SITE_TITLE_KO)}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="article:published_time" content="${date}" />
  <script type="application/ld+json">
${jsonLdStr}
  </script>
  <style>
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.7;color:#1f2937;background:#f9fafb;}
    .container{max-width:860px;margin:0 auto;padding:24px 16px 56px;}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 28px 32px;}
    h1{font-size:1.7rem;margin:0 0 12px 0;line-height:1.3;}
    .pubmeta{font-size:0.9rem;color:#6b7280;margin-bottom:20px;}
    .article-body p{margin:0 0 1.1em 0;}
    .backlink{display:inline-block;margin-bottom:14px;color:#374151;text-decoration:none;font-size:0.95rem;}
    .backlink:hover{text-decoration:underline;}
    .small{font-size:0.9rem;color:#6b7280;margin-top:20px;}
    .langbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
    .langbar span{font-size:0.8rem;color:#9ca3af;margin-right:2px;}
    .langtag{display:inline-block;padding:3px 9px;border-radius:5px;font-size:0.82rem;font-weight:700;
             text-decoration:none;border:1px solid #d1d5db;color:#374151;background:#fff;letter-spacing:.04em;}
    .langtag:hover{background:#f3f4f6;border-color:#9ca3af;}
    .langtag.current{background:#111827;color:#fff;border-color:#111827;cursor:default;}
    @media(min-width:760px){.container{padding:32px 24px 64px;}h1{font-size:2rem;}}
  </style>
</head>
<body>
  <div class="container">
    <nav class="langbar" id="langbar" aria-label="언어">
      <span>언어:</span>
      <!-- JS로 채워짐 -->
    </nav>
    <a class="backlink" href="/index.html">&larr; 홈</a>
    <article class="card">
      <h1>${title}</h1>
      <div class="pubmeta">${date}</div>
      <div class="article-body">
    ${bodyHtml}
      </div>
    </article>
    <p class="small">${DISCLAIMER_KO}</p>
  </div>
  <script src="../articles-data.js"></script>
  <script>
    (function(){
      var SLUG="${slug}";
      var MAIN="${MAIN_SITE}";
      var bar=document.getElementById("langbar");
      var entry=ARTICLES_DATA.find(function(a){return a.slug===SLUG;});
      if(!entry) return;
      var defs=[
        {l:"en",label:"EN",href:MAIN+"/articles/"+SLUG+".html"},
        {l:"ko",label:"KR",href:"/articles/"+SLUG+".html"},
        {l:"ja",label:"JP",href:MAIN+"/ja/articles/"+SLUG+".html"},
        {l:"fr",label:"FR",href:MAIN+"/fr/articles/"+SLUG+".html"},
        {l:"ru",label:"RU",href:MAIN+"/ru/articles/"+SLUG+".html"},
        {l:"es",label:"ES",href:MAIN+"/es/articles/"+SLUG+".html"},
      ];
      var links=defs.filter(function(d){
        return d.l==="en"||d.l==="ko"||(entry[d.l]&&entry[d.l].title);
      }).map(function(d){
        var cls=d.l==="ko"?" current":"";
        return '<a class="langtag'+cls+'" href="'+d.href+'">'+d.label+'</a>';
      }).join("");
      bar.innerHTML='<span>언어:</span>'+links;
    })();
  </script>
</body>
</html>`;
}

/** Write sitemap.xml listing all Korean article pages */
function generateSitemap(articles) {
  const urls = [];

  urls.push(`  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`);

  for (const article of articles) {
    if (!(article.ko && article.ko.title)) continue;
    urls.push(`  <url>\n    <loc>${SITE_URL}/articles/${article.slug}.html</loc>\n    <lastmod>${article.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
  console.log("  ✓ sitemap.xml updated");
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  // Scan articles-src/ for *-kr.txt files
  const PATTERN = /^(\d{8})-kr\.txt$/i;
  const allFiles = fs.readdirSync(SRC_DIR).filter(f => PATTERN.test(f));

  if (allFiles.length === 0) {
    console.log("No *-kr.txt files found in articles-src/.");
    return;
  }

  const groups = {};
  for (const f of allFiles) {
    const [, yyyymmdd] = f.match(PATTERN);
    groups[yyyymmdd] = path.join(SRC_DIR, f);
  }

  const articles = loadArticlesData();
  const byDate = {};
  for (const a of articles) byDate[a.date] = a;

  let anyChanges = false;
  const articleDir = path.join(ROOT, "articles");
  fs.mkdirSync(articleDir, { recursive: true });

  for (const yyyymmdd of Object.keys(groups).sort()) {
    const filePath = groups[yyyymmdd];
    const date     = isoDate(yyyymmdd);
    const entry    = byDate[date];

    if (!entry) {
      console.warn(`  ✗ ${date} — no matching entry in articles-data.js; skipping.`);
      continue;
    }

    console.log(`\n── ${date} ── ${path.basename(filePath)}`);
    console.log(`  Entry: "${entry.ko ? entry.ko.title : "(no Korean title in data)"}" (slug: ${entry.slug})`);

    const { title, bodyHtml, description } = parseTxt(filePath);
    entry.ko = { title };

    fs.writeFileSync(
      path.join(articleDir, `${entry.slug}.html`),
      makeArticleHtml(entry.slug, title, bodyHtml, date, description, entry),
      "utf8"
    );
    console.log(`  ✓ articles/${entry.slug}.html`);
    anyChanges = true;
  }

  if (anyChanges) {
    saveArticlesData(articles);
    console.log("\n  ✓ articles-data.js updated");
  }

  generateSitemap(articles);

  console.log("\n✅  Done! Next steps:");
  console.log("      git add .");
  console.log('      git commit -m "Publish article"');
  console.log("      git push");
  console.log("      (Cloudflare Pages auto-deploys in ~1 minute)");
}

main();
