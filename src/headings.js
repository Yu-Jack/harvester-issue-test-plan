// Shared by the outline (built from markdown source) and the rehype plugin
// (which sets ids on rendered headings) so both produce identical ids.
const slug = (text) =>
  text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-') || 'section';

export function createSlugger() {
  const seen = new Map();
  return (text) => {
    const base = slug(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
}

const plainText = (md) =>
  md.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_~]/g, '');

// Headings (h1-h3) of a markdown body, ignoring fenced code blocks.
export function extractHeadings(body) {
  const next = createSlugger();
  const out = [];
  let fence = null;
  for (const line of body.split('\n')) {
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) { fence = fence ? (line.trim().startsWith(fence) ? null : fence) : f[1]; continue; }
    if (fence) continue;
    const m = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (m) {
      const text = plainText(m[2]);
      out.push({ level: m[1].length, text, id: next(text) });
    }
  }
  return out;
}

const hastText = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(hastText).join('');

// Rehype plugin: give h1-h3 the same ids as extractHeadings().
export function rehypeHeadingIds() {
  return (tree) => {
    const next = createSlugger();
    const walk = (node) => {
      if (node.type === 'element' && /^h[1-3]$/.test(node.tagName)) {
        node.properties = { ...node.properties, id: next(hastText(node)) };
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}
