// Scans plans/*.md, reads the front matter and writes src/plans.json.
// Usage: node scripts/build-index.cjs
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'plans');
const out = path.join(__dirname, '..', 'src');
const items = [];

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) { console.warn(`skip ${file}: no front matter`); continue; }

  const meta = {};
  m[1].split('\n').forEach((line) => {
    const i = line.indexOf(':');
    if (i < 0) return;
    let v = line.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = JSON.parse(v);
    meta[line.slice(0, i).trim()] = v;
  });

  items.push({
    id: file.replace(/\.md$/, ''),
    file,
    issue: Number(meta.issue),
    repo: meta.repo || 'harvester/harvester',
    title: meta.title || file,
    source: meta.source || '',
    body: m[2].trim(),
  });
}

items.sort((a, b) => b.issue - a.issue);
fs.writeFileSync(path.join(out, 'plans.json'), JSON.stringify(items, null, 2));
console.log(`wrote ${items.length} plan(s) to src/plans.json`);
