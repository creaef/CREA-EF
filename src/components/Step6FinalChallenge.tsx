import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Curso, TematicaEF } from '../types';

interface Step6Props {
  tituloSdA: string;
  curso: Curso;
  tematica: TematicaEF;
  metodologiaActiva: string;
  productoFinal: string;
  setProductoFinal: (v: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step6FinalChallenge: React.FC<Step6Props> = ({
  tituloSdA,
  curso,
  tematica,
  metodologiaActiva,
  productoFinal,
  setProductoFinal,
  onPrev,
  onNext,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  useEffect(() => {
    if (!productoFinal.trim()) {
      // Auto-generate a default challenge if empty
      setProductoFinal(
        `Reto Final "Gran Festival de ${tematica}": Celebración colectiva en la que todo el alumnado de ${curso}, organizado en equipos mixtos e inclusivos, pondrán en práctica los aprendizajes adquiridos. Cada grupo presentará su propuesta o participará en una exhibición/torneo coeducativo donde primará el juego limpio (Fair Play), el respeto a las normas y la colaboración mutua.`
      );
    }
  }, []);

  const handleGenerateAiChallenge = async () => {
    setErrorAi(null);
    setLoadingAi(true);

    try {
      const res = await fetch('/api/ai/generate-final-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tituloSdA,
          curso,
          tematica,
          metodologia: metodologiaActiva,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.descripcionReto) {
        const titleText = data.tituloReto ? `Reto Final "${data.tituloReto}": ` : '';
        setProductoFinal(`${titleText}${data.descripcionReto}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorAi(err.message || 'Error al generar el reto final con IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div id="step6-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex items-center space-x-3 mb-2">
          <Trophy className="w-7 h-7 text-amber-400" />
          <h2 className="text-xl font-bold">Paso 6: Producto Final / Reto Motor Culminante</h2>
        </div>
        <p className="text-indigo-100 text-sm max-w-3xl">
          Define la tarea integradora o reto motivador que culmina la SdA, donde el alumnado aplica los saberes aprendidos.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <label id="label-producto-final" className="block text-base font-bold text-slate-900">
            Descripción del Producto Final o Reto Colectivo
          </label>
          <button
            id="btn-generate-challenge-ai"
            type="button"
            disabled={loadingAi}
            onClick={handleGenerateAiChallenge}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition border border-amber-300 shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-slate-950 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>{loadingAi ? 'Diseñando reto con IA...' : 'Generar Reto con IA Gemini'}</span>
          </button>
        </div>

        <textarea
          id="textarea-producto-final"
          rows={6}
          value={productoFinal}
          onChange={(e) => setProductoFinal(e.target.value)}
          placeholder="Escribe o genera con IA el producto final (ej: Exhibición de bailes andaluces, Torneo coeducativo de Goubak con tarjetas de Fair Play, Circuito Plogging escolar...)"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm leading-relaxed"
        />

        {errorAi && (
          <div id="error-ai-challenge" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorAi}</span>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step6-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Sesiones</span>
        </button>

        <button
          id="btn-step6-next"
          disabled={!productoFinal.trim()}
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
        >
          <span>Siguiente: Atención a la Diversidad (DUA)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
