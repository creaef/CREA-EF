import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  FileType,
  FileSpreadsheet,
} from 'lucide-react';
import { parseLocalFileClient } from '../utils/localFileParser';

interface LocalFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocalDocumentation: (extractedText: string, fileName: string) => void;
}

export const LocalFilesModal: React.FC<LocalFilesModalProps> = ({
  isOpen,
  onClose,
  onAddLocalDocumentation,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; charCount: number }[]>([]);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMsg(null);
    setStatusMsg(null);

    let totalChars = 0;
    const newAddedFiles: { name: string; size: number; charCount: number }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        setStatusMsg(`Leyendo y procesando "${file.name}"...`);

        // Directly parse local file using client-side JavaScript (supports Word, PDF, Excel, Text)
        const parsed = await parseLocalFileClient(file);
        const extractedText = parsed.text;
        const charCount = parsed.charCount;

        if (extractedText) {
          onAddLocalDocumentation(extractedText, file.name);
          totalChars += charCount;
          newAddedFiles.push({
            name: file.name,
            size: file.size,
            charCount,
          });
        }
      } catch (err: any) {
        console.error('Error procesando archivo:', err);
        setErrorMsg(err.message || `No se pudo leer el archivo ${file.name}`);
      }
    }

    setIsUploading(false);
    if (newAddedFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newAddedFiles]);
      setStatusMsg(`¡Exitoso! Se han procesado ${newAddedFiles.length} archivo(s) local(es) (${totalChars} caracteres extraídos).`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-5 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Cargar Archivos Locales (PDF, Word, Excel, TXT)</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Sube tus documentos locales sin necesidad de vincular Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Instructions Banner */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start space-x-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Base de Conocimiento Local:</strong> Puedes subir guías didácticas en PDF, programaciones en Word (.docx/.doc), tablas en Excel (.xlsx) o archivos de texto (.txt). El contenido se analizará y la IA lo utilizará para enriquecer tus juegos y actividades con los 4 apartados metodológicos completos.
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
                : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            <div className="p-4 bg-indigo-100/70 text-indigo-700 rounded-2xl shadow-inner">
              <FileType className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Arrastra tus archivos aquí o <span className="text-indigo-600 underline">haz clic para examinar</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Soporta PDF, Word (.docx / .doc), Excel (.xlsx / .csv) y Texto (.txt)
              </p>
            </div>
          </div>

          {/* Status and Errors */}
          {isUploading && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center space-x-2.5">
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
              <span className="font-medium">{statusMsg || 'Procesando archivo local...'}</span>
            </div>
          )}

          {!isUploading && statusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* List of uploaded local files in current session */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Archivos Locales Cargados ({uploadedFiles.length}):
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({Math.round(f.size / 1024)} KB - {f.charCount} caracteres)
                      </span>
                    </div>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Listo</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Los datos cargados se usarán directamente para tus sesiones.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
