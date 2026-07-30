import React, { useEffect } from 'react';
import { BookOpen, CheckSquare, Square, ArrowLeft, ArrowRight, Globe, Layers } from 'lucide-react';
import { Ciclo } from '../types';
import { SABERES_BASICOS_EF, ODS_LIST, DESCRIPTORES_OPERATIVOS_MAP } from '../data/curriculumData';

interface Step3Props {
  ciclo: Ciclo;
  saberesSeleccionados: string[];
  setSaberesSeleccionados: (v: string[]) => void;
  odsSeleccionados: string[];
  setOdsSeleccionados: (v: string[]) => void;
  descriptoresOperativos: string[];
  setDescriptoresOperativos: (v: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step3Saberes: React.FC<Step3Props> = ({
  ciclo,
  saberesSeleccionados,
  setSaberesSeleccionados,
  odsSeleccionados,
  setOdsSeleccionados,
  descriptoresOperativos,
  setDescriptoresOperativos,
  onPrev,
  onNext,
}) => {
  const saberesDelCiclo = SABERES_BASICOS_EF.filter((s) => s.ciclo === ciclo);

  // Auto select default Saberes, ODS, and Descriptores if none are selected
  useEffect(() => {
    if (saberesSeleccionados.length === 0 && saberesDelCiclo.length > 0) {
      setSaberesSeleccionados(saberesDelCiclo.slice(0, 4).map((s) => s.codigo));
    }
    if (odsSeleccionados.length === 0) {
      setOdsSeleccionados(['ODS 3: Salud y Bienestar', 'ODS 4: Educación de Calidad']);
    }
    if (descriptoresOperativos.length === 0) {
      setDescriptoresOperativos(['CPSAA2', 'CC1', 'STEM1', 'CD1']);
    }
  }, [ciclo]);

  const toggleSaber = (codigo: string) => {
    if (saberesSeleccionados.includes(codigo)) {
      setSaberesSeleccionados(saberesSeleccionados.filter((s) => s !== codigo));
    } else {
      setSaberesSeleccionados([...saberesSeleccionados, codigo]);
    }
  };

  const toggleOds = (id: string) => {
    if (odsSeleccionados.includes(id)) {
      setOdsSeleccionados(odsSeleccionados.filter((o) => o !== id));
    } else {
      setOdsSeleccionados([...odsSeleccionados, id]);
    }
  };

  const toggleDescriptor = (codigo: string) => {
    if (descriptoresOperativos.includes(codigo)) {
      setDescriptoresOperativos(descriptoresOperativos.filter((d) => d !== codigo));
    } else {
      setDescriptoresOperativos([...descriptoresOperativos, codigo]);
    }
  };

  return (
    <div id="step3-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-7 h-7 text-amber-400" />
          <h2 className="text-xl font-bold">Paso 3: Saberes Básicos, ODS y Descriptores Operativos</h2>
        </div>
        <p className="text-indigo-100 text-sm max-w-3xl">
          Selecciona los Saberes Básicos por bloques de contenidos (A a F) alineados con el <strong>{ciclo}</strong> y conecta con los Objetivos de Desarrollo Sostenible (ODS).
        </p>
      </div>

      {/* Saberes Básicos por Bloque */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-700" />
            <span>Saberes Básicos (Bloques A-F) - {ciclo}</span>
          </h3>
          <span className="text-xs bg-indigo-100 text-indigo-900 font-bold px-2.5 py-1 rounded-full">
            {saberesSeleccionados.length} seleccionados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saberesDelCiclo.map((saber) => {
            const isSelected = saberesSeleccionados.includes(saber.codigo);
            return (
              <div
                key={saber.codigo}
                onClick={() => toggleSaber(saber.codigo)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 text-indigo-700">
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold bg-indigo-900 text-white px-2 py-0.5 rounded">
                      Bloque {saber.bloque}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{saber.codigo}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">{saber.bloqueNombre}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{saber.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ODS y Descriptores Operativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ODS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-700" />
              <span>Objetivos de Desarrollo Sostenible (ODS)</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {ODS_LIST.map((ods) => {
              const isSelected = odsSeleccionados.includes(ods.id);
              return (
                <div
                  key={ods.id}
                  onClick={() => toggleOds(ods.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                    isSelected ? 'bg-amber-50 border-amber-400 shadow-2xs' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="mt-0.5 text-amber-600">
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{ods.nombre}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{ods.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descriptores Operativos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Descriptores Operativos del Perfil de Salida (Decreto 101/2023)
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {DESCRIPTORES_OPERATIVOS_MAP.map((d) => {
              const isSelected = descriptoresOperativos.includes(d.codigo);
              return (
                <button
                  type="button"
                  key={d.codigo}
                  onClick={() => toggleDescriptor(d.codigo)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    isSelected
                      ? 'bg-indigo-700 text-white border-indigo-800 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold">{d.codigo}</div>
                  <div className="text-[10px] opacity-90 truncate">{d.nombre}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step3-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Currículo</span>
        </button>

        <button
          id="btn-step3-next"
          disabled={saberesSeleccionados.length === 0}
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
        >
          <span>Siguiente: Metodología y Modelos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
