'use client';

import { ScoutingReport } from '@/lib/types';
import { Lang, t } from '@/lib/i18n';

interface Props {
  report: ScoutingReport;
  onChange: (updates: Partial<ScoutingReport>) => void;
  lang: Lang;
}

type TextField = keyof Pick<
  ScoutingReport,
  | 'executiveSummary'
  | 'playerContext'
  | 'technicalObservations'
  | 'tacticalObservations'
  | 'physicalObservations'
  | 'mentalityBehavior'
  | 'roleFit'
  | 'finalConclusion'
  | 'finalRecommendation'
>;

const TEXT_FIELDS: { field: TextField; rows: number }[] = [
  { field: 'executiveSummary', rows: 4 },
  { field: 'playerContext', rows: 3 },
  { field: 'technicalObservations', rows: 3 },
  { field: 'tacticalObservations', rows: 3 },
  { field: 'physicalObservations', rows: 3 },
  { field: 'mentalityBehavior', rows: 3 },
  { field: 'roleFit', rows: 3 },
  { field: 'finalConclusion', rows: 3 },
  { field: 'finalRecommendation', rows: 3 },
];

export default function TextSections({ report, onChange, lang }: Props) {
  return (
    <div className="space-y-5">
      {TEXT_FIELDS.map(({ field, rows }) => (
        <div key={field}>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>
            {t(lang, field)}
          </label>
          <textarea
            rows={rows}
            value={report[field] as string}
            onChange={e => onChange({ [field]: e.target.value })}
            placeholder={`${t(lang, field)}...`}
            className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed outline-none transition-all"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(245,166,35,0.4)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245,166,35,0.08)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
}
