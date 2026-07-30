import React from 'react';
import {
  FileText,
  BookmarkCheck,
  BookOpen,
  Boxes,
  Calendar,
  Trophy,
  Users,
  ClipboardCheck,
  Package,
  Download,
  Check,
} from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxStepReached: number;
}

const STEPS = [
  { step: 1, label: 'Datos & Temática', icon: FileText },
  { step: 2, label: 'Currículo', icon: BookmarkCheck },
  { step: 3, label: 'Saberes', icon: BookOpen },
  { step: 4, label: 'Metodología', icon: Boxes },
  { step: 5, label: 'Sesiones', icon: Calendar },
  { step: 6, label: 'Producto Final', icon: Trophy },
  { step: 7, label: 'Diversidad', icon: Users },
  { step: 8, label: 'Evaluación', icon: ClipboardCheck },
  { step: 9, label: 'Recursos', icon: Package },
  { step: 10, label: 'Resumen SdA', icon: Download },
];

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, onSelectStep, maxStepReached }) => {
  return (
    <div id="step-progress-wrapper" className="bg-white border-b border-slate-200 py-3 px-4 shadow-2xs overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[760px] space-x-1">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step || maxStepReached > s.step;
          const isClickable = s.step <= maxStepReached || s.step <= currentStep + 1;

          return (
            <React.Fragment key={s.step}>
              <button
                id={`step-indicator-btn-${s.step}`}
                disabled={!isClickable}
                onClick={() => onSelectStep(s.step)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-800 text-white shadow-md ring-2 ring-indigo-500/40'
                    : isCompleted
                    ? 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100/80 border border-indigo-200'
                    : isClickable
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-extrabold'
                      : isCompleted
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted && !isActive ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                </div>

                <span className="truncate max-w-[90px]">{s.label}</span>
              </button>

              {s.step < STEPS.length && (
                <div
                  className={`h-0.5 flex-1 min-w-[10px] max-w-[24px] ${
                    isCompleted ? 'bg-amber-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
