import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import plans from './plans.json';
import { matches, parseTerms, snippet } from './search.js';
import rehypeMark from './rehypeMark.js';
import { extractHeadings, rehypeHeadingIds } from './headings.js';
import { calloutClass } from './callouts.js';
import { testCaseIds, useProgress } from './progress.js';

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

function Outline({ headings, scrollRoot, testCases, done, toggle }) {
  const [active, setActive] = useState(headings[0]?.id);

  // Scroll spy: the last heading that has passed the top of the content area.
  useEffect(() => {
    const root = scrollRoot.current;
    if (!root || !headings.length) return;
    const onScroll = () => {
      const top = root.getBoundingClientRect().top + 24;
      let cur = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= top) cur = h.id;
      }
      setActive(cur);
    };
    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [headings, scrollRoot]);

  if (!headings.length) return null;
  const finished = [...testCases].filter((id) => done.has(id)).length;
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Buttons, not #anchors: the URL hash is already used to pick the plan.
  return (
    <aside className="outline" aria-label="Outline">
      <div className="outline-title">Outline</div>
      {testCases.size > 0 && (
        <div className="progress" aria-label="Test progress">
          <div className="progress-bar"><span style={{ width: `${(finished / testCases.size) * 100}%` }} /></div>
          {finished}/{testCases.size} tested
        </div>
      )}
      {headings.map((h) => {
        const cls = `lv${h.level}${h.id === active ? ' active' : ''}`;
        if (!testCases.has(h.id)) {
          return <button key={h.id} className={cls} onClick={() => jump(h.id)}>{h.text}</button>;
        }
        return (
          <div key={h.id} className={`case${done.has(h.id) ? ' done' : ''}`}>
            <input type="checkbox" checked={done.has(h.id)} onChange={() => toggle(h.id)} aria-label={`Mark "${h.text}" as tested`} />
            <button className={cls} onClick={() => jump(h.id)}>{h.text}</button>
          </div>
        );
      })}
    </aside>
  );
}

function PlanView({ plan, terms }) {
  const [zoom, setZoom] = useState(null);
  const scrollRoot = useRef(null);
  const headings = useMemo(() => extractHeadings(plan.body), [plan.body]);
  const rehypePlugins = useMemo(() => [rehypeHeadingIds, [rehypeMark, { terms }]], [terms]);
  const testCases = useMemo(() => testCaseIds(headings), [headings]);
  const { done, toggle } = useProgress(plan.id);
  const components = useMemo(() => ({
    p: ({ node, children }) => <p className={calloutClass(node)}>{children}</p>,
    h3: ({ node, id, children }) => (
      <h3 id={id} className={testCases.has(id) ? 'case-heading' : undefined}>
        {testCases.has(id) && (
          <input type="checkbox" checked={done.has(id)} onChange={() => toggle(id)} aria-label="Mark as tested" />
        )}
        {children}
      </h3>
    ),
    img: ({ src, alt }) => (
      <img src={src} alt={alt} className="zoomable" onClick={() => setZoom({ src, alt })} />
    ),
  }), [testCases, done, toggle]);

  // New plan: start from the top.
  useEffect(() => { scrollRoot.current?.scrollTo(0, 0); }, [plan.id]);

  return (
    <div className="content" ref={scrollRoot}>
      {zoom && <Lightbox {...zoom} onClose={() => setZoom(null)} />}
      <main>
        <h1 className="plan-title">{plan.title}</h1>
        <p className="meta">
          <a href={`https://github.com/${plan.repo}/issues/${plan.issue}`} target="_blank" rel="noopener noreferrer">
            {plan.repo}#{plan.issue}
          </a>
          {plan.source && <> · <a href={plan.source} target="_blank" rel="noopener noreferrer">original comment</a></>}
        </p>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={components}>{plan.body}</ReactMarkdown>
      </main>
      <Outline headings={headings} scrollRoot={scrollRoot} testCases={testCases} done={done} toggle={toggle} />
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);
  const hash = useHash();
  const terms = useMemo(() => parseTerms(query), [query]);
  const hits = useMemo(() => plans.filter((p) => matches(p, terms)), [terms]);
  const current = plans.find((p) => p.id === hash) || (plans.length === 1 ? plans[0] : null);

  return (
    <>
      <header>
        <button
          className="menu"
          aria-label={open ? 'Hide search panel' : 'Show search panel'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <h1>Harvester Issue Test Plans</h1>
      </header>
      <div className="layout">
        {open && (
          <nav>
            <div className="search">
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search issue, title, or content…"
              />
            </div>
            <PlanList hits={hits} terms={terms} current={current?.id} />
          </nav>
        )}
        {current ? <PlanView key={current.id} plan={current} terms={terms} /> : <p className="meta pad">Select an issue on the left.</p>}
      </div>
    </>
  );
}
