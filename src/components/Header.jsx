export default function Header({ open, onToggle }) {
  return (
    <header>
      <button
        className="menu"
        aria-label={open ? 'Hide search panel' : 'Show search panel'}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span /><span /><span />
      </button>
      <h1>Harvester Issue Test Plans</h1>
    </header>
  );
}
