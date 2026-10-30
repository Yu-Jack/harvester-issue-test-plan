import { snippet } from '../search.js';

export default function PlanList({ hits, terms, current }) {
  if (!hits.length) return <div className="empty">No matching test plan.</div>;
  return hits.map((p) => (
    <a key={p.id} href={`#${p.id}`} className={p.id === current ? 'active' : ''}>
      <div className="num">{p.repo}#{p.issue}</div>
      <div>{p.title}</div>
      {terms.length > 0 && <div className="snip">{snippet(p, terms)}</div>}
    </a>
  ));
}
