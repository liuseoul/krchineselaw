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
 *      (or YYYYMMDD-kr.md: Markdown with front matter `title: "..."`)
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

const SITE_URL  = "https://chineselaw.kr";

const SITE_TITLE_KO = "중국 법률 실무 지식 베이스";
const DISCLAIMER_KO = "면책 고지: 이 웹사이트의 자료는 일반 정보 제공 목적으로만 제공되며 법률 자문을 구성하지 않습니다. 이 웹사이트를 열람하거나 연락하는 행위만으로 변호사-의뢰인 관계가 형성되지 않습니다.";
const CONTACT_NOTICE_KO = "개인 정보 또는 기밀 정보가 포함된 문의는 chineselaw[at]protonmail.com으로 직접 이메일을 보내 주시기 바랍니다.";

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

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMd(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
}

/** Minimal Markdown → HTML (headings, quotes, hr, tables, 2-level lists, bold/italic/code) */
function mdToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  const LI = /^(\d+\.|[-*])\s+/;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (!line.trim()) { i++; continue; }
    if (/^-{3,}\s*$/.test(line)) { out.push("<hr />"); i++; continue; }
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      const lv = Math.max(m[1].length, 2); // page h1 is the article title
      out.push(`<h${lv}>${inlineMd(m[2])}</h${lv}>`); i++; continue;
    }
    if (/^>/.test(line)) {
      const q = [];
      while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${q.map(inlineMd).join("<br />\n")}</blockquote>`); continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = r => r.replace(/^\||\|\s*$/g, "").split("|").map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(/^\|[\s:|-]+\|?\s*$/.test(rows[1] || "") ? 2 : 1).map(cells);
      out.push('<div class="tablewrap"><table>\n<thead><tr>' + head.map(c => `<th>${inlineMd(c)}</th>`).join("") +
        "</tr></thead>\n<tbody>\n" +
        body.map(r => "<tr>" + r.map(c => `<td>${inlineMd(c)}</td>`).join("") + "</tr>").join("\n") +
        "\n</tbody></table></div>");
      continue;
    }
    if (LI.test(line)) {
      const tag = /^\d+\./.test(line) ? "ol" : "ul";
      const items = [];
      while (i < lines.length && (LI.test(lines[i]) || /^\s+[-*]\s+/.test(lines[i]))) {
        const l = lines[i++];
        if (/^\s+[-*]\s+/.test(l) && items.length) items[items.length - 1].sub.push(l.replace(/^\s+[-*]\s+/, ""));
        else items.push({ text: l.replace(LI, ""), sub: [] });
      }
      out.push(`<${tag}>\n` + items.map(it => `<li>${inlineMd(it.text)}` +
        (it.sub.length ? "\n<ul>\n" + it.sub.map(s => `<li>${inlineMd(s)}</li>`).join("\n") + "\n</ul>\n" : "") +
        "</li>").join("\n") + `\n</${tag}>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|\||-{3,}\s*$)/.test(lines[i]) && !LI.test(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inlineMd(para.join(" "))}</p>`);
  }
  return out.join("\n    ");
}

/** Parse a Markdown file with optional front matter → { title, bodyHtml, description } */
function parseMd(filePath) {
  let raw = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let title = "";
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    const t = fm[1].match(/^title:\s*"?(.*?)"?\s*$/m);
    if (t) title = t[1];
    raw = raw.slice(fm[0].length);
  }
  // drop the leading "# …" / "## …" heading lines (the page template renders the title as h1)
  raw = raw.replace(/^\s*#\s+.*\n+(##\s+.*\n+)?/, "");
  const paras = raw.split(/\n{2,}/).map(p => p.trim()).filter(p => p && !/^(>|#|-{3,}|\|)/.test(p));
  let description = (paras[0] || title).replace(/\*\*|\*/g, "").replace(/\n/g, " ");
  if (description.length > 155) description = description.slice(0, 152) + "...";
  return { title, bodyHtml: mdToHtml(raw.trim()), description };
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

  const hrefLangLines = [
    `  <link rel="alternate" hreflang="ko" href="${SITE_URL}/articles/${slug}.html" />`,
  ];

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
  <meta name="keywords" content="${escapeAttr((entry.tags || []).join(", "))}" />
  <meta name="author" content="${escapeAttr(SITE_TITLE_KO)}" />
  <meta name="robots" content="index,follow" />
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
    .article-body h2{font-size:1.35rem;margin:1.8em 0 0.6em;line-height:1.35;}
    .article-body h3{font-size:1.12rem;margin:1.5em 0 0.5em;line-height:1.4;}
    .article-body h4{font-size:1rem;margin:1.3em 0 0.4em;}
    .article-body blockquote{margin:1em 0;padding:10px 16px;background:#f3f4f6;border-left:3px solid #9ca3af;border-radius:0 6px 6px 0;color:#374151;}
    .article-body ul,.article-body ol{margin:0 0 1.1em 0;padding-left:1.5em;}
    .article-body li{margin-bottom:0.4em;}
    .article-body hr{border:none;border-top:1px solid #e5e7eb;margin:1.8em 0;}
    .article-body .tablewrap{overflow-x:auto;margin:0 0 1.2em;}
    .article-body table{border-collapse:collapse;width:100%;font-size:0.93rem;}
    .article-body th,.article-body td{border:1px solid #d1d5db;padding:8px 10px;text-align:left;vertical-align:top;}
    .article-body th{background:#f3f4f6;}
    .backlink{display:inline-block;margin-bottom:14px;color:#374151;text-decoration:none;font-size:0.95rem;}
    .backlink:hover{text-decoration:underline;}
    .small{font-size:0.9rem;color:#6b7280;margin-top:20px;}
    .contact-notice{font-size:0.88rem;color:#1d4ed8;background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 6px 6px 0;padding:10px 14px;margin-top:12px;font-weight:500;}
    @media(min-width:760px){.container{padding:32px 24px 64px;}h1{font-size:2rem;}}
  </style>
</head>
<body>
  <div class="container">
    <a class="backlink" href="/index.html">&larr; 홈</a>
    <article class="card">
      <h1>${title}</h1>
      <div class="pubmeta">${date}</div>
      <div class="article-body">
    ${bodyHtml}
      </div>
    </article>
    <p class="small">${DISCLAIMER_KO}</p>
    <p class="contact-notice">${CONTACT_NOTICE_KO}</p>
  </div>
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
  // YYYYMMDD-kr.ext, or YYYYMMDD-<key>-kr.ext when several articles share a date
  // (<key> must equal the "src" field of the matching entry in articles-data.js)
  const PATTERN = /^(\d{8})(?:-([a-z0-9-]+))?-kr\.(?:txt|md)$/i;
  const allFiles = fs.readdirSync(SRC_DIR).filter(f => PATTERN.test(f));

  if (allFiles.length === 0) {
    console.log("No *-kr.txt files found in articles-src/.");
    return;
  }

  const groups = {};
  for (const f of allFiles) {
    const [, yyyymmdd, key] = f.match(PATTERN);
    groups[key ? `${yyyymmdd}-${key}` : yyyymmdd] = path.join(SRC_DIR, f);
  }

  const articles = loadArticlesData();
  const byDate = {};
  for (const a of articles) if (!a.src) byDate[a.date] = a;
  const bySrc = {};
  for (const a of articles) if (a.src) bySrc[`${a.date.replace(/-/g, "")}-${a.src}`] = a;

  let anyChanges = false;
  const articleDir = path.join(ROOT, "articles");
  fs.mkdirSync(articleDir, { recursive: true });

  for (const gkey of Object.keys(groups).sort()) {
    const filePath = groups[gkey];
    const date     = isoDate(gkey.slice(0, 8));
    const entry    = gkey.length > 8 ? bySrc[gkey] : byDate[date];

    if (!entry) {
      console.warn(`  ✗ ${date} — no matching entry in articles-data.js; skipping.`);
      continue;
    }

    console.log(`\n── ${date} ── ${path.basename(filePath)}`);
    console.log(`  Entry: "${entry.ko ? entry.ko.title : "(no Korean title in data)"}" (slug: ${entry.slug})`);

    const { title, bodyHtml, description } = /\.md$/i.test(filePath) ? parseMd(filePath) : parseTxt(filePath);
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
