import PlanList from './PlanList.jsx';

export default function SearchPanel({ query, onQueryChange, hits, terms, current }) {
  return (
    <nav>
      <div className="search">
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search issue, title, or content…"
        />
      </div>
      <PlanList hits={hits} terms={terms} current={current} />
    </nav>
  );
}
