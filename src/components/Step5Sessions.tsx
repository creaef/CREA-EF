import React, { useState } from 'react';
import { generateSessionsApi, enrichFullSessionApi } from '../utils/aiClient';
import {
  Calendar,
  Clock,
  RefreshCw,
  Folder,
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Database,
  CheckCircle2,
  FolderOpen,
  Cloud,
  FileSearch,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Ciclo,
  Curso,
  ModeloEstructuraSesion,
  SesionTrabajo,
  ActividadEnSesion,
  formatGameDescription,
} from '../types';
import { GoogleDriveSelectorModal } from './GoogleDriveSelectorModal';
import { ExcelGameDatabaseModal } from './ExcelGameDatabaseModal';
import { LocalFilesModal } from './LocalFilesModal';
import { FileSpreadsheet, Upload } from 'lucide-react';

interface Step5Props {
  numSesiones: number;
  curso: Curso;
  ciclo: Ciclo;
  tematica: string;
  modeloEstructura: ModeloEstructuraSesion;
  criteriosSeleccionados: string[];
  sesiones: SesionTrabajo[];
  setSesiones: (v: SesionTrabajo[]) => void;
  driveFolderId?: string;
  setDriveFolderId?: (v: string) => void;
  driveDocumentationText?: string;
  setDriveDocumentationText?: (v: string) => void;
  porcentajeDrive?: number;
  setPorcentajeDrive?: (v: number) => void;
  porcentajeBancoJuegos?: number;
  setPorcentajeBancoJuegos?: (v: number) => void;
  porcentajeIA?: number;
  setPorcentajeIA?: (v: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step5Sessions: React.FC<Step5Props> = ({
  numSesiones,
  curso,
  ciclo,
  tematica,
  modeloEstructura,
  criteriosSeleccionados,
  sesiones,
  setSesiones,
  driveFolderId = '',
  setDriveFolderId,
  driveDocumentationText = '',
  setDriveDocumentationText,
  porcentajeDrive: initialPDrive = 0,
  setPorcentajeDrive: setParentPDrive,
  porcentajeBancoJuegos: initialPBanco = 0,
  setPorcentajeBancoJuegos: setParentPBanco,
  porcentajeIA: initialPIA = 100,
  setPorcentajeIA: setParentPIA,
  onPrev,
  onNext,
}) => {
  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(0);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [isLocalFilesModalOpen, setIsLocalFilesModalOpen] = useState<boolean>(false);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [docText, setDocText] = useState<string>(driveDocumentationText);
  const [sourceFiles, setSourceFiles] = useState<string[]>([]);
  const [fuentesUtilizadas, setFuentesUtilizadas] = useState<string[]>([]);
  const [porcentajeDrive, setPorcentajeDriveState] = useState<number>(initialPDrive);
  const [porcentajeBancoJuegos, setPorcentajeBancoJuegosState] = useState<number>(initialPBanco);
  const [porcentajeIA, setPorcentajeIAState] = useState<number>(initialPIA);
  const [errorDrive, setErrorDrive] = useState<string | null>(null);
  const [successDrive, setSuccessDrive] = useState<string | null>(null);

  const handleAddLocalDocumentation = (extractedText: string, fileName: string) => {
    const formattedEntry = `\n\n--- ARCHIVO LOCAL: ${fileName} ---\n${extractedText}`;
    const newDocText = docText ? `${docText}${formattedEntry}` : `--- ARCHIVO LOCAL: ${fileName} ---\n${extractedText}`;
    setDocText(newDocText);
    if (setDriveDocumentationText) setDriveDocumentationText(newDocText);

    if (!sourceFiles.includes(fileName)) {
      setSourceFiles((prev) => [...prev, fileName]);
    }

    setSuccessDrive(`Archivo local "${fileName}" procesado e incorporado correctamente a la base de conocimiento.`);
    updatePDrive(Math.min(100, (porcentajeDrive || 0) + 25));
    updatePIA(Math.max(0, (porcentajeIA || 100) - 25));
  };

  const [enrichingSession, setEnrichingSession] = useState<boolean>(false);

  const handleEnrichFullSession = async () => {
    const copy = [...sesiones];
    const targetSession = copy[activeSessionIndex];
    if (!targetSession) return;

    setEnrichingSession(true);
    setErrorDrive(null);
    try {
      const sesionActualizada = await enrichFullSessionApi({
        sesion: targetSession,
        ciclo,
        tematica,
      });

      if (sesionActualizada && Array.isArray(sesionActualizada.fases)) {
        copy[activeSessionIndex].fases = sesionActualizada.fases;
        if (sesionActualizada.titulo) {
          copy[activeSessionIndex].titulo = sesionActualizada.titulo;
        }
        setSesiones(copy);
        setSuccessDrive(`✓ Sesión ${activeSessionIndex + 1} completada y enriquecida con éxito por la IA.`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorDrive(err.message || 'No se pudo enriquecer la sesión completa.');
    } finally {
      setEnrichingSession(false);
    }
  };

  const updatePDrive = (val: number) => {
    setPorcentajeDriveState(val);
    if (setParentPDrive) setParentPDrive(val);
  };
  const updatePBanco = (val: number) => {
    setPorcentajeBancoJuegosState(val);
    if (setParentPBanco) setParentPBanco(val);
  };
  const updatePIA = (val: number) => {
    setPorcentajeIAState(val);
    if (setParentPIA) setParentPIA(val);
  };

  const handleClearAllSourcesAndBank = () => {
    setDocText('');
    if (setDriveDocumentationText) setDriveDocumentationText('');
    setSelectedFolderName('');
    if (setDriveFolderId) setDriveFolderId('');
    setSourceFiles([]);
    setFuentesUtilizadas([]);
    updatePDrive(0);
    updatePBanco(0);
    updatePIA(100);
    try {
      localStorage.removeItem('custom_excel_games_database');
      localStorage.removeItem('sda_drive_access_token');
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('sda_drive_folder_id');
      localStorage.removeItem('sda_drive_folder_name');
      localStorage.removeItem('sda_drive_doc_text');
      sessionStorage.removeItem('google_access_token');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing tokens from storage', e);
    }
    setSuccessDrive('✓ Se han vaciado todas las fuentes importadas (Excel, Drive y archivos) y desconectado las cuentas de Google. Las sesiones se generarán 100% con IA Gemini.');
    setErrorDrive(null);
  };

  // Manual Activity Modal / Box State
  const [showManualActivityModal, setShowManualActivityModal] = useState<boolean>(false);
  const [manualPart, setManualPart] = useState<string>('Parte Principal / Práctica');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualDev, setManualDev] = useState<string>('');
  const [manualMaterials, setManualMaterials] = useState<string>('');
  const [manualDuration, setManualDuration] = useState<number>(15);

  const handleDriveImport = (data: {
    folderId: string;
    folderName: string;
    documentationText: string;
    fileCount: number;
    sourceFiles?: string[];
  }) => {
    if (setDriveFolderId) setDriveFolderId(data.folderId);
    setSelectedFolderName(data.folderName);
    setDocText(data.documentationText);
    if (setDriveDocumentationText) setDriveDocumentationText(data.documentationText);

    if (data.sourceFiles && data.sourceFiles.length > 0) {
      setSourceFiles(data.sourceFiles);
    } else if (data.folderName) {
      setSourceFiles([data.folderName]);
    }

    setSuccessDrive(
      `✓ Recursos de Drive importados con éxito (${data.fileCount} archivos leídos). La IA buscará en tus carpetas juegos acordes a la temática y ciclo.`
    );
    setErrorDrive(null);
  };

  const handleSaveManualActivity = () => {
    if (!manualTitle.trim()) return;

    const copy = [...sesiones];
    if (!copy[activeSessionIndex]) return;

    copy[activeSessionIndex].fases.push({
      fase: manualPart,
      duracionMin: manualDuration || 15,
      nombreJuego: manualTitle,
      descripcion: manualDev,
      materiales: manualMaterials
        ? manualMaterials.split(',').map((s) => s.trim())
        : [],
    });

    setSesiones(copy);
    setShowManualActivityModal(false);
    setManualTitle('');
    setManualDev('');
    setManualMaterials('');
  };

  // Generate sessions with AI (reading Drive documentation if available)
  const handleGenerateSessionsAI = async () => {
    setLoadingAi(true);
    setErrorDrive(null);
    try {
      const sesionesGeneradas = await generateSessionsApi({
        numSesiones,
        ciclo,
        tematica,
        modeloEstructura,
        criteriosCodigos: criteriosSeleccionados,
      });

      if (sesionesGeneradas && Array.isArray(sesionesGeneradas)) {
        const formattedSesiones = sesionesGeneradas.map((ses: SesionTrabajo) => ({
          ...ses,
          fases: ses.fases
            ? ses.fases.map((f: ActividadEnSesion) => ({
                ...f,
                descripcion: formatGameDescription(f.descripcion),
              }))
            : [],
        }));
        setSesiones(formattedSesiones);
        setActiveSessionIndex(0);
      }
    } catch (e: any) {
      console.error(e);
      setErrorDrive(e.message || 'Error al generar las sesiones.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUpdateFase = (
    sesIndex: number,
    faseIndex: number,
    field: 'nombreJuego' | 'descripcion' | 'duracionMin' | 'esquemaGrafico',
    val: any
  ) => {
    const copy = [...sesiones];
    const target = copy[sesIndex].fases[faseIndex];
    if (field === 'duracionMin') {
      target.duracionMin = parseInt(val) || 10;
    } else {
      target[field] = val;
    }
    setSesiones(copy);
  };

  const handleAddFase = (sesIndex: number) => {
    const copy = [...sesiones];
    copy[sesIndex].fases.push({
      fase: 'Nueva Fase',
      duracionMin: 10,
      nombreJuego: 'Nueva Actividad',
      descripcion: 'Escribe aquí la descripción de la actividad...',
      materiales: [],
    });
    setSesiones(copy);
  };

  const handleDeleteFase = (sesIndex: number, faseIndex: number) => {
    const copy = [...sesiones];
    copy[sesIndex].fases.splice(faseIndex, 1);
    setSesiones(copy);
  };

  return (
    <div id="step5-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-7 h-7 text-amber-400" />
            <h2 className="text-xl font-bold">Paso 5: Diseño de Sesiones de Trabajo (60 min)</h2>
          </div>
          <p className="text-indigo-100 text-sm max-w-2xl">
            Desarrollo de las <strong>{numSesiones} sesiones</strong> de Educación Física para {curso} ({ciclo}) basadas en la temática <strong>{tematica || 'General'}</strong>.
          </p>
        </div>

        {/* Prominent Regenerate AI Sessions Button */}
        <button
          id="btn-generate-ai-sessions"
          onClick={handleGenerateSessionsAI}
          disabled={loadingAi}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg border border-amber-300 animate-pulse-subtle disabled:opacity-50"
        >
          {loadingAi ? (
            <RefreshCw className="w-5 h-5 text-slate-950 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-slate-950" />
          )}
          <span>
            {sesiones.length > 0 ? 'Volver a generar de nuevo (IA)' : 'Generar Sesiones con IA'}
          </span>
        </button>
      </div>

      {/* ACCESO A GOOGLE DRIVE Y BASE DE DATOS DOCUMENTAL */}
      <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Integración con Google Drive: Juegos y Unidades de EF
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Abre tu Google Drive, navega o busca entre tus carpetas y selecciona de dónde extraer información y juegos para tus sesiones.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-open-google-drive-modal"
              onClick={() => setIsDriveModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition shadow-sm hover:shadow-md"
            >
              <FolderOpen className="w-4 h-4 text-amber-300" />
              <span>Abrir Mi Google Drive</span>
            </button>

            <button
              type="button"
              id="btn-open-excel-modal"
              onClick={() => setIsExcelModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm hover:shadow-md border border-emerald-600"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Banco de Juegos (Excel)</span>
            </button>

            <button
              type="button"
              id="btn-open-local-files-modal"
              onClick={() => setIsLocalFilesModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm hover:shadow-md border border-amber-400"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>Cargar PDF / Word Local</span>
            </button>

            <button
              type="button"
              id="btn-clear-all-sources-bank"
              onClick={handleClearAllSourcesAndBank}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm hover:shadow-md border border-red-500"
              title="Vaciar por completo el banco de juegos Excel, archivos Drive, tokens y fuentes"
            >
              <Trash2 className="w-4 h-4 text-red-200" />
              <span>Vaciar Banco y Fuentes</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-950 text-xs flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Cumplimentación Automática por IA:</strong> Si la información extraída de tus archivos de Google Drive o Excel está sintetizada, parcial o le falta algún detalle, la IA Gemini la cumplimentará y desarrollará automáticamente al 100% estructurando los 4 apartados requeridos (1. Organización Espacial, 2. Roles de Alumnado, 3. Desarrollo y Reglas, 4. Variaciones DUA/Seguridad).
          </p>
        </div>

        {errorDrive && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorDrive}</span>
          </div>
        )}

        {successDrive && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successDrive}</span>
          </div>
        )}

        {/* Selected Folder Banner and Documentation Text Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Carpeta / Fuente de Google Drive Activa:
            </label>
            {selectedFolderName || driveFolderId ? (
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950 flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <Folder className="w-4 h-4 text-indigo-600 shrink-0 fill-indigo-200" />
                  <span className="truncate">{selectedFolderName || 'Carpeta Seleccionada'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(true)}
                  className="text-[11px] text-indigo-700 hover:underline font-extrabold shrink-0"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsDriveModalOpen(true)}
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 cursor-pointer transition flex items-center space-x-2"
              >
                <FolderOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Haz clic para conectar tu Google Drive y elegir la carpeta con tus materiales de EF.</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Contenido y Fichas de Juegos Extraídos (utilizados por la IA):
            </label>
            <textarea
              rows={3}
              value={docText}
              onChange={(e) => {
                setDocText(e.target.value);
                if (setDriveDocumentationText) setDriveDocumentationText(e.target.value);
              }}
              placeholder="Los textos y fichas de juegos extraídos de tu Google Drive aparecerán aquí para alimentar el generador de sesiones..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:border-indigo-600"
            />
          </div>
        </div>

        {/* ACLARACIÓN DE ORIGEN Y PORCENTAJE (BASE DE DATOS VS IA GEMINI) */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 text-xs border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Aclaración Pedagógica del Origen del Contenido y Fuentes de las Sesiones</span>
            </div>
            {sesiones.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                Resultado Real Calculado
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5 bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col justify-between">
              <span className="font-bold text-slate-200 block">📁 Fuentes Específicas Utilizadas en las Sesiones:</span>
              {(fuentesUtilizadas.length > 0 ? fuentesUtilizadas : sourceFiles).length > 0 ? (
                <div className="max-h-[72px] overflow-y-auto pr-1 flex flex-wrap gap-1.5 pt-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {(fuentesUtilizadas.length > 0 ? fuentesUtilizadas : sourceFiles).map((file, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-950 text-indigo-200 rounded-md text-[11px] font-semibold border border-indigo-700/50"
                    >
                      <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[220px]">{file}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic">
                  No se han seleccionado archivos específicos o no hay coincidencias de temática. Generado con IA Gemini.
                </p>
              )}
            </div>

            <div className="space-y-1.5 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="font-bold text-slate-200 block">📊 Distribución Proporcional de Actividades (Resultado Real):</span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>• Extraído de tu Base de Datos en Drive:</span>
                  <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {porcentajeDrive}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-indigo-300 font-bold">
                  <span>• Seleccionado de tu Banco de Juegos (Excel EF):</span>
                  <span className="bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    {porcentajeBancoJuegos}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-amber-300 font-bold">
                  <span>• Creado o Adaptado por IA Gemini LOMLOE:</span>
                  <span className="bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {porcentajeIA}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SESSIONS CONTENT AREA */}
      {sesiones.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
          <FileSearch className="w-12 h-12 text-indigo-400 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800 text-base">Aún no se han generado las sesiones</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Haz clic en el botón superior <strong>"Generar Sesiones con IA"</strong>. La IA leerá la temática seleccionada y la carpeta de Google Drive si está cargada.
            </p>
          </div>
          <button
            onClick={handleGenerateSessionsAI}
            disabled={loadingAi}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loadingAi ? (
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{loadingAi ? 'Generando Sesiones con IA...' : `Generar ${numSesiones} Sesiones con IA`}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sessions Tabs Bar */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {sesiones.map((ses, idx) => (
              <button
                key={idx}
                id={`tab-sesion-${idx + 1}`}
                onClick={() => setActiveSessionIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-2 border ${
                  activeSessionIndex === idx
                    ? 'bg-indigo-900 text-white border-indigo-950 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Sesión {idx + 1}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    activeSessionIndex === idx ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  60 min
                </span>
              </button>
            ))}
          </div>

          {/* Active Session Details */}
          {sesiones[activeSessionIndex] && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Session Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      Sesión {activeSessionIndex + 1} de {numSesiones}
                    </span>
                    <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      {modeloEstructura}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={sesiones[activeSessionIndex].titulo}
                      onChange={(e) => {
                        const copy = [...sesiones];
                        copy[activeSessionIndex].titulo = e.target.value;
                        setSesiones(copy);
                      }}
                      placeholder="Título de la sesión..."
                      className="text-lg font-bold text-slate-900 w-full sm:w-auto min-w-[280px] max-w-xl px-3 py-1 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 rounded-lg transition"
                    />
                    <button
                      type="button"
                      disabled={enrichingSession}
                      onClick={handleEnrichFullSession}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-xs font-black transition shadow-xs border border-amber-300 disabled:opacity-50 shrink-0"
                      title="Botón de emergencia: Si la sesión requiere reparación o mejora de algún juego, la IA la autocompletará y elaborará con los 4 apartados regulamentarios"
                    >
                      {enrichingSession ? (
                        <RefreshCw className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      )}
                      <span>{enrichingSession ? 'Completando...' : '⚡ Completar / Enriquecer Sesión con IA (Emergencia)'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block">Materiales necesarios:</span>
                  <p className="text-slate-600 font-medium mt-0.5">
                    {sesiones[activeSessionIndex].materialesTotales?.join(', ') || 'Material habitual de EF'}
                  </p>
                </div>
              </div>

              {/* Fases / Actividades (Chronogram) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-indigo-700" />
                      <span>Desarrollo y Secuencia de Fases de la Sesión (60 Minutos)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      En la parte principal de 40 min se recomiendan al menos 2 juegos o actividades para dinamizar la sesión.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManualActivityModal(true)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition shadow-xs border border-slate-300"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      <span>➕ Añadir Actividad Manual</span>
                    </button>
                  </div>
                </div>

                {/* MANUAL ACTIVITY FORM BOX */}
                {showManualActivityModal && (
                  <div className="p-5 bg-indigo-50/90 border-2 border-indigo-300 rounded-2xl shadow-md space-y-4 transition animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                      <h5 className="font-extrabold text-indigo-950 text-xs flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-indigo-700" />
                        <span>Añadir Nueva Actividad o Juego Manual a la Sesión {activeSessionIndex + 1}</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowManualActivityModal(false)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        ✕ Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-800 block">Parte / Fase de la Sesión:</label>
                        <select
                          value={manualPart}
                          onChange={(e) => setManualPart(e.target.value)}
                          className="w-full p-2 rounded-xl border border-indigo-200 bg-white font-bold text-slate-800"
                        >
                          <option value="Calentamiento / Inicio">Calentamiento / Inicio (10 min)</option>
                          <option value="Parte Principal / Práctica">Parte Principal / Práctica (40 min)</option>
                          <option value="Vuelta a la Calma / Reflexión">Vuelta a la Calma / Reflexión (10 min)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-800 block">Título de la Actividad / Juego:</label>
                        <input
                          type="text"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          placeholder="Ej: Juego de los Pañuelitos Colectivo..."
                          className="w-full p-2 rounded-xl border border-indigo-200 bg-white font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-800 block">Duración Estimada (min):</label>
                        <input
                          type="number"
                          min={5}
                          max={40}
                          value={manualDuration}
                          onChange={(e) => setManualDuration(parseInt(e.target.value) || 15)}
                          className="w-full p-2 rounded-xl border border-indigo-200 bg-white font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-800 block">
                        Explicación (1º Org. Espacial y Terreno ➔ 2º Roles Alumnado ➔ 3º Desarrollo y Reglas ➔ 4º Variaciones/DUA/Seguridad):
                      </label>
                      <textarea
                        rows={4}
                        value={manualDev}
                        onChange={(e) => setManualDev(e.target.value)}
                        placeholder="1. ORGANIZACIÓN ESPACIAL Y TERRENO: Distribución de alumnos y conos...&#10;2. ROLES DE ALUMNADO: Atacantes, defensores...&#10;3. DESARROLLO PASO A PASO Y REGLAS: Normas del juego...&#10;4. VARIACIONES, DUA Y SEGURIDAD: Adaptaciones..."
                        className="w-full p-3 rounded-xl border border-indigo-200 bg-white text-slate-800 leading-relaxed font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-500 font-medium">
                        Se insertará automáticamente en la Sesión {activeSessionIndex + 1}.
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveManualActivity}
                        disabled={!manualTitle.trim()}
                        className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl text-xs font-extrabold transition shadow-sm disabled:opacity-50"
                      >
                        Guardar Actividad
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Render phases grouped logically */}
                  {(() => {
                    const currentFases = sesiones[activeSessionIndex].fases || [];
                    const warmupFases = currentFases.map((f, i) => ({ ...f, origIdx: i })).filter((f) => f.fase.includes('Inicio') || f.fase.includes('Calentamiento'));
                    const mainFases = currentFases.map((f, i) => ({ ...f, origIdx: i })).filter((f) => f.fase.includes('Principal') || f.fase.includes('Práctica'));
                    const coolFases = currentFases.map((f, i) => ({ ...f, origIdx: i })).filter((f) => f.fase.includes('Calma') || f.fase.includes('Reflexión') || f.fase.includes('Cierre'));
                    const otherFases = currentFases.map((f, i) => ({ ...f, origIdx: i })).filter((f) => 
                      !f.fase.includes('Inicio') && !f.fase.includes('Calentamiento') &&
                      !f.fase.includes('Principal') && !f.fase.includes('Práctica') &&
                      !f.fase.includes('Calma') && !f.fase.includes('Reflexión') && !f.fase.includes('Cierre')
                    );

                    const renderActivityCard = (fase: ActividadEnSesion & { origIdx: number }, showFaseHeader = true, gameLabel?: string) => {
                      const fIdx = fase.origIdx;
                      return (
                        <div
                          key={fIdx}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-2xs space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                              {showFaseHeader ? (
                                <input
                                  type="text"
                                  value={fase.fase}
                                  onChange={(e) => {
                                    const copy = [...sesiones];
                                    copy[activeSessionIndex].fases[fIdx].fase = e.target.value;
                                    setSesiones(copy);
                                  }}
                                  className="text-xs font-bold bg-indigo-900 text-white px-3 py-1.5 rounded-lg w-full sm:w-auto focus:ring-1 focus:ring-amber-400 outline-none"
                                  placeholder="Nombre de la fase"
                                />
                              ) : (
                                <span className="text-xs font-black bg-indigo-100 text-indigo-950 px-3 py-1 rounded-lg border border-indigo-200">
                                  {gameLabel || `Actividad ${fIdx + 1}`}
                                </span>
                              )}

                              <div className="flex items-center space-x-1 bg-amber-50 text-amber-950 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <input
                                  type="number"
                                  min={5}
                                  max={45}
                                  value={fase.duracionMin}
                                  onChange={(e) =>
                                    handleUpdateFase(activeSessionIndex, fIdx, 'duracionMin', e.target.value)
                                  }
                                  className="w-10 bg-transparent text-center font-black text-amber-950 focus:outline-none"
                                />
                                <span>min</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteFase(activeSessionIndex, fIdx)}
                              className="text-slate-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50"
                              title="Eliminar actividad"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700">
                              Título de la Actividad / Juego:
                            </label>
                            <input
                              type="text"
                              value={fase.nombreJuego}
                              onChange={(e) =>
                                handleUpdateFase(activeSessionIndex, fIdx, 'nombreJuego', e.target.value)
                              }
                              className="w-full font-bold text-slate-900 text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 bg-slate-50/50 shadow-2xs"
                              placeholder="Nombre del Juego o Actividad..."
                            />

                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                              <label className="block text-xs font-bold text-slate-700">
                                Explicación (1º Org. Espacial ➔ 2º Roles ➔ 3º Desarrollo/Reglas ➔ 4º Variaciones/DUA/Seguridad):
                              </label>
                            </div>
                            <textarea
                              rows={5}
                              value={fase.descripcion}
                              onChange={(e) =>
                                handleUpdateFase(activeSessionIndex, fIdx, 'descripcion', e.target.value)
                              }
                              onBlur={(e) => {
                                const formatted = formatGameDescription(e.target.value);
                                if (formatted !== e.target.value) {
                                  handleUpdateFase(activeSessionIndex, fIdx, 'descripcion', formatted);
                                }
                              }}
                              className="w-full text-xs leading-relaxed font-medium text-slate-800 p-3.5 border border-slate-300 rounded-xl focus:border-indigo-600 bg-slate-50/50 shadow-2xs resize-y"
                              placeholder="1. ORGANIZACIÓN ESPACIAL Y TERRENO: Distribución de alumnos y conos...&#10;2. ROLES DE ALUMNADO: Atacantes, defensores...&#10;3. DESARROLLO PASO A PASO Y REGLAS: Normas del juego...&#10;4. VARIACIONES, DUA Y SEGURIDAD: Adaptaciones DUA..."
                            />
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-5">
                        {/* 1. CALENTAMIENTO / INICIO */}
                        {warmupFases.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200/80">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                              <span>Fase 1: Calentamiento / Activación Inicial (10 min)</span>
                            </div>
                            {warmupFases.map((f) => renderActivityCard(f, true))}
                          </div>
                        )}

                        {/* 2. PARTE PRINCIPAL / PRÁCTICA (40 MIN TOTAL - AGRUPADO SIN REPETIR NOMENCLATURA) */}
                        {mainFases.length > 0 && (
                          <div className="p-5 rounded-2xl border-2 border-indigo-300 bg-gradient-to-b from-indigo-50/70 to-slate-50/50 shadow-xs space-y-4">
                            <div className="flex flex-wrap items-center justify-between border-b border-indigo-200 pb-2.5 gap-2">
                              <div>
                                <h5 className="font-extrabold text-indigo-950 text-sm flex items-center space-x-2">
                                  <span className="px-3 py-1 bg-indigo-900 text-white rounded-lg text-xs font-black">
                                    PARTE PRINCIPAL / PRÁCTICA
                                  </span>
                                  <span>40 Minutos Totales</span>
                                </h5>
                                <p className="text-[11px] text-indigo-900 font-medium mt-1">
                                  Consta de {mainFases.length} juegos/actividades principales secuenciados ({mainFases.reduce((acc, curr) => acc + (curr.duracionMin || 0), 0)} min asignados).
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setManualPart('Parte Principal / Práctica');
                                  setShowManualActivityModal(true);
                                }}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold transition shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-400" />
                                <span>+ Añadir Juego a la Parte Principal</span>
                              </button>
                            </div>

                            <div className="space-y-4">
                              {mainFases.map((f, mIdx) => renderActivityCard(f, false, `Juego ${mIdx + 1} (${f.duracionMin} min)`))}
                            </div>
                          </div>
                        )}

                        {/* 3. VUELTA A LA CALMA / REFLEXIÓN */}
                        {coolFases.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                              <span>Fase Final: Vuelta a la Calma y Reflexión (10 min)</span>
                            </div>
                            {coolFases.map((f) => renderActivityCard(f, true))}
                          </div>
                        )}

                        {/* OTRAS FASES */}
                        {otherFases.length > 0 && (
                          <div className="space-y-2">
                            {otherFases.map((f) => renderActivityCard(f, true))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step5-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Metodología</span>
        </button>

        <button
          id="btn-step5-next"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition"
        >
          <span>Siguiente: Producto Final / Reto</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {/* Google Drive Selector Modal */}
      <GoogleDriveSelectorModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSelectFolderAndContent={handleDriveImport}
      />

      {/* Excel Game Database Modal */}
      <ExcelGameDatabaseModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        sesiones={sesiones}
        setSesiones={setSesiones}
        activeSessionIndex={activeSessionIndex}
        onGamesCleared={handleClearAllSourcesAndBank}
        onGamesImportedForAI={(importedText) => {
          const newDocText = docText ? `${docText}\n\n--- BANCO DE JUEGOS DESDE EXCEL ---\n${importedText}` : `--- BANCO DE JUEGOS DESDE EXCEL ---\n${importedText}`;
          setDocText(newDocText);
          if (setDriveDocumentationText) setDriveDocumentationText(newDocText);
          updatePBanco(35);
          const newDriveP = porcentajeDrive > 20 ? porcentajeDrive - 15 : porcentajeDrive;
          updatePDrive(newDriveP);
          updatePIA(Math.max(10, 100 - newDriveP - 35));
          if (!sourceFiles.includes('Banco de Juegos EF (Excel)')) {
            setSourceFiles((prev) => [...prev, 'Banco de Juegos EF (Excel)']);
          }
        }}
      />

      {/* Local Files Modal (PDF, Word, Excel, TXT) */}
      <LocalFilesModal
        isOpen={isLocalFilesModalOpen}
        onClose={() => setIsLocalFilesModalOpen(false)}
        onAddLocalDocumentation={handleAddLocalDocumentation}
      />
    </div>
  );
};
