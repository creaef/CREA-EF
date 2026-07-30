import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  AlertCircle,
  ArrowRight,
  Search,
  Plus,
  X,
  Shuffle,
  CheckCircle2,
  Check,
  Tag,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import { Curso, Trimestre, TematicaEF, Ciclo } from '../types';
import { getCicloFromCurso } from '../utils/sdaGenerator';
import { LISTA_UNIFICADA_TEMATICAS } from '../data/proposedThemes';
import { generateJustificationApi } from '../utils/aiClient';
import { GoogleDriveSelectorModal } from './GoogleDriveSelectorModal';

interface Step1Props {
  titulo: string;
  setTitulo: (v: string) => void;
  curso: Curso;
  setCurso: (v: Curso) => void;
  trimestre: Trimestre;
  setTrimestre: (v: Trimestre) => void;
  numSesiones: number;
  setNumSesiones: (v: number) => void;
  tematica: TematicaEF;
  setTematica: (v: TematicaEF) => void;
  justificacion: string;
  setJustificacion: (v: string) => void;
  onNext: () => void;
}

const CURSOS_LIST: Curso[] = [
  '1º Primaria',
  '2º Primaria',
  '3º Primaria',
  '4º Primaria',
  '5º Primaria',
  '6º Primaria',
];

const TRIMESTRES_LIST: Trimestre[] = ['1º Trimestre', '2º Trimestre', '3º Trimestre'];

export const Step1General: React.FC<Step1Props> = ({
  titulo,
  setTitulo,
  curso,
  setCurso,
  trimestre,
  setTrimestre,
  numSesiones,
  setNumSesiones,
  tematica,
  setTematica,
  justificacion,
  setJustificacion,
  onNext,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Parse current tematica into an array of selected theme ideas
  const [selectedThemes, setSelectedThemes] = useState<string[]>(() => {
    if (!tematica) return [];
    return tematica
      .split(', ')
      .map((s) => s.trim())
      .filter(Boolean);
  });

  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const cicloCalculado: Ciclo = getCicloFromCurso(curso);

  // Sync selected themes with parent state whenever selectedThemes array changes
  const updateParentTematica = (newThemes: string[]) => {
    setSelectedThemes(newThemes);
    setTematica(newThemes.join(', '));
  };

  const handleToggleTheme = (themeName: string) => {
    if (selectedThemes.includes(themeName)) {
      const next = selectedThemes.filter((t) => t !== themeName);
      updateParentTematica(next);
    } else {
      const next = [...selectedThemes, themeName];
      updateParentTematica(next);
    }
  };

  const handleAddCustomIdea = () => {
    if (!customIdeaInput.trim()) return;
    const idea = customIdeaInput.trim();
    if (!selectedThemes.includes(idea)) {
      const next = [...selectedThemes, idea];
      updateParentTematica(next);
    }
    setCustomIdeaInput('');
  };

  const handlePickThreeRandom = () => {
    const shuffled = [...LISTA_UNIFICADA_TEMATICAS].sort(() => 0.5 - Math.random());
    const three = shuffled.slice(0, 3);
    updateParentTematica(three);
  };

  const handleClearThemes = () => {
    updateParentTematica([]);
  };

  const filteredThemes = LISTA_UNIFICADA_TEMATICAS.filter((t) =>
    t.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateJustification = async () => {
    if (!titulo.trim()) {
      setErrorAi('Por favor, escribe un Título para la SdA antes de generar la justificación.');
      return;
    }
    if (!tematica.trim()) {
      setErrorAi('Por favor, añade o selecciona al menos una temática antes de generar la justificación.');
      return;
    }
    setErrorAi(null);
    setLoadingAi(true);

    try {
      const justificacionText = await generateJustificationApi({
        titulo,
        curso,
        ciclo: cicloCalculado,
        tematica,
      });

      if (justificacionText) {
        setJustificacion(justificacionText);
      }
    } catch (err: any) {
      console.error(err);
      setErrorAi(err.message || 'Error al generar la justificación con IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const isFormValid =
    titulo.trim().length > 0 && tematica.trim().length > 0 && justificacion.trim().length > 0;

  return (
    <div id="step1-container" className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="w-7 h-7 text-amber-400" />
          <h2 className="text-xl font-bold">Paso 1: Datos Generales y Temática SdA</h2>
        </div>
        <p className="text-indigo-100 text-sm max-w-3xl">
          Define las coordenadas principales de tu Situación de Aprendizaje para el área de Educación Física bajo la normativa LOMLOE de Andalucía.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Title Input */}
        <div>
          <label id="label-sda-titulo" className="block text-sm font-bold text-slate-800 mb-1">
            Título de la Situación de Aprendizaje <span className="text-red-500">*</span>
          </label>
          <input
            id="input-sda-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Misión Flamenca: Descubriendo el Folclore Andaluz en Movimiento"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium text-sm transition"
          />
        </div>

        {/* Course, Trimestre, Num Sesiones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Curso / Level Select */}
          <div>
            <label id="label-sda-curso" className="block text-sm font-bold text-slate-800 mb-1">
              Curso / Nivel Educativo
            </label>
            <select
              id="select-sda-curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value as Curso)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm font-medium bg-slate-50"
            >
              {CURSOS_LIST.map((c) => (
                <option key={c} value={c}>
                  {c} ({getCicloFromCurso(c)})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Ciclo asignado automáticamente: <strong className="text-indigo-700">{cicloCalculado}</strong>
            </p>
          </div>

          {/* Trimestre */}
          <div>
            <label id="label-sda-trimestre" className="block text-sm font-bold text-slate-800 mb-1">
              Trimestre
            </label>
            <select
              id="select-sda-trimestre"
              value={trimestre}
              onChange={(e) => setTrimestre(e.target.value as Trimestre)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm font-medium bg-slate-50"
            >
              {TRIMESTRES_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Num Sesiones */}
          <div>
            <label id="label-sda-num-sesiones" className="block text-sm font-bold text-slate-800 mb-1">
              Número de Sesiones Totales (60 min/sesión)
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="input-sda-num-sesiones"
                type="number"
                min={2}
                max={16}
                value={numSesiones}
                onChange={(e) => setNumSesiones(Math.max(2, Math.min(16, parseInt(e.target.value) || 6)))}
                className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold text-sm bg-slate-50"
              />
              <span className="text-xs text-slate-500">Recomendado: 6 a 10 sesiones por SdA.</span>
            </div>
          </div>
        </div>

        {/* Banner de Acceso y Personalización con Cuenta de Google */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-700/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start space-x-3 max-w-2xl">
              <div className="p-2.5 bg-indigo-900/80 rounded-xl border border-indigo-700/50 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    Acceso y Personalización con Cuenta de Google (IA Dedicada)
                  </h4>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Al conectar o iniciar sesión con tu cuenta de Google, la aplicación activa automáticamente tu cuota de IA dedicada (Google Gemini) para generar justificaciones, retos y sesiones con la máxima extensión y profundidad pedagógica. Además, te ofrecerá mayor personalización según tus recursos de aprendizaje.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Conectar Cuenta de Google</span>
              </button>
            </div>
          </div>
        </div>

        {/* CUADRO DE SELECCIÓN Y COMPOSICIÓN DE TEMÁTICAS */}
        <div id="cuadro-tematicas-container" className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
            <div>
              <h3 className="font-bold text-indigo-950 text-base flex items-center space-x-2">
                <Tag className="w-5 h-5 text-indigo-700 shrink-0" />
                <span>Cuadro de Selección y Composición de Temáticas</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Escribe ideas propias y/o selecciona al menos <strong>3 propuestas</strong> de la lista unificada oficial para articular tu SdA.
              </p>
            </div>

            {/* Selected Ideas Counter Badge */}
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 transition ${
                  selectedThemes.length >= 3
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : selectedThemes.length > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {selectedThemes.length >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {selectedThemes.length} / 3+ ideas seleccionadas
                </span>
              </span>

              {selectedThemes.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearThemes}
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
                  title="Limpiar todas las temáticas seleccionadas"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Active / Selected Ideas Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Ideas Temáticas Activas en esta SdA:
            </label>
            {selectedThemes.length === 0 ? (
              <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 text-center">
                Aún no has seleccionado ninguna idea. Escribe una idea abajo o marca 3 o más de la lista oficial.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedThemes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-900 text-white text-xs font-semibold shadow-2xs border border-indigo-950 animate-fadeIn"
                  >
                    <span>{theme}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTheme(theme)}
                      className="hover:bg-indigo-700 p-0.5 rounded-full text-indigo-200 hover:text-white transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Write and Add Custom Idea Field */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Añadir Idea Propia o Personalizada:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customIdeaInput}
                onChange={(e) => setCustomIdeaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomIdea();
                  }
                }}
                placeholder="Escribe tu propia idea de temática y pulsa Añadir (ej: Misión Espacial en EF, Torneo de Quidditch adaptado)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleAddCustomIdea}
                disabled={!customIdeaInput.trim()}
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition shadow-2xs disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Search, Random Pick & Themes Checklist Grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar entre las 65 temáticas oficiales (ej: danza, parkour, juegos, salud, agua)..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={handlePickThreeRandom}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition border border-amber-300 shadow-2xs"
              >
                <Shuffle className="w-4 h-4" />
                <span>Seleccionar 3 Aleatorias</span>
              </button>
            </div>

            {/* List of 65 Unified Proposed Themes with Checkboxes */}
            <div className="max-h-64 overflow-y-auto pr-1 bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {filteredThemes.length === 0 ? (
                <div className="col-span-2 text-center text-slate-500 py-4">
                  No se encontraron temáticas para "{searchTerm}".
                </div>
              ) : (
                filteredThemes.map((themeItem) => {
                  const isChecked = selectedThemes.includes(themeItem);
                  return (
                    <button
                      key={themeItem}
                      type="button"
                      onClick={() => handleToggleTheme(themeItem)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start space-x-2.5 ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-500/30 text-indigo-950 font-bold shadow-2xs'
                          : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition ${
                          isChecked
                            ? 'bg-indigo-700 border-indigo-800 text-white'
                            : 'bg-white border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-snug">{themeItem}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Consolidated Temática Text Field */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Temática Consolidada de la SdA (Resultado):
            </label>
            <textarea
              rows={2}
              value={tematica}
              onChange={(e) => {
                setTematica(e.target.value);
                // Also update array if edited manually
                setSelectedThemes(
                  e.target.value
                    .split(', ')
                    .map((s) => s.trim())
                    .filter(Boolean)
                );
              }}
              placeholder="Las temáticas seleccionadas o escritas se consolidan aquí..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Justificación y Temática */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label id="label-sda-justificacion" className="block text-sm font-bold text-slate-800">
              Justificación de la Propuesta <span className="text-red-500">*</span>
            </label>
            <button
              id="btn-generate-justification-ai"
              type="button"
              disabled={loadingAi}
              onClick={handleGenerateJustification}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition border border-indigo-200 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'Generando con IA...' : 'Generar Justificación con IA'}</span>
            </button>
          </div>

          <textarea
            id="textarea-sda-justificacion"
            rows={5}
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            placeholder="Introduce la justificación pedagógica o pulsa en 'Generar Justificación con IA' para que el sistema redacte la justificación alineada con la LOMLOE andaluza..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm transition"
          />

          {errorAi && (
            <div id="error-ai-justification" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorAi}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-2">
        <button
          id="btn-step1-next"
          disabled={!isFormValid}
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Siguiente: Conexión Curricular</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <GoogleDriveSelectorModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSelectFolderAndContent={() => {
          setIsDriveModalOpen(false);
        }}
      />
    </div>
  );
};

