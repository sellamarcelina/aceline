// Reference date anchored to current local date (2026-11-25) for realistic due-date countdowns
export const TODAY_ISO = '2026-11-25';

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDaysIso(baseIso: string, days: number): string {
  const dt = parseIsoDate(baseIso);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function diffDaysFromToday(targetIso: string): number {
  const today = parseIsoDate(TODAY_ISO);
  const target = parseIsoDate(targetIso);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function formatDisplayDate(iso: string): string {
  const dt = parseIsoDate(iso);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  const dt = parseIsoDate(iso);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDueCountdownLabel(dueDateIso: string): {
  label: string;
  tone: 'normal' | 'warning' | 'overdue';
} {
  const days = diffDaysFromToday(dueDateIso);
  if (days < 0) {
    const abs = Math.abs(days);
    return {
      label: `${abs} ${abs === 1 ? 'day' : 'days'} overdue`,
      tone: 'overdue',
    };
  }
  if (days === 0) {
    return { label: 'Due today', tone: 'warning' };
  }
  if (days <= 3) {
    return {
      label: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
      tone: 'warning',
    };
  }
  return {
    label: `${days} days remaining`,
    tone: 'normal',
  };
}
