// Every whitespace-separated term must match number/repo/title/body.
export function parseTerms(query) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean).map((t) => t.replace(/^#/, ''));
}

export function matches(plan, terms) {
  const hay = `${plan.issue} ${plan.repo} ${plan.title} ${plan.body}`.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export function snippet(plan, terms) {
  const body = plan.body.replace(/\s+/g, ' ');
  const low = body.toLowerCase();
  for (const t of terms) {
    const i = low.indexOf(t);
    if (i >= 0) {
      const s = Math.max(0, i - 30);
      return (s ? '…' : '') + body.slice(s, i + 80) + '…';
    }
  }
  return '';
}
