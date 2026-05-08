'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { ScoutingReport, SuggestedTeam } from '@/lib/types';
import { Lang, t } from '@/lib/i18n';

interface Props {
  report: ScoutingReport;
  onChange: (updates: Partial<ScoutingReport>) => void;
  lang: Lang;
}

const inputClass = 'w-full px-3 py-2 rounded-lg text-sm outline-none transition-all';
const inputStyle = {
  background: 'var(--surface-3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};

export default function TeamSuggestions({ report, onChange, lang }: Props) {
  function addTeam() {
    onChange({
      suggestedTeams: [
        ...report.suggestedTeams,
        { club: '', category: '', observations: '', estimatedLevel: '' },
      ],
    });
  }

  function updateTeam(idx: number, updates: Partial<SuggestedTeam>) {
    const teams = report.suggestedTeams.map((team, i) =>
      i === idx ? { ...team, ...updates } : team
    );
    onChange({ suggestedTeams: teams });
  }

  function removeTeam(idx: number) {
    onChange({ suggestedTeams: report.suggestedTeams.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-['Outfit'] font-bold text-base">{t(lang, 'suggestedTeams')}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {lang === 'es'
              ? 'Clubes españoles donde podría encajar el jugador'
              : 'Spanish clubs where the player could fit'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={addTeam}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
          style={{
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.2)',
            color: 'var(--gold)',
          }}
        >
          <Plus size={13} />
          {t(lang, 'addTeam')}
        </motion.button>
      </div>

      {report.suggestedTeams.length === 0 && (
        <div className="rounded-xl p-10 text-center"
          style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}>
          <Building2 size={28} className="mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {lang === 'es' ? 'No hay clubes añadidos. Añade el primero.' : 'No clubs added. Add the first one.'}
          </p>
        </div>
      )}

      <AnimatePresence>
        {report.suggestedTeams.map((team, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(245,166,35,0.1)', color: 'var(--gold)' }}>
                  {idx + 1}
                </div>
                <span className="text-sm font-semibold">
                  {team.club || (lang === 'es' ? 'Club sin nombre' : 'Unnamed club')}
                </span>
              </div>
              <button
                onClick={() => removeTeam(idx)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title={t(lang, 'removeTeam')}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t(lang, 'club')}
                </label>
                <input
                  type="text"
                  value={team.club}
                  onChange={e => updateTeam(idx, { club: e.target.value })}
                  placeholder="Ej: CF Rayo Vallecano"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t(lang, 'category')}
                </label>
                <input
                  type="text"
                  value={team.category}
                  onChange={e => updateTeam(idx, { category: e.target.value })}
                  placeholder="Ej: Segunda División B"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t(lang, 'estimatedLevel')}
                </label>
                <input
                  type="text"
                  value={team.estimatedLevel}
                  onChange={e => updateTeam(idx, { estimatedLevel: e.target.value })}
                  placeholder="Ej: Alta probabilidad"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t(lang, 'observations')}
                </label>
                <input
                  type="text"
                  value={team.observations}
                  onChange={e => updateTeam(idx, { observations: e.target.value })}
                  placeholder="Observaciones del club..."
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
