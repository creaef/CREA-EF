import React, { useState } from 'react';
import { generateDiversityApi } from '../utils/aiClient';
import {
  Users,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { AdaptacionNEAE, PautaDUA } from '../types';

interface Step7Props {
  neaeSeleccionadas?: string[];
  setNeaeSeleccionadas?: (v: string[]) => void;
  adaptacionesNEAE: AdaptacionNEAE[];
  setAdaptacionesNEAE: (v: AdaptacionNEAE[]) => void;
  pautasDUA: PautaDUA[] | any[];
  setPautasDUA: (v: any[]) => void;
  sdaContext?: {
    titulo: string;
    curso: string;
    tematica: string;
    productoFinal: string;
  };
  onPrev: () => void;
  onNext: () => void;
}

const OPCIONES_CASUISTICAS = [
  'TDAH / Impulsividad / Dificultad Atencional',
  'Discapacidad Motora / Movilidad Reducida',
  'Discapacidad Visual / Baja Visión',
  'Discapacidad Auditiva / Hipoacusia',
  'Trastorno del Espectro Autista (TEA)',
  'Altas Capacidades Intelectuales',
  'Dificultades de Coordinación Motriz',
  'Retraso Madurativo / Dificultades del Aprendizaje',
];

export const Step7Diversity: React.FC<Step7Props> = ({
  neaeSeleccionadas = [],
  setNeaeSeleccionadas,
  adaptacionesNEAE,
  setAdaptacionesNEAE,
  pautasDUA,
  setPautasDUA,
  sdaContext,
  onPrev,
  onNext,
}) => {
  const [selectedCases, setSelectedCases] = useState<string[]>(neaeSeleccionadas);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleCase = (casuistica: string) => {
    let next: string[];
    if (selectedCases.includes(casuistica)) {
      next = selectedCases.filter((c) => c !== casuistica);
    } else {
      next = [...selectedCases, casuistica];
    }
    setSelectedCases(next);
    if (setNeaeSeleccionadas) setNeaeSeleccionadas(next);
  };

  React.useEffect(() => {
    if (adaptacionesNEAE.length === 0 || pautasDUA.length === 0) {
      handleGenerateDiversityAI();
    }
  }, []);

  const handleGenerateDiversityAI = async () => {
    setLoadingAi(true);
    setErrorMsg(null);
    try {
      const data = await generateDiversityApi({
        tematica: sdaContext?.tematica || 'Educación Física',
        ciclo: sdaContext?.ciclo || 'Primer Ciclo',
        necesidades: selectedCases.join(', '),
      });

      if (data) {
        if (data.medidasNeae) {
          const adaptacionesFormatted = data.medidasNeae.map((item: any, idx: number) => {
            const casuisticaName = selectedCases[idx] || (typeof item === 'object' && item.categoria) || 'Atención a la Diversidad General';
            const medStr = typeof item === 'string' ? item : item.materialesYEspacio || item.medida || '';
            return {
              id: `neae-${idx + 1}`,
              categoria: casuisticaName,
              casuistica: casuisticaName,
              materialesYEspacio: medStr || 'Adaptación de materiales, terrenos y balones acolchados/sonoros.',
              reglasYMetodologia: (typeof item === 'object' && item.reglasYMetodologia) || 'Flexibilización de reglas, tiempos y apoyos visuales DUA.',
              pautasDocente: (typeof item === 'object' && item.pautasDocente) || 'Feedback positivo, clima de aula seguro y tutorías entre iguales.',
              medida: medStr,
            };
          });
          setAdaptacionesNEAE(adaptacionesFormatted);
        }
        if (data.pautasDua) {
          const pautasFormatted = data.pautasDua.map((pauta: string, idx: number) => ({
            id: `dua-${idx + 1}`,
            principio: 'Principio DUA',
            pauta,
          }));
          setPautasDUA(pautasFormatted);
        }
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error al conectar con la IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUpdateAdaptacion = (index: number, field: keyof AdaptacionNEAE, value: string) => {
    const copy = [...adaptacionesNEAE];
    copy[index] = { ...copy[index], [field]: value };
    setAdaptacionesNEAE(copy);
  };

  return (
    <div id="step7-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-7 h-7 text-amber-400" />
          <h2 className="text-xl font-bold">Paso 7: Atención a la Diversidad e Inclusión (Marco DUA y NEAE)</h2>
        </div>
        <p className="text-indigo-100 text-sm max-w-3xl">
          Selecciona las casuísticas del alumnado con necesidades específicas de apoyo educativo (NEAE) presentes en tu aula para generar adaptaciones personalizadas. A continuación se presentarán las Pautas Universales DUA.
        </p>
      </div>

      {/* 1. SELECCIÓN DE CASUÍSTICAS DE ALUMNADO NEAE */}
      <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-700" />
              <span>1. Elección de Casuísticas de Alumnado NEAE en el Aula</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Marca las necesidades que deseas atender en esta Situación de Aprendizaje.
            </p>
          </div>

          <button
            id="btn-generate-diversity-ai"
            onClick={handleGenerateDiversityAI}
            disabled={loadingAi}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition shadow-md border border-amber-300 disabled:opacity-50"
          >
            {loadingAi ? (
              <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950" />
            )}
            <span>
              {adaptacionesNEAE.length > 0 ? 'Volver a generar Adaptaciones con IA' : 'Generar Adaptaciones NEAE con IA'}
            </span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 font-semibold text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {OPCIONES_CASUISTICAS.map((cas) => {
            const isChecked = selectedCases.includes(cas);
            return (
              <button
                key={cas}
                type="button"
                onClick={() => toggleCase(cas)}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-start space-x-2 ${
                  isChecked
                    ? 'bg-indigo-950 text-white border-indigo-950 shadow-xs'
                    : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200/80'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center ${
                    isChecked ? 'bg-amber-400 border-amber-400 text-slate-950' : 'bg-white border-slate-400'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="leading-snug">{cas}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ADAPTACIONES ESPECÍFICAS GENERADAS */}
      {adaptacionesNEAE.length > 0 && (
        <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-700" />
            <span>2. Adaptaciones Prácticas Específicas por Casuística</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adaptacionesNEAE.map((neae, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/80 text-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                  <span className="text-xs font-bold bg-indigo-950 text-white px-2.5 py-1 rounded-lg">
                    {neae.categoria}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">Adaptación de Materiales y Espacio:</label>
                  <textarea
                    rows={2}
                    value={neae.materialesYEspacio || ''}
                    onChange={(e) => handleUpdateAdaptacion(idx, 'materialesYEspacio', e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">Reglas y Modificaciones Metodológicas:</label>
                  <textarea
                    rows={2}
                    value={neae.reglasYMetodologia || ''}
                    onChange={(e) => handleUpdateAdaptacion(idx, 'reglasYMetodologia', e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">Pautas para el Docente durante las Clases:</label>
                  <textarea
                    rows={2}
                    value={neae.pautasDocente || ''}
                    onChange={(e) => handleUpdateAdaptacion(idx, 'pautasDocente', e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PAUTAS UNIVERSALES DUA (Aparecen después de NEAE) */}
      <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center space-x-2">
          <HeartHandshake className="w-5 h-5 text-indigo-700" />
          <span>3. Pautas Universales DUA (Diseño Universal para el Aprendizaje)</span>
        </h3>

        {Array.isArray(pautasDUA) && pautasDUA.length > 0 ? (
          <div className="space-y-4">
            {pautasDUA.map((p, pIdx) => (
              <div key={pIdx} className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 space-y-2">
                <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wide">
                  {typeof p === 'string' ? `Pauta ${pIdx + 1}` : p.principio}
                </h4>
                {typeof p === 'string' ? (
                  <p className="text-xs text-slate-900 font-medium leading-relaxed">{p}</p>
                ) : (
                  <ul className="space-y-1.5 pl-2">
                    {Array.isArray(p.pautas) &&
                      p.pautas.map((item: string, iIdx: number) => (
                        <li key={iIdx} className="text-xs text-slate-900 font-medium flex items-start space-x-2">
                          <span className="text-indigo-700 font-bold">•</span>
                          <span className="text-slate-900">{item}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic font-medium">
            Haz clic en <strong>Generar Adaptaciones NEAE con IA</strong> para rellenar las Pautas Universales DUA adaptadas a esta propuesta.
          </p>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step7-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Producto Final</span>
        </button>

        <button
          id="btn-step7-next"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition"
        >
          <span>Siguiente: Evaluación Formativa</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
