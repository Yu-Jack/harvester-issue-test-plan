import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeMark from '../rehypeMark.js';
import { extractHeadings, rehypeHeadingIds } from '../headings.js';
import { calloutClass } from '../callouts.js';
import { testCaseIds, useProgress } from '../progress.js';
import Lightbox from './Lightbox.jsx';
import Outline from './Outline.jsx';

export default function PlanView({ plan, terms }) {
  const [zoom, setZoom] = useState(null);
  const scrollRoot = useRef(null);
  const headings = useMemo(() => extractHeadings(plan.body), [plan.body]);
  const rehypePlugins = useMemo(() => [rehypeHeadingIds, [rehypeMark, { terms }]], [terms]);
  const testCases = useMemo(() => testCaseIds(headings), [headings]);
  const { done, toggle } = useProgress(plan.id);
  const components = useMemo(() => ({
    p: ({ node, children }) => <p className={calloutClass(node)}>{children}</p>,
    h3: ({ id, children }) => (
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
