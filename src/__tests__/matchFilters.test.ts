// Match filtre mantığı testleri

interface Match { id: string; district: string; skillLevel: string; format: string; }
interface Filters { district: string; skill: string; format: string; }

function applyFilters(matches: Match[], filters: Filters): Match[] {
  let result = matches;
  if (filters.district && filters.district !== 'Tümü')
    result = result.filter(m => m.district === filters.district);
  if (filters.skill && filters.skill !== 'Tümü')
    result = result.filter(m => m.skillLevel === filters.skill);
  if (filters.format && filters.format !== 'Tümü')
    result = result.filter(m => m.format === filters.format);
  return result;
}

const MATCHES: Match[] = [
  { id: '1', district: 'Kadıköy',  skillLevel: 'Pro-Am',    format: '5v5 Tam Saha' },
  { id: '2', district: 'Beşiktaş', skillLevel: 'Açık Saha', format: '3v3 Yarı Saha' },
  { id: '3', district: 'Kadıköy',  skillLevel: 'Açık Saha', format: '5v5 Tam Saha' },
  { id: '4', district: 'Şişli',    skillLevel: 'Elit',       format: '5v5 Tam Saha' },
];

describe('applyFilters', () => {
  it('returns all matches when all filters are Tümü', () => {
    const result = applyFilters(MATCHES, { district: 'Tümü', skill: 'Tümü', format: 'Tümü' });
    expect(result).toHaveLength(4);
  });

  it('filters by district', () => {
    const result = applyFilters(MATCHES, { district: 'Kadıköy', skill: 'Tümü', format: 'Tümü' });
    expect(result).toHaveLength(2);
    expect(result.every(m => m.district === 'Kadıköy')).toBe(true);
  });

  it('filters by skill level', () => {
    const result = applyFilters(MATCHES, { district: 'Tümü', skill: 'Açık Saha', format: 'Tümü' });
    expect(result).toHaveLength(2);
  });

  it('filters by format', () => {
    const result = applyFilters(MATCHES, { district: 'Tümü', skill: 'Tümü', format: '3v3 Yarı Saha' });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });

  it('combines multiple filters', () => {
    const result = applyFilters(MATCHES, { district: 'Kadıköy', skill: 'Açık Saha', format: 'Tümü' });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('3');
  });

  it('returns empty when no match', () => {
    const result = applyFilters(MATCHES, { district: 'Kadıköy', skill: 'Elit', format: 'Tümü' });
    expect(result).toHaveLength(0);
  });
});
