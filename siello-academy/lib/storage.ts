import { ScoutingReport, DEFAULT_REPORT } from './types';

const STORAGE_KEY = 'siello_reports';

export function getReports(): ScoutingReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getReport(id: string): ScoutingReport | null {
  return getReports().find(r => r.id === id) ?? null;
}

export function saveReport(report: ScoutingReport): void {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    reports[idx] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    reports.unshift(report);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function deleteReport(id: string): void {
  const reports = getReports().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function createNewReport(): ScoutingReport {
  return {
    ...DEFAULT_REPORT,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evaluationDate: new Date().toISOString().split('T')[0],
  };
}
