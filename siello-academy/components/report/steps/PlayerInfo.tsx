'use client';

import { useRef } from 'react';
import { Upload, User, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoutingReport, ScoutingStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Lang, t } from '@/lib/i18n';

interface Props {
  report: ScoutingReport;
  onChange: (updates: Partial<ScoutingReport>) => void;
  lang: Lang;
}

const POSITIONS = [
  'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
  'Mediocentro Defensivo', 'Mediocentro', 'Mediocentro Ofensivo',
  'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Segunda Punta',
];

const STATUSES: ScoutingStatus[] = [
  'ELITE_POTENTIAL', 'SIGN_NOW', 'FOLLOW', 'INITIAL_FILTER', 'PASS', 'PENDING',
];

const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none`;
const inputStyle = {
  background: 'var(--surface-3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PhotoUpload({
  value, onChange, label, icon: Icon,
}: {
  value: string; onChange: (v: string) => void; label: string; icon: typeof User;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(245,166,35,0.4)' }}
      onClick={() => ref.current?.click()}
      className="relative w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all"
      style={{
        background: 'var(--surface-3)',
        border: '2px dashed var(--border)',
      }}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,166,35,0.08)' }}>
            <Icon size={18} style={{ color: 'var(--gold)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
      )}
      {value && (
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Upload size={20} className="text-white" />
            <span className="text-xs text-white">Cambiar</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function PlayerInfo({ report, onChange, lang }: Props) {
  const inp = (field: keyof ScoutingReport) => ({
    value: (report[field] as string) || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ [field]: e.target.value }),
    className: inputClass,
    style: inputStyle,
  });

  return (
    <div className="space-y-8">
      {/* Photos */}
      <div>
        <h3 className="font-['Outfit'] font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          IMÁGENES
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t(lang, 'playerPhoto')}>
            <PhotoUpload
              value={report.playerPhoto}
              onChange={v => onChange({ playerPhoto: v })}
              label={t(lang, 'uploadPhoto')}
              icon={User}
            />
          </FormField>
          <FormField label={t(lang, 'clubLogo')}>
            <PhotoUpload
              value={report.clubLogo}
              onChange={v => onChange({ clubLogo: v })}
              label={t(lang, 'uploadLogo')}
              icon={Building2}
            />
          </FormField>
        </div>
      </div>

      {/* Player data */}
      <div>
        <h3 className="font-['Outfit'] font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          DATOS DEL JUGADOR
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t(lang, 'fullName')}>
            <input type="text" {...inp('playerName')} placeholder="Ej: Carlos Mendoza García" />
          </FormField>
          <FormField label={t(lang, 'dateOfBirth')}>
            <input type="date" {...inp('dateOfBirth')} />
          </FormField>
          <FormField label={t(lang, 'nationality')}>
            <input type="text" {...inp('nationality')} placeholder="Ej: Argentino" />
          </FormField>
          <FormField label={t(lang, 'position')}>
            <select {...inp('position')}>
              <option value="">Seleccionar posición</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label={t(lang, 'dominantFoot')}>
            <select {...inp('dominantFoot')}>
              {['Diestro', 'Zurdo', 'Ambidiestro'].map(f => (
                <option key={f} value={f}>{t(lang, f as 'Diestro' | 'Zurdo' | 'Ambidiestro')}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t(lang, 'currentClub')}>
            <input type="text" {...inp('currentClub')} placeholder="Ej: Club Atlético XYZ" />
          </FormField>
          <FormField label={t(lang, 'height')}>
            <input type="number" {...inp('height')} placeholder="176" min="140" max="220" />
          </FormField>
          <FormField label={t(lang, 'weight')}>
            <input type="number" {...inp('weight')} placeholder="72" min="40" max="120" />
          </FormField>
          <FormField label={t(lang, 'evaluationDate')}>
            <input type="date" {...inp('evaluationDate')} />
          </FormField>
        </div>
      </div>

      {/* Scouting status + score */}
      <div>
        <h3 className="font-['Outfit'] font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          EVALUACIÓN GLOBAL
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t(lang, 'scoutingStatus')}>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ scoutingStatus: s })}
                  className="transition-all"
                  style={{ opacity: report.scoutingStatus === s ? 1 : 0.45 }}
                >
                  <StatusBadge status={s} lang={lang} />
                </button>
              ))}
            </div>
          </FormField>
          <FormField label={`${t(lang, 'overallScore')} (${report.overallScore}/10)`}>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min={0} max={10} step={0.1}
                value={report.overallScore}
                onChange={e => onChange({ overallScore: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="font-['Outfit'] font-bold text-lg w-10 text-right"
                style={{ color: 'var(--gold)' }}>
                {report.overallScore.toFixed(1)}
              </span>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );
}
