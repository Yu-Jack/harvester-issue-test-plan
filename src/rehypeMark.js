// Rehype plugin: wrap search terms found in text nodes with <mark>.
export default function rehypeMark({ terms }) {
  const re = terms.length
    ? new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    : null;

  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) => {
      if (child.type === 'element') {
        if (child.tagName !== 'code' && child.tagName !== 'pre') walk(child);
        return [child];
      }
      if (child.type !== 'text') return [child];
      return child.value.split(re).map((part, i) =>
        i % 2 ? { type: 'element', tagName: 'mark', properties: {}, children: [{ type: 'text', value: part }] }
                : { type: 'text', value: part });
    });
  };

  return (tree) => { if (re) walk(tree); };
}
