import { calcOVR, ovrGrade } from '../domains/gamification';

describe('calcOVR', () => {
  it('returns 72 when no stats', () => {
    expect(calcOVR(null)).toBe(72);
    expect(calcOVR([])).toBe(72);
  });

  it('returns correct OVR for perfect stats', () => {
    const stats = [
      { label: 'GALİBİYET',    value: 10 },
      { label: 'MAÇLAR',       value: 10 },
      { label: 'ORT. SAYILAR', value: 20 },
    ];
    // wr=1.0 → 30pts, pts=20 → min(14, 14)=14 → 55+30+14=99
    expect(calcOVR(stats)).toBe(99);
  });

  it('returns correct OVR for 50% win rate + 10pts avg', () => {
    const stats = [
      { label: 'GALİBİYET',    value: 5 },
      { label: 'MAÇLAR',       value: 10 },
      { label: 'ORT. SAYILAR', value: 10 },
    ];
    // wr=0.5 → 15pts, pts=10 → min(14,7)=7 → 55+15+7=77
    expect(calcOVR(stats)).toBe(77);
  });

  it('clamps minimum to 55', () => {
    const stats = [
      { label: 'GALİBİYET',    value: 0 },
      { label: 'MAÇLAR',       value: 10 },
      { label: 'ORT. SAYILAR', value: 0 },
    ];
    expect(calcOVR(stats)).toBe(55);
  });

  it('handles string values', () => {
    const stats = [
      { label: 'GALİBİYET',    value: '8' },
      { label: 'MAÇLAR',       value: '10' },
      { label: 'ORT. SAYILAR', value: '15.5' },
    ];
    const ovr = calcOVR(stats);
    expect(ovr).toBeGreaterThanOrEqual(55);
    expect(ovr).toBeLessThanOrEqual(99);
  });
});

describe('ovrGrade', () => {
  it('returns S+ for 95+', () => expect(ovrGrade(95)).toBe('S+'));
  it('returns S for 90-94',  () => expect(ovrGrade(90)).toBe('S'));
  it('returns A+ for 85-89', () => expect(ovrGrade(85)).toBe('A+'));
  it('returns A for 80-84',  () => expect(ovrGrade(80)).toBe('A'));
  it('returns B+ for 75-79', () => expect(ovrGrade(75)).toBe('B+'));
  it('returns B for 70-74',  () => expect(ovrGrade(70)).toBe('B'));
  it('returns C+ for 65-69', () => expect(ovrGrade(65)).toBe('C+'));
  it('returns C for <65',    () => expect(ovrGrade(60)).toBe('C'));
});
