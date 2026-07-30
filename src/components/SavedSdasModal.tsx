import React from 'react';
import { createPortal } from 'react-dom';
import { FolderDown, X, FileText, Trash2, ArrowRight, Calendar, BookOpen, Layers } from 'lucide-react';
import { SituacionAprendizaje } from '../types';

interface SavedSdasModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSdas: SituacionAprendizaje[];
  onLoadSdA: (sda: SituacionAprendizaje) => void;
  onDeleteSdA: (id: string) => void;
}

export const SavedSdasModal: React.FC<SavedSdasModalProps> = ({
  isOpen,
  onClose,
  savedSdas,
  onLoadSdA,
  onDeleteSdA,
}) => {
  if (!isOpen) return null;

  const handleDelete = (sda: SituacionAprendizaje, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la SdA "${sda.titulo || 'Sin título'}"? Esta acción no se puede deshacer.`
    );
    if (confirmed) {
      onDeleteSdA(sda.id);
    }
  };

  const modalContent = (
    <div
      id="saved-sdas-modal-backdrop"
      className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="saved-sdas-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-7 text-slate-900 border border-slate-200 relative my-auto z-[100000] flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3 text-indigo-950">
            <div className="p-2.5 bg-indigo-900 text-amber-400 rounded-xl shadow-xs">
              <FolderDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                Situaciones de Aprendizaje Guardadas
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Historial de programación almacenado en tu navegador ({savedSdas.length} {savedSdas.length === 1 ? 'guardada' : 'guardadas'})
              </p>
            </div>
          </div>
          <button
            id="btn-close-saved-modal-x"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition hover:bg-slate-100 font-bold"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="py-4 space-y-3 flex-1 overflow-y-auto pr-2 text-xs sm:text-sm">
          {savedSdas.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="p-3 bg-indigo-50 text-indigo-900 rounded-2xl inline-block">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Aún no tienes SdAs guardadas</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Genera tu Situación de Aprendizaje a lo largo de los 10 pasos y haz clic en el botón <strong className="text-slate-700">"Guardar SdA"</strong> en el paso final para acumularlas aquí.
              </p>
            </div>
          ) : (
            savedSdas.map((sda) => (
              <div
                key={sda.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-indigo-900 text-amber-300 font-extrabold text-[10px] rounded-md uppercase tracking-wider shrink-0">
                      {sda.curso || 'EF'}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate group-hover:text-indigo-900 transition">
                      {sda.titulo || 'Situación de Aprendizaje sin título'}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sda.numSesiones} sesiones ({sda.trimestre})</span>
                    </span>
                    {sda.tematica && (
                      <span className="flex items-center space-x-1 font-medium text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{sda.tematica}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sda.fechaCreacion}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 w-full sm:w-auto justify-end">
                  <button
                    id={`btn-load-sda-${sda.id}`}
                    onClick={() => {
                      onLoadSdA(sda);
                      onClose();
                    }}
                    className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5"
                    title="Cargar esta SdA en el editor"
                  >
                    <span>Cargar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-delete-sda-${sda.id}`}
                    onClick={(e) => handleDelete(sda, e)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    title="Eliminar esta SdA permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 mt-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Tus datos se guardan localmente en tu navegador web.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition ml-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
