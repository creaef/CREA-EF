import React, { useEffect } from 'react';
import { Package, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';

interface Step9Props {
  recursosEspaciales: string[];
  setRecursosEspaciales: (v: string[]) => void;
  recursosMateriales: string[];
  setRecursosMateriales: (v: string[]) => void;
  recursosExternos: string[];
  setRecursosExternos: (v: string[]) => void;
  recursosCurriculares: string[];
  setRecursosCurriculares: (v: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DEFAULT_ESPACIALES = [
  'Pista polideportiva exterior del centro escolar',
  'Pabellón de Educación Física / Gimnasio cubierto',
  'Parque público / Entorno natural o parque periurbano de la localidad',
];

const DEFAULT_MATERIALES = [
  'Balones de gomaespuma de alta densidad y petos de colores variados',
  'Aros, picas, ladrillos de plástico y conos de delimitación espacial',
  'Combas largas y cortas, colchonetas y paracaídas de tela gigante',
  'Materiales reciclados (chapas decoradas, cajas de cartón, botellas)',
];

const DEFAULT_EXTERNOS = [
  'Altavoz Bluetooth portátil para audiciones y compases de música andaluza',
  'Tablets / Teléfonos móviles con lector de códigos QR',
];

const DEFAULT_CURRICULARES = [
  'Fichas visuales de figuras de Acrosport / Tarjetas DUA con normas ilustradas',
  'Dianas impresas para la autoevaluación emocional',
  'Cancionero popular andaluz y pautas del Marco DUA',
];

export const Step9Resources: React.FC<Step9Props> = ({
  recursosEspaciales,
  setRecursosEspaciales,
  recursosMateriales,
  setRecursosMateriales,
  recursosExternos,
  setRecursosExternos,
  recursosCurriculares,
  setRecursosCurriculares,
  onPrev,
  onNext,
}) => {
  useEffect(() => {
    if (recursosEspaciales.length === 0) setRecursosEspaciales([...DEFAULT_ESPACIALES]);
    if (recursosMateriales.length === 0) setRecursosMateriales([...DEFAULT_MATERIALES]);
    if (recursosExternos.length === 0) setRecursosExternos([...DEFAULT_EXTERNOS]);
    if (recursosCurriculares.length === 0) setRecursosCurriculares([...DEFAULT_CURRICULARES]);
  }, []);

  const handleAddItem = (list: string[], setter: (v: string[]) => void, defaultTxt: string) => {
    setter([...list, defaultTxt]);
  };

  const handleRemoveItem = (list: string[], setter: (v: string[]) => void, index: number) => {
    setter(list.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (list: string[], setter: (v: string[]) => void, index: number, value: string) => {
    const copy = [...list];
    copy[index] = value;
    setter(copy);
  };

  return (
    <div id="step9-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex items-center space-x-3 mb-2">
          <Package className="w-7 h-7 text-amber-400" />
          <h2 className="text-xl font-bold">Paso 9: Recursos e Instalaciones</h2>
        </div>
        <p className="text-indigo-100 text-sm max-w-3xl">
          Inventario de espacios, materiales escolares y deportivos, recursos digitales y materiales curriculares requeridos para el desarrollo de la SdA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Espaciales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">1. Recursos Espaciales e Instalaciones</h3>
            <button
              id="btn-add-espacial"
              onClick={() => handleAddItem(recursosEspaciales, setRecursosEspaciales, 'Nuevo espacio...')}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold px-2.5 py-1 rounded-lg transition border border-indigo-200 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
          <div className="space-y-2">
            {recursosEspaciales.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateItem(recursosEspaciales, setRecursosEspaciales, idx, e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-600"
                />
                <button
                  onClick={() => handleRemoveItem(recursosEspaciales, setRecursosEspaciales, idx)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Materiales Deportivos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">2. Materiales Escolares y Deportivos</h3>
            <button
              id="btn-add-material"
              onClick={() => handleAddItem(recursosMateriales, setRecursosMateriales, 'Nuevo material...')}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold px-2.5 py-1 rounded-lg transition border border-indigo-200 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
          <div className="space-y-2">
            {recursosMateriales.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateItem(recursosMateriales, setRecursosMateriales, idx, e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-600"
                />
                <button
                  onClick={() => handleRemoveItem(recursosMateriales, setRecursosMateriales, idx)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Externos / Digitales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">3. Recursos Digitales y Externos</h3>
            <button
              id="btn-add-externo"
              onClick={() => handleAddItem(recursosExternos, setRecursosExternos, 'Nuevo recurso digital...')}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold px-2.5 py-1 rounded-lg transition border border-indigo-200 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
          <div className="space-y-2">
            {recursosExternos.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateItem(recursosExternos, setRecursosExternos, idx, e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-600"
                />
                <button
                  onClick={() => handleRemoveItem(recursosExternos, setRecursosExternos, idx)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculares */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">4. Materiales Curriculares y Didácticos</h3>
            <button
              id="btn-add-curricular"
              onClick={() => handleAddItem(recursosCurriculares, setRecursosCurriculares, 'Nuevo recurso curricular...')}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold px-2.5 py-1 rounded-lg transition border border-indigo-200 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
          <div className="space-y-2">
            {recursosCurriculares.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateItem(recursosCurriculares, setRecursosCurriculares, idx, e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-600"
                />
                <button
                  onClick={() => handleRemoveItem(recursosCurriculares, setRecursosCurriculares, idx)}
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step9-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Evaluación</span>
        </button>

        <button
          id="btn-step9-next"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition"
        >
          <span>Siguiente: Resumen Sda</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
