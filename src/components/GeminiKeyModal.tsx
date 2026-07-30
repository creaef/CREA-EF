import React, { useState } from 'react';
import { KeyRound, Sparkles, X, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('user_gemini_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    try {
      if (cleanKey) {
        localStorage.setItem('user_gemini_api_key', cleanKey);
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem('user_gemini_api_key');
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <KeyRound className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Clave de API Google Gemini (IA)</h3>
              <p className="text-xs text-slate-500">Configura tu propia clave gratuita para máxima velocidad y calidad</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-xl p-3.5 text-xs text-indigo-950 space-y-2">
          <div className="flex items-center space-x-2 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>¿Por qué agregar tu propia clave gratuita?</span>
          </div>
          <p className="leading-relaxed text-indigo-900">
            Google AI Studio ofrece una clave de API **100% gratuita y sin tarjeta de crédito**. Al agregar tu clave, la app generará justificaciones, retos y sesiones con la máxima extensión y calidad de Google Gemini.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-indigo-700 font-extrabold hover:underline pt-1"
          >
            <span>Obtener Clave Gratuita en Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Tu Clave Gemini (empieza por "AIzaSy..."):</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega aquí tu clave AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-slate-800"
            />
          </div>

          {saved && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">¡Clave de Gemini guardada correctamente!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:underline"
              >
                Eliminar Clave
              </button>
            ) : <div />}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Guardar Clave
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
