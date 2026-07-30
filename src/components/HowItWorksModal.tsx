import React from 'react';
import { createPortal } from 'react-dom';
import { Info, X, CheckCircle2, BookOpen, Sparkles, FolderDown, ArrowRight, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      id="how-it-works-modal-backdrop"
      className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="how-it-works-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-7 text-slate-900 border border-slate-200 relative my-auto z-[100000] flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3 text-indigo-950">
            <div className="p-2.5 bg-indigo-900 text-amber-400 rounded-xl shadow-xs">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">Cómo Funciona la Aplicación Paso a Paso</h3>
              <p className="text-xs text-slate-500 font-medium">Guía de uso para docentes de Educación Física (Andalucía - LOMLOE)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition hover:bg-slate-100 font-bold"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Content Scrollable Area */}
        <div className="py-4 space-y-3.5 flex-1 overflow-y-auto pr-2 text-xs sm:text-sm">
          <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-100 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-indigo-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-900 text-amber-300 text-xs flex items-center justify-center font-black shrink-0">1</span>
              <span>Paso 1: Configuración de Datos Generales</span>
            </div>
            <p className="text-slate-600 pl-8 text-xs leading-relaxed">
              Define el Título de la SdA, elige el Curso/Ciclo (1º a 6º de Primaria) y la temática motriz (ej. Parkour, Juegos populares, Atletismo...).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-black shrink-0">2</span>
              <span>Pasos 2 y 3: Currículo LOMLOE (Andalucía)</span>
            </div>
            <p className="text-slate-600 pl-8 text-xs leading-relaxed">
              Selecciona los Criterios de Evaluación y los Saberes Básicos del Decreto 101/2023 de Andalucía aplicables a tu ciclo.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-black shrink-0">3</span>
              <span>Paso 4: Metodología y Pautas DUA</span>
            </div>
            <p className="text-slate-600 pl-8 text-xs leading-relaxed">
              Establece las pautas DUA para la inclusión universal y selecciona los estilos de enseñanza aplicados.
            </p>
          </div>

          <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-amber-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-black shrink-0">4</span>
              <span>Paso 5: Integración Google Drive y Generación con IA</span>
            </div>
            <p className="text-slate-700 pl-8 text-xs leading-relaxed">
              Conecta carpetas de tu Google Drive para que la IA extraiga tus fichas reales. Cada sesión incluye <strong>al menos 4 juegos en la Parte Principal</strong> con sus esquemas espaciales.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-black shrink-0">5</span>
              <span>Pasos 6 a 9: Reto Final, NEAE y Evaluación Formativa</span>
            </div>
            <p className="text-slate-600 pl-8 text-xs leading-relaxed">
              Configura el reto final, medidas de diversidad para NEAE y genera rúbricas criteriales de 4 niveles e instrumentos formativos.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/90 rounded-xl border border-emerald-200 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-emerald-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black shrink-0">6</span>
              <span>Paso 10: Descarga Directa y Guardado</span>
            </div>
            <p className="text-slate-700 pl-8 text-xs leading-relaxed">
              Descarga la SdA completa de forma directa en <strong>PDF</strong> o <strong>Word (.doc)</strong> e imprime o guarda tus SdAs en el navegador.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm"
          >
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
