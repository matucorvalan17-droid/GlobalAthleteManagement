'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react';
import { ScoutingReport } from '@/lib/types';
import { saveReport } from '@/lib/storage';
import { Lang, t } from '@/lib/i18n';
import PlayerInfo from './steps/PlayerInfo';
import Evaluation from './steps/Evaluation';
import TextSections from './steps/TextSections';
import TeamSuggestions from './steps/TeamSuggestions';

interface Props {
  report: ScoutingReport;
  onUpdate: (r: ScoutingReport) => void;
  onPreview: () => void;
  lang: Lang;
}

type StepKey = 'playerInfo' | 'evaluation' | 'textSections' | 'teamSuggestions';

const STEPS: { key: StepKey; number: number }[] = [
  { key: 'playerInfo', number: 1 },
  { key: 'evaluation', number: 2 },
  { key: 'textSections', number: 3 },
  { key: 'teamSuggestions', number: 4 },
];

export default function ReportForm({ report, onUpdate, onPreview, lang }: Props) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  function handleChange(updates: Partial<ScoutingReport>) {
    onUpdate({ ...report, ...updates, updatedAt: new Date().toISOString() });
    setSaved(false);
  }

  function handleSave() {
    saveReport(report);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleNext() {
    handleSave();
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  const currentStep = STEPS[step];

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className="flex items-center gap-2 group"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i === step
                      ? 'var(--gold)'
                      : i < step
                        ? 'rgba(245,166,35,0.3)'
                        : 'var(--surface-3)',
                    color: i === step ? '#000' : i < step ? 'var(--gold)' : 'var(--text-muted)',
                  }}
                >
                  {i < step ? '✓' : s.number}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: i === step ? 'var(--text)' : 'var(--text-muted)' }}
                >
                  {t(lang, s.key)}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="h-px w-6 sm:w-10"
                  style={{ background: i < step ? 'var(--gold)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep.key === 'playerInfo' && (
              <PlayerInfo report={report} onChange={handleChange} lang={lang} />
            )}
            {currentStep.key === 'evaluation' && (
              <Evaluation report={report} onChange={handleChange} lang={lang} />
            )}
            {currentStep.key === 'textSections' && (
              <TextSections report={report} onChange={handleChange} lang={lang} />
            )}
            {currentStep.key === 'teamSuggestions' && (
              <TeamSuggestions report={report} onChange={handleChange} lang={lang} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t flex items-center justify-between gap-3"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBack}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
          style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={15} />
          {t(lang, 'back')}
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: saved ? 'rgba(20,184,166,0.1)' : 'var(--surface-2)',
              border: `1px solid ${saved ? 'rgba(20,184,166,0.3)' : 'var(--border)'}`,
              color: saved ? '#14B8A6' : 'var(--text-muted)',
            }}
          >
            <Save size={14} />
            {saved ? '✓ Guardado' : t(lang, 'save')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPreview}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.2)',
              color: 'var(--gold)',
            }}
          >
            <Eye size={14} />
            {t(lang, 'preview')}
          </motion.button>

          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                color: '#000',
              }}
            >
              {t(lang, 'next')}
              <ChevronRight size={15} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { handleSave(); onPreview(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                color: '#000',
              }}
            >
              {t(lang, 'preview')}
              <Eye size={15} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
