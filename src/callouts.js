// Paragraphs starting with one of these prefixes get a colored callout. Add a rule here and a
// matching `.callout-<name>` color in styles.css to support a new prefix.
const CALLOUTS = [
  { prefix: 'Expected:', name: 'expected' },
];

// Search highlighting may split the leading text, so match on the concatenated text.
const textOf = (node) => node.children.map((c) => c.value ?? c.children?.[0]?.value ?? '').join('');

export function calloutClass(node) {
  const text = textOf(node);
  const hit = CALLOUTS.find(({ prefix }) => text.startsWith(prefix));
  return hit ? `callout callout-${hit.name}` : undefined;
}
