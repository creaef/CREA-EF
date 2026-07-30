import React from 'react';
import { Boxes, ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { ModeloEstructuraSesion } from '../types';
import { METODOLOGIAS_ACTIVAS, MODELOS_ESTRUCTURA_SESION } from '../data/methodologiesAndModels';

interface Step4Props {
  metodologiaActiva: string;
  setMetodologiaActiva: (v: string) => void;
  modeloEstructura: ModeloEstructuraSesion;
  setModeloEstructura: (v: ModeloEstructuraSesion) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step4Methodology: React.FC<Step4Props> = ({
  metodologiaActiva,
  setMetodologiaActiva,
  modeloEstructura,
  setModeloEstructura,
  onPrev,
  onNext,
}) => {
  // Helper to check selection and toggle (allowing 0, 1 or max 2 active methodologies)
  const isSelected = (nombre: string) => {
    if (!metodologiaActiva) return false;
    return metodologiaActiva.includes(nombre);
  };

  const handleToggleMetodologia = (nombre: string) => {
    if (!metodologiaActiva || metodologiaActiva.includes('Ninguna')) {
      setMetodologiaActiva(nombre);
      return;
    }

    const currentList = metodologiaActiva.split(', ').filter((item) => item && !item.includes('Ninguna'));

    if (currentList.includes(nombre)) {
      const newList = currentList.filter((item) => item !== nombre);
      setMetodologiaActiva(newList.length > 0 ? newList.join(', ') : 'Ninguna (Metodología Directa / Tradicional)');
    } else {
      if (currentList.length >= 2) {
        // Replace second or allow max 2
        setMetodologiaActiva([currentList[0], nombre].join(', '));
      } else {
        setMetodologiaActiva([...currentList, nombre].join(', '));
      }
    }
  };

  return (
    <div id="step4-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex items-center space-x-3 mb-2">
          <Boxes className="w-7 h-7 text-amber-400" />
          <h2 className="text-xl font-bold">Paso 4: Marco Metodológico y Estructura de Sesión</h2>
        </div>
        <p className="text-indigo-100 text-sm max-w-3xl">
          Puedes seleccionar hasta <strong>2 Metodologías Activas</strong> (o dejarlo en Metodología Directa/Tradicional) y un Modelo de Estructuración Cronométrica (60 minutos) para tu Situación de Aprendizaje.
        </p>
      </div>

      {/* 1. Seleccionar Metodología Activa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 text-base">
            1. Metodologías Activas en EF (Elige 0, 1 o hasta 2)
          </h3>
          <button
            type="button"
            onClick={() => setMetodologiaActiva('Ninguna (Metodología Directa / Tradicional)')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition ${
              metodologiaActiva.includes('Ninguna') || !metodologiaActiva
                ? 'bg-slate-900 text-white border-slate-950'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            Ninguna / Instrucción Directa Tradicional
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {METODOLOGIAS_ACTIVAS.map((m) => {
            const checked = isSelected(m.nombre);
            return (
              <div
                key={m.id}
                onClick={() => handleToggleMetodologia(m.nombre)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  checked
                    ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{m.nombre}</h4>
                    {checked && <CheckCircle className="w-5 h-5 text-indigo-700 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{m.descripcion}</p>
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200 text-[11px] text-indigo-950 font-medium">
                  <strong>Ejemplo:</strong> {m.ejemploAplicacion}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Seleccionar Modelo de Estructuración de Sesión */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-indigo-700" />
          <span>2. Modelos de Estructuración de Sesión (60 Minutos)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MODELOS_ESTRUCTURA_SESION.map((mod) => {
            const isSelected = modeloEstructura === mod.id;
            return (
              <div
                key={mod.id}
                onClick={() => setModeloEstructura(mod.id)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold bg-indigo-900 text-white px-2.5 py-0.5 rounded-full">
                      {mod.id}
                    </span>
                    {isSelected && <CheckCircle className="w-5 h-5 text-indigo-700" />}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{mod.nombre}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mod.enfoque}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Fases del cronograma (60 min):
                    </span>
                    {mod.fases.map((f, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs py-1 border-b border-dashed border-slate-200 last:border-0">
                        <span className="font-medium text-slate-800">{f.nombre}</span>
                        <span className="font-bold text-indigo-900 bg-indigo-100/80 px-2 py-0.5 rounded-md text-[11px] shrink-0 ml-2">
                          {f.duracionDefecto} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step4-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Saberes Básicos</span>
        </button>

        <button
          id="btn-step4-next"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition"
        >
          <span>Siguiente: Generación de Sesiones</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
