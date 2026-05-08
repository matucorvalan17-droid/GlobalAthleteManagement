'use client';

import { motion } from 'framer-motion';
import { ScoutingReport, CoreScores, DetailedAttributes } from '@/lib/types';
import { Lang, t } from '@/lib/i18n';

interface Props {
  report: ScoutingReport;
  onChange: (updates: Partial<ScoutingReport>) => void;
  lang: Lang;
}

function getBarColor(value: number): string {
  if (value >= 8) return '#14B8A6';
  if (value >= 6.5) return '#F5A623';
  if (value >= 4.5) return '#FCD34D';
  return '#F87171';
}

function ScoreSlider({
  label,
  value,
  onChange,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  const color = getBarColor(value);
  const pct = (value / max) * 100;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span
          className="font-['Outfit'] font-bold text-sm w-8 text-right transition-colors"
          style={{ color }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: 'var(--surface-3)' }}>
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <input
        type="range"
        min={0} max={max} step={0.1}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full mt-1 opacity-0 absolute"
        style={{ height: '6px', cursor: 'pointer', position: 'relative', zIndex: 10, marginTop: '-22px' }}
      />
    </div>
  );
}

function CoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const color = getBarColor(value);
  const pct = (value / 10) * 100;

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="font-['Outfit'] font-black text-xl" style={{ color }}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-2 rounded-full mb-2" style={{ background: 'var(--surface)' }}>
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <input
        type="range"
        min={0} max={10} step={0.1}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

const CORE_KEYS: (keyof CoreScores)[] = [
  'tecnica', 'tactica', 'fisico', 'mentalidad', 'intensidad',
  'tomaDecisiones', 'potencial', 'adaptabilidad', 'juegoSinBalon', 'juegoConBalon',
];

type AttributeGroup = {
  labelKey: 'physicalAttr' | 'technicalAttr' | 'mentalAttr' | 'tacticalAttr';
  keys: (keyof DetailedAttributes)[];
};

const ATTRIBUTE_GROUPS: AttributeGroup[] = [
  {
    labelKey: 'physicalAttr',
    keys: ['velocidad', 'potencia', 'resistencia', 'aceleracion', 'saltoCabeceo'],
  },
  {
    labelKey: 'technicalAttr',
    keys: ['controlPase', 'tecnicaDominio', 'regate', 'finalizacion', 'centros'],
  },
  {
    labelKey: 'mentalAttr',
    keys: ['liderazgo', 'presionTrasPerdida', 'concienciaEspacial', 'lecturaJuego', 'personalidad', 'tomaDedecisiones'],
  },
  {
    labelKey: 'tacticalAttr',
    keys: ['posicionamiento', 'equilibrioDefensivo', 'transiciones', 'presionAlta', 'coberturas', 'lecturaEspacios'],
  },
];

export default function Evaluation({ report, onChange, lang }: Props) {
  function updateCore(key: keyof CoreScores, value: number) {
    onChange({ coreScores: { ...report.coreScores, [key]: value } });
  }

  function updateAttr(key: keyof DetailedAttributes, value: number) {
    onChange({ attributes: { ...report.attributes, [key]: value } });
  }

  return (
    <div className="space-y-8">
      {/* Core Matrix */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full" style={{ background: 'var(--gold)' }} />
          <h3 className="font-['Outfit'] font-bold text-sm tracking-wider uppercase"
            style={{ color: 'var(--text)' }}>
            {t(lang, 'coreMatrix')}
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— Evaluación principal</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CORE_KEYS.map(key => (
            <CoreSlider
              key={key}
              label={t(lang, key as Parameters<typeof t>[1])}
              value={report.coreScores[key]}
              onChange={v => updateCore(key, v)}
            />
          ))}
        </div>
      </div>

      {/* Attribute groups */}
      {ATTRIBUTE_GROUPS.map(group => (
        <div key={group.labelKey}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: 'rgba(245,166,35,0.4)' }} />
            <h3 className="font-['Outfit'] font-semibold text-sm tracking-wider uppercase"
              style={{ color: 'var(--text-muted)' }}>
              {t(lang, group.labelKey)}
            </h3>
          </div>
          <div className="rounded-xl p-4 space-y-4"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {group.keys.map(key => (
              <ScoreSlider
                key={key}
                label={t(lang, key as Parameters<typeof t>[1])}
                value={report.attributes[key]}
                onChange={v => updateAttr(key, v)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
