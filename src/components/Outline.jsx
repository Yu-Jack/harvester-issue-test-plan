import { useEffect, useState } from 'react';

export default function Outline({ headings, scrollRoot, testCases, done, toggle }) {
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
