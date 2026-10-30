import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import plans from './plans.json';
import { matches, parseTerms, snippet } from './search.js';
import rehypeMark from './rehypeMark.js';

const useHash = () => {
  const [hash, setHash] = useState(location.hash.slice(1));
  useEffect(() => {
    const on = () => setHash(location.hash.slice(1));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
};

function PlanList({ hits, terms, current }) {
  if (!hits.length) return <div className="empty">No matching test plan.</div>;
  return hits.map((p) => (
    <a key={p.id} href={`#${p.id}`} className={p.id === current ? 'active' : ''}>
      <div className="num">{p.repo}#{p.issue}</div>
      <div>{p.title}</div>
      {terms.length > 0 && <div className="snip">{snippet(p, terms)}</div>}
    </a>
  ));
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-label={alt}>
      <img src={src} alt={alt} />
    </div>
  );
}

function PlanView({ plan, terms }) {
  const [zoom, setZoom] = useState(null);
  const rehypePlugins = useMemo(() => [[rehypeMark, { terms }]], [terms]);
  const components = useMemo(() => ({
    img: ({ src, alt }) => (
      <img src={src} alt={alt} className="zoomable" onClick={() => setZoom({ src, alt })} />
    ),
  }), []);
  return (
    <>
      {zoom && <Lightbox {...zoom} onClose={() => setZoom(null)} />}
      <h1>{plan.title}</h1>
      <p className="meta">
        <a href={`https://github.com/${plan.repo}/issues/${plan.issue}`} target="_blank" rel="noopener noreferrer">
          {plan.repo}#{plan.issue}
        </a>
        {plan.source && <> · <a href={plan.source} target="_blank" rel="noopener noreferrer">original comment</a></>}
      </p>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={components}>{plan.body}</ReactMarkdown>
    </>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const hash = useHash();
  const terms = useMemo(() => parseTerms(query), [query]);
  const hits = useMemo(() => plans.filter((p) => matches(p, terms)), [terms]);
  const current = plans.find((p) => p.id === hash) || (plans.length === 1 ? plans[0] : null);

  return (
    <>
      <header>
        <h1>Harvester Issue Test Plans</h1>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by issue number, title, or test plan content…"
        />
      </header>
      <div className="layout">
        <nav><PlanList hits={hits} terms={terms} current={current?.id} /></nav>
        <main>
          {current ? <PlanView plan={current} terms={terms} /> : <p className="meta">Select an issue on the left.</p>}
        </main>
      </div>
    </>
  );
}
