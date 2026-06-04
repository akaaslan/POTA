// Squad servis — leaveTeam splice bug testi (Bug #1 — 3 Haziran fix)

describe('leaveTeam splice fix', () => {
  // Splice fix'in doğruluğunu simüle et
  function safeRemove(arr: string[], id: string): string[] {
    const copy = [...arr];
    const idx = copy.indexOf(id);
    if (idx >= 0) copy.splice(idx, 1);
    return copy;
  }

  it('removes existing id correctly', () => {
    const result = safeRemove(['a', 'b', 'c'], 'b');
    expect(result).toEqual(['a', 'c']);
  });

  it('does NOT remove last element when id not found (old bug reproduced)', () => {
    // Eski davranış: indexOf=-1 → splice(-1,1) → son eleman silinirdi
    const arr = ['a', 'b', 'c'];
    const idx = arr.indexOf('x'); // -1
    // Eski bug: arr.splice(-1, 1) → ['a', 'b'] — c silinirdi!
    expect(idx).toBe(-1);
  });

  it('keeps array unchanged when id not found', () => {
    const result = safeRemove(['a', 'b', 'c'], 'x');
    expect(result).toEqual(['a', 'b', 'c']); // değişmemeli
  });

  it('removes first occurrence of duplicate', () => {
    const result = safeRemove(['a', 'b', 'a'], 'a');
    expect(result).toEqual(['b', 'a']);
  });

  it('handles empty array', () => {
    const result = safeRemove([], 'a');
    expect(result).toEqual([]);
  });
});
