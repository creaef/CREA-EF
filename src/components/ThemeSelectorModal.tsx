import React from 'react';
import { Palette, Check, Sparkles, X, Activity, BookOpen, Award, Layers, ShieldCheck } from 'lucide-react';
import { useColorTheme } from '../utils/theme';
import { CreaEfLogo } from './CreaEfLogo';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme: currentTheme, changeTheme, themes } = useColorTheme();

  if (!isOpen) return null;

  return (
    <div id="theme-selector-modal-backdrop" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-[9999] animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-5xl w-full p-5 sm:p-8 text-white space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-1 bg-white border border-slate-700 rounded-2xl shadow-sm shrink-0">
              <CreaEfLogo className="w-12 h-12" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Propuestas de Sistema de Diseño UX/UI
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Selecciona la Identidad Visual para Crea-Ef
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Elige una de las 3 opciones de diseño desarrolladas a partir del logotipo oficial. La app adaptará colores, tipografías y cabeceras en tiempo real.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 3 OPTIONS PRESENTATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {themes.map((t) => {
            const isSelected = currentTheme.id === t.id;
            return (
              <div
                key={t.id}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 relative ${
                  isSelected
                    ? `${t.activeBorderClass} bg-slate-800/90 shadow-2xl ring-2`
                    : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Header Badge & Title */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        isSelected
                          ? 'bg-orange-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {t.optionLabel}
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.focusLabel}
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-white leading-snug">
                    {t.name}
                  </h4>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed min-h-[72px]">
                    {t.description}
                  </p>

                  {/* Motifs Badges */}
                  <div className="mt-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-sky-400" />
                      Motivos del Logo Integrados:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.motifs.map((motif, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {motif}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Typography Note */}
                  <div className="mt-3 text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-bold text-slate-300 not-italic">Tipografía: </span>
                    {t.typographyStyle}
                  </div>
                </div>

                {/* Footer Swatches & Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-4">
                  {/* Color Palette Swatches */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Muestra de Paleta (HEX):</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-mono">
                      <div className="space-y-1">
                        <div
                          className="h-7 rounded-lg border border-white/20 shadow-xs"
                          style={{ backgroundColor: t.primaryHex }}
                        />
                        <span className="text-slate-400 block text-[9px]">{t.primaryHex}</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className="h-7 rounded-lg border border-white/20 shadow-xs"
                          style={{ backgroundColor: t.secondaryHex }}
                        />
                        <span className="text-slate-400 block text-[9px]">{t.secondaryHex}</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className="h-7 rounded-lg border border-white/20 shadow-xs"
                          style={{ backgroundColor: t.accentHex }}
                        />
                        <span className="text-slate-400 block text-[9px]">{t.accentHex}</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className="h-7 rounded-lg border border-white/20 shadow-xs"
                          style={{ backgroundColor: t.greenHex }}
                        />
                        <span className="text-slate-400 block text-[9px]">{t.greenHex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => changeTheme(t.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-orange-500 text-white hover:text-slate-950 border border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Opción Seleccionada</span>
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4" />
                        <span>Elegir esta Opción</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Todos los diseños cumplen con el contraste WCAG y la paleta corporativa oficial de Crea-Ef.</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs transition shadow-md"
          >
            Confirmar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
