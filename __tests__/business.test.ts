import {
  applyGoalDelta,
  daysLeft,
  goalProgress,
  isGoalComplete,
  nextStatus,
  parseAmount,
  parseDeadline,
  parseGoals,
  parseVentures,
  topVentures,
  totals,
  validateGoal,
  validateVenture,
  type Goal,
  type Venture,
} from '../src/lib/business';

const venture = (over: Partial<Venture> = {}): Venture => ({
  id: 'v',
  name: 'Shop',
  category: 'E-commerce',
  status: 'active',
  revenue: 1000,
  expenses: 400,
  ...over,
});
const goal = (over: Partial<Goal> = {}): Goal => ({
  id: 'g',
  title: 'Revenue',
  target: 10000,
  current: 2500,
  deadline: '',
  ...over,
});

describe('parseAmount', () => {
  it('accepts plain, grouped and currency-marked amounts', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('1,500')).toBe(1500);
    expect(parseAmount('฿ 20.5')).toBe(20.5);
  });
  it('rejects negatives, garbage and absurd values', () => {
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('12abc')).toBeNull();
    expect(parseAmount('1.234')).toBeNull();
    expect(parseAmount('9999999999999')).toBeNull();
  });
});

describe('totals / topVentures', () => {
  const list = [
    venture({id: 'a', name: 'A', revenue: 1000, expenses: 900}),
    venture({id: 'b', name: 'B', revenue: 500, expenses: 0, status: 'paused'}),
  ];
  it('sums revenue, expenses, profit, margin and active count', () => {
    expect(totals(list)).toEqual({
      revenue: 1500,
      expenses: 900,
      profit: 600,
      active: 1,
      margin: 40,
    });
    expect(totals([]).margin).toBeNull();
  });
  it('orders by profit without mutating the input', () => {
    const before = list.map(v => v.id);
    expect(topVentures(list).map(v => v.id)).toEqual(['b', 'a']);
    expect(list.map(v => v.id)).toEqual(before);
  });
});

describe('goals', () => {
  it('computes safe progress', () => {
    expect(goalProgress(goal())).toBe(25);
    expect(goalProgress(goal({target: 0}))).toBe(0);
    expect(goalProgress(goal({current: 20000}))).toBe(100);
    expect(isGoalComplete(goal({target: 0, current: 0}))).toBe(false);
    expect(isGoalComplete(goal({current: 10000}))).toBe(true);
  });
  it('clamps progress updates to [0, target]', () => {
    expect(applyGoalDelta(goal(), 10000).current).toBe(10000);
    expect(applyGoalDelta(goal(), -99999).current).toBe(0);
  });
  it('parses deadlines and days left', () => {
    expect(parseDeadline('2026-02-30')).toBeNull();
    expect(parseDeadline('Dec 2025')).toBeNull();
    const now = new Date(2026, 8, 30, 15, 0);
    expect(daysLeft('2026-10-10', now)).toBe(10);
    expect(daysLeft('2026-09-30', now)).toBe(0);
    expect(daysLeft('2026-09-28', now)).toBe(-2);
    expect(daysLeft('someday', now)).toBeNull();
  });
  it('validates new goals', () => {
    const ok = {title: 'Save', target: '5000', deadline: ''};
    expect(validateGoal(ok)).toBeNull();
    expect(validateGoal({...ok, title: ' '})).toMatch(/title/);
    expect(validateGoal({...ok, target: '0'})).toMatch(/positive/);
    expect(validateGoal({...ok, deadline: '2026-13-01'})).toMatch(/YYYY-MM-DD/);
  });
});

describe('ventures', () => {
  it('cycles status', () => {
    expect(nextStatus('active')).toBe('paused');
    expect(nextStatus('paused')).toBe('planning');
    expect(nextStatus('planning')).toBe('active');
  });
  it('validates new ventures', () => {
    const ok = {name: 'Shop', category: 'SaaS', revenue: '100', expenses: ''};
    expect(validateVenture(ok)).toBeNull();
    expect(validateVenture({...ok, name: ''})).toMatch(/name/);
    expect(validateVenture({...ok, expenses: '-1'})).toMatch(/non-negative/);
  });
});

describe('stored data parsing', () => {
  it('returns [] for missing or corrupt JSON', () => {
    expect(parseVentures(null)).toEqual([]);
    expect(parseVentures('{bad')).toEqual([]);
    expect(parseGoals('{"a":1}')).toEqual([]);
  });
  it('drops malformed entries, keeps legacy free-text deadlines', () => {
    const legacy = goal({deadline: 'Dec 2025'});
    expect(parseGoals(JSON.stringify([legacy, {id: 1}]))).toEqual([legacy]);
    const v = venture();
    expect(
      parseVentures(
        JSON.stringify([v, {...v, status: 'weird'}, {...v, revenue: 'x'}]),
      ),
    ).toEqual([v]);
  });
});
