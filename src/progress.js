import { useCallback, useEffect, useState } from 'react';

const keyOf = (planId) => `test-progress:${planId}`;

const load = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
};

// Test cases are the h3 headings under the "Test Cases" h2.
export function testCaseIds(headings) {
  const ids = new Set();
  let inCases = false;
  for (const h of headings) {
    if (h.level <= 2) inCases = h.level === 2 && /^test cases$/i.test(h.text);
    else if (inCases && h.level === 3) ids.add(h.id);
  }
  return ids;
}

// Checked test cases per plan, kept in localStorage (per browser).
export function useProgress(planId) {
  const key = keyOf(planId);
  const [done, setDone] = useState(() => load(key));
  useEffect(() => { setDone(load(key)); }, [key]);

  const toggle = useCallback((id) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      localStorage.setItem(key, JSON.stringify([...next]));
      return next;
    });
  }, [key]);

  return { done, toggle };
}
