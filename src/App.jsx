import { useMemo, useState } from 'react';
import plans from './plans.json';
import { matches, parseTerms } from './search.js';
import { useHash } from './useHash.js';
import Header from './components/Header.jsx';
import SearchPanel from './components/SearchPanel.jsx';
import PlanView from './components/PlanView.jsx';

export default function App() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);
  const hash = useHash();
  const terms = useMemo(() => parseTerms(query), [query]);
  const hits = useMemo(() => plans.filter((p) => matches(p, terms)), [terms]);
  const current = plans.find((p) => p.id === hash) || (plans.length === 1 ? plans[0] : null);

  return (
    <>
      <Header open={open} onToggle={() => setOpen((v) => !v)} />
      <div className="layout">
        {open && (
          <SearchPanel query={query} onQueryChange={setQuery} hits={hits} terms={terms} current={current?.id} />
        )}
        {current ? <PlanView key={current.id} plan={current} terms={terms} /> : <p className="meta pad">Select an issue on the left.</p>}
      </div>
    </>
  );
}
