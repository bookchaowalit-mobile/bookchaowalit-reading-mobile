/** Pure venture/goal logic (no React Native imports) so it is unit-testable. */

export type VentureStatus = 'active' | 'paused' | 'planning';

export interface Venture {
  id: string;
  name: string;
  category: string;
  status: VentureStatus;
  revenue: number;
  expenses: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

export const STORAGE_KEYS = {ventures: 'ventures', goals: 'goals'} as const;

export const CATEGORIES = [
  'E-commerce',
  'SaaS',
  'Freelance',
  'Content',
  'Investment',
  'Other',
];

const STATUSES: VentureStatus[] = ['active', 'paused', 'planning'];

export function newId(now = Date.now(), random = Math.random): string {
  return `${now.toString(36)}${random().toString(36).slice(2, 7)}`;
}

/**
 * Parse a money amount typed by the user ("1,500", "฿ 20.5"). Blank is 0;
 * negative, non-numeric or absurd values are rejected with null.
 */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[฿,\s]/g, '');
  if (cleaned === '') {
    return 0;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned);
  return value <= 1e12 ? value : null;
}

const isNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

function isVenture(v: unknown): v is Venture {
  const o = v as Partial<Venture> | null;
  return (
    !!o &&
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.category === 'string' &&
    STATUSES.includes(o.status as VentureStatus) &&
    isNum(o.revenue) &&
    isNum(o.expenses)
  );
}

function isGoal(v: unknown): v is Goal {
  const o = v as Partial<Goal> | null;
  return (
    !!o &&
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    isNum(o.target) &&
    isNum(o.current) &&
    typeof o.deadline === 'string'
  );
}

function parseList<T>(json: string | null, guard: (v: unknown) => v is T): T[] {
  if (!json) {
    return [];
  }
  try {
    const data: unknown = JSON.parse(json);
    return Array.isArray(data) ? data.filter(guard) : [];
  } catch {
    return [];
  }
}

/** Corrupt or foreign stored data yields [] instead of crashing a screen. */
export const parseVentures = (json: string | null) =>
  parseList(json, isVenture);
export const parseGoals = (json: string | null) => parseList(json, isGoal);

export function nextStatus(status: VentureStatus): VentureStatus {
  return STATUSES[(STATUSES.indexOf(status) + 1) % STATUSES.length];
}

export type Totals = {
  revenue: number;
  expenses: number;
  profit: number;
  active: number;
  /** Profit / revenue in percent, null when there is no revenue. */
  margin: number | null;
};

export function totals(ventures: Venture[]): Totals {
  const revenue = ventures.reduce((s, v) => s + v.revenue, 0);
  const expenses = ventures.reduce((s, v) => s + v.expenses, 0);
  const profit = revenue - expenses;
  return {
    revenue,
    expenses,
    profit,
    active: ventures.filter(v => v.status === 'active').length,
    margin: revenue > 0 ? Math.round((profit / revenue) * 100) : null,
  };
}

/** Highest-profit ventures first, without mutating the input. */
export function topVentures(ventures: Venture[], limit = 5): Venture[] {
  return [...ventures]
    .sort(
      (a, b) =>
        b.revenue - b.expenses - (a.revenue - a.expenses) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

/** Progress in percent, clamped to 0–100; 0 for a non-positive target. */
export function goalProgress(goal: Pick<Goal, 'current' | 'target'>): number {
  if (!(goal.target > 0)) {
    return 0;
  }
  return Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
}

export function isGoalComplete(
  goal: Pick<Goal, 'current' | 'target'>,
): boolean {
  return goal.target > 0 && goal.current >= goal.target;
}

export function applyGoalDelta(goal: Goal, amount: number): Goal {
  return {
    ...goal,
    current: Math.max(0, Math.min(goal.target, goal.current + amount)),
  };
}

/** Strict YYYY-MM-DD; returns null for impossible dates. */
export function parseDeadline(text: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!m) {
    return null;
  }
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : null;
}

/** Whole days from `now` until the deadline (negative = overdue), or null. */
export function daysLeft(
  deadline: string,
  now: Date = new Date(),
): number | null {
  const d = parseDeadline(deadline);
  if (!d) {
    return null;
  }
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today) / 86_400_000);
}

export type GoalInput = {title: string; target: string; deadline: string};

export function validateGoal(input: GoalInput): string | null {
  if (!input.title.trim()) {
    return 'Please enter a goal title.';
  }
  const target = parseAmount(input.target);
  if (target === null || target <= 0) {
    return 'Target must be a positive amount.';
  }
  if (input.deadline.trim() && !parseDeadline(input.deadline)) {
    return 'Deadline must be a real date as YYYY-MM-DD (or leave it blank).';
  }
  return null;
}

export type VentureInput = {
  name: string;
  category: string;
  revenue: string;
  expenses: string;
};

export function validateVenture(input: VentureInput): string | null {
  if (!input.name.trim()) {
    return 'Please enter a venture name.';
  }
  if (
    parseAmount(input.revenue) === null ||
    parseAmount(input.expenses) === null
  ) {
    return 'Revenue and expenses must be non-negative amounts.';
  }
  return null;
}
