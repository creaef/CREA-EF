import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Search,
  ArrowLeft,
  X,
  CheckCircle2,
  FolderOpen,
  Cloud,
  Loader2,
  AlertCircle,
  ChevronRight,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { loginWithGoogleDrive, logoutGoogle, auth } from '../lib/firebase';
import { fetchDriveItemsClient, readDriveFilesClient } from '../utils/driveClient';
import { User } from 'firebase/auth';

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  modifiedTime?: string;
  iconLink?: string;
  size?: string;
}

interface GoogleDriveSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolderAndContent: (data: {
    folderId: string;
    folderName: string;
    documentationText: string;
    fileCount: number;
    sourceFiles?: string[];
  }) => void;
}

export const GoogleDriveSelectorModal: React.FC<GoogleDriveSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectFolderAndContent,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string>(() => {
    try {
      return localStorage.getItem('sda_drive_access_token') || '';
    } catch (e) {
      return '';
    }
  });
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);

  // Folder Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Mi Unidad' },
  ]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Multi-Selection State for Folders and Files
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedFolderNames, setSelectedFolderNames] = useState<Record<string, string>>({});
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<Record<string, string>>({});
  const [loadingRead, setLoadingRead] = useState<boolean>(false);
  const [readProgressMsg, setReadProgressMsg] = useState<string>('Leyendo selección de Drive...');

  // Manual Token Fallback State
  const [showManualToken, setShowManualToken] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');

  const handleSaveManualToken = () => {
    const token = manualTokenInput.trim();
    if (!token) return;
    setAccessToken(token);
    try {
      localStorage.setItem('sda_drive_access_token', token);
    } catch (e) {}
    setErrorMsg(null);
    setCurrentFolderId('root');
    setFolderHistory([{ id: 'root', name: 'Mi Unidad' }]);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Items when accessToken or folderId/searchQuery changes
  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveItems(currentFolderId, searchQuery);
    }
  }, [isOpen, accessToken, currentFolderId]);

  const toggleFolderSelection = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedFolderIds.includes(id)) {
      setSelectedFolderIds((prev) => prev.filter((item) => item !== id));
      setSelectedFolderNames((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      setSelectedFolderIds((prev) => [...prev, id]);
      setSelectedFolderNames((prev) => ({ ...prev, [id]: name }));
    }
  };

  const toggleFileSelection = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedFileIds.includes(id)) {
      setSelectedFileIds((prev) => prev.filter((item) => item !== id));
      setSelectedFileNames((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      setSelectedFileIds((prev) => [...prev, id]);
      setSelectedFileNames((prev) => ({ ...prev, [id]: name }));
    }
  };

  const handleSignIn = async () => {
    setLoadingAuth(true);
    setErrorMsg(null);
    try {
      const { user, token } = await loginWithGoogleDrive();
      setCurrentUser(user);
      setAccessToken(token);
      try {
        localStorage.setItem('sda_drive_access_token', token);
      } catch (e) {
        console.warn('Could not save Drive token to localStorage', e);
      }
      setCurrentFolderId('root');
      setFolderHistory([{ id: 'root', name: 'Mi Unidad' }]);
    } catch (err: any) {
      console.warn('Drive auth notification:', err?.code || err?.message);
      const rawMsg = err?.message || '';
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Ventana de autenticación cerrada. Haz clic de nuevo en "Iniciar Sesión con Google Drive" cuando quieras conectar tu cuenta.');
      } else if (
        rawMsg.toLowerCase().includes('origin_mismatch') ||
        rawMsg.toLowerCase().includes('idpiframe_initialization_failed') ||
        err?.code === 'auth/unauthorized-domain'
      ) {
        setErrorMsg('⚠️ Error 400: origin_mismatch - El dominio de la app no está registrado en la Consola de Google Cloud / Firebase. Agrega la URL actual a los "Orígenes de JavaScript autorizados" de tu Client ID de OAuth 2.0 en Google Cloud Console, o utiliza la pestaña "Token manual" a continuación.');
        setShowManualToken(true);
      } else if (
        rawMsg.toLowerCase().includes('failed to open popup window') ||
        rawMsg.toLowerCase().includes('popup_failed_to_open') ||
        rawMsg.toLowerCase().includes('popup') ||
        err?.code === 'auth/popup-blocked'
      ) {
        setErrorMsg('⚠️ El visor o el navegador bloqueó la ventana emergente de inicio de sesión de Google. Para solucionarlo: 1) Haz clic abajo en "Abrir app en ventana nueva" para completar el login sin restricciones del visor, o 2) Usa la opción "Token manual".');
        setShowManualToken(true);
      } else {
        setErrorMsg(rawMsg || 'Error al iniciar sesión con Google Drive.');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle().catch(() => {});
    try {
      localStorage.removeItem('sda_drive_access_token');
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('sda_drive_folder_id');
      localStorage.removeItem('sda_drive_folder_name');
      localStorage.removeItem('sda_drive_doc_text');
      localStorage.removeItem('custom_excel_games_database');
      sessionStorage.clear();
    } catch (e) {}
    setCurrentUser(null);
    setAccessToken('');
    setItems([]);
    setSelectedFolderIds([]);
    setSelectedFileIds([]);
  };

  const loadDriveItems = async (folderId: string, search: string = '') => {
    if (!accessToken) return;
    setLoadingItems(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/drive/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, folderId, search }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setItems(data.items || []);
        return;
      }
    } catch (err) {
      // Direct client fallback
    }

    // Direct Google Drive REST API Client Fallback (Firebase Hosting static deployment)
    try {
      const data = await fetchDriveItemsClient(accessToken, folderId, search);
      setItems(data.items || []);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('expirado') || err.message?.includes('401')) {
        try {
          localStorage.removeItem('sda_drive_access_token');
        } catch (e) {}
        setAccessToken('');
        setErrorMsg('Tu sesión de Google Drive ha expirado. Por favor, haz clic en "Iniciar sesión con Google Drive" para reconectar tu cuenta.');
        return;
      }
      setErrorMsg(err.message || 'No se pudieron cargar los contenidos de tu Google Drive.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadDriveItems(currentFolderId, searchQuery);
    }
  };

  const handleOpenFolder = (folder: { id: string; name: string }) => {
    setCurrentFolderId(folder.id);
    setFolderHistory((prev) => [...prev, folder]);
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetFolder = folderHistory[index];
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolderId(targetFolder.id);
    setSearchQuery('');
  };

  const handleImportSelection = async () => {
    if (!accessToken) return;

    // Determine target folders and files
    let targetFolderIds = [...selectedFolderIds];
    let targetFileIds = [...selectedFileIds];

    // Fallback: if no specific items checked, use current folder
    if (targetFolderIds.length === 0 && targetFileIds.length === 0) {
      const activeFolder = folderHistory[folderHistory.length - 1];
      if (activeFolder && activeFolder.id !== 'root') {
        targetFolderIds = [activeFolder.id];
      }
    }

    if (targetFolderIds.length === 0 && targetFileIds.length === 0) {
      setErrorMsg('Por favor selecciona al menos una carpeta o documento para importar.');
      return;
    }

    setLoadingRead(true);
    setReadProgressMsg('Iniciando lectura de recursos en Google Drive...');
    setErrorMsg(null);

    // Direct Google Drive REST API Client Fallback
    try {
      const data = await readDriveFilesClient(
        accessToken,
        targetFolderIds,
        targetFileIds,
        (msg) => setReadProgressMsg(msg)
      );
      const primaryName =
        targetFolderIds.length > 0
          ? `${targetFolderIds.length} Carpeta(s) de Drive`
          : `${targetFileIds.length} Documento(s) de Drive`;

      onSelectFolderAndContent({
        folderId: targetFolderIds[0] || 'multi-selection',
        folderName: primaryName,
        documentationText: data.text || '',
        fileCount: data.filesCount || 1,
        sourceFiles: [],
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No se pudieron leer los elementos seleccionados de Google Drive.');
    } finally {
      setLoadingRead(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-900/80 rounded-xl border border-indigo-700/50">
              <Cloud className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Explorador de Google Drive</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Selecciona una carpeta o busca tus juegos y actividades de EF para enriquecer las sesiones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Auth Banner */}
          {!accessToken ? (
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-2xl border border-indigo-100 text-center space-y-4">
              <div className="inline-flex p-3 bg-white rounded-full text-indigo-700 shadow-sm border border-indigo-100">
                <Cloud className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-bold text-slate-900 text-base">Conecta tu cuenta de Google Drive</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cualquier usuario o docente puede vincular su propia cuenta de Google para compartir carpetas y materiales de Educación Física. Solamente debes aceptar los permisos de lectura sobre los archivos o carpetas que selecciones.
                </p>
                <div className="p-2.5 bg-indigo-100/60 border border-indigo-200/80 rounded-xl text-[11px] text-indigo-950 font-medium text-left space-y-1">
                  <p className="font-bold text-indigo-900">🌐 Acceso universal y compartición de datos:</p>
                  <p>Al hacer clic en el botón inferior, autorizas a Crea-EF a leer únicamente las carpetas y archivos que elijas para integrarlos con las herramientas de IA.</p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs space-y-2.5 max-w-md mx-auto text-left shadow-xs">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{errorMsg}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200/60">
                    <button
                      type="button"
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-2.5 py-1.5 bg-white border border-red-300 hover:bg-red-100 text-red-900 rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-red-700" />
                      <span>Abrir app en ventana nueva</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualToken(!showManualToken)}
                      className="px-2.5 py-1.5 bg-red-100/80 hover:bg-red-200 border border-red-300 text-red-900 rounded-lg text-[11px] font-bold"
                    >
                      {showManualToken ? 'Ocultar manual' : 'Token manual'}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col items-center space-y-3">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loadingAuth}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-sm transition shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {loadingAuth ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Conectando con Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>Iniciar Sesión con Google Drive</span>
                    </>
                  )}
                </button>

                {showManualToken && (
                  <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl max-w-md w-full space-y-2 text-left shadow-xs">
                    <label className="text-[11px] font-bold text-slate-800 block">
                      Token de acceso de Google Drive (Access Token):
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={manualTokenInput}
                        onChange={(e) => setManualTokenInput(e.target.value)}
                        placeholder="Pega tu token de acceso (ya29...)"
                        className="text-xs p-2 border border-slate-300 rounded-lg flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleSaveManualToken}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                      >
                        Conectar
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 font-medium">
                  ¿Quieres acceder con otra cuenta de Gmail o corporativa? Al hacer clic podrás elegir o añadir cualquier cuenta de Google.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected User Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl gap-2">
                <div className="flex items-center space-x-3">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-900 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser?.email?.[0]?.toUpperCase() || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900">{currentUser?.displayName || currentUser?.email}</p>
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Conectado a Google Drive</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSignOut();
                      setTimeout(() => handleSignIn(), 200);
                    }}
                    className="inline-flex items-center space-x-1 text-xs text-indigo-700 font-bold hover:text-indigo-900 transition px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
                    title="Usar una cuenta de Gmail diferente"
                  >
                    <span>Usar otra cuenta Gmail</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-red-600 transition px-2.5 py-1 rounded-lg hover:bg-slate-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-700" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar archivos o carpetas en Drive (ej: baloncesto, juegos)..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-slate-900 font-bold placeholder:text-slate-500 placeholder:font-normal shadow-2xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl transition shrink-0"
                >
                  Buscar
                </button>
              </form>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-slate-100 p-2.5 rounded-xl overflow-x-auto">
                {folderHistory.map((f, idx) => (
                  <React.Fragment key={f.id + idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <button
                      type="button"
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={`hover:text-indigo-900 whitespace-nowrap px-1.5 py-0.5 rounded ${
                        idx === folderHistory.length - 1 ? 'font-bold text-indigo-950 bg-white shadow-2xs' : ''
                      }`}
                    >
                      {f.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Selection summary badge */}
              {(selectedFolderIds.length > 0 || selectedFileIds.length > 0) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-bold text-amber-950">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>
                      Selección activa: {selectedFolderIds.length} subcarpeta(s) y {selectedFileIds.length} documento(s)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFolderIds([]);
                      setSelectedFolderNames({});
                      setSelectedFileIds([]);
                      setSelectedFileNames({});
                    }}
                    className="text-[11px] text-amber-800 hover:underline font-extrabold"
                  >
                    Limpiar selección
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[220px] max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                {loadingItems ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs font-medium">Cargando elementos de Google Drive...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-1">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No se encontraron archivos o carpetas.</p>
                    <p className="text-[11px]">Prueba a buscar otro término o navega entre tus carpetas.</p>
                  </div>
                ) : (
                  items.map((item) => {
                    const isFolderSelected = selectedFolderIds.includes(item.id);
                    const isFileSelected = selectedFileIds.includes(item.id);
                    const isChecked = item.isFolder ? isFolderSelected : isFileSelected;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 text-xs flex items-center justify-between hover:bg-indigo-50/60 transition ${
                          isChecked ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (item.isFolder) {
                                toggleFolderSelection(item.id, item.name);
                              } else {
                                toggleFileSelection(item.id, item.name);
                              }
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />
                          {item.isFolder ? (
                            <Folder className="w-5 h-5 text-amber-500 shrink-0 fill-amber-100" />
                          ) : (
                            <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                          )}
                          <span
                            onClick={() => {
                              if (item.isFolder) {
                                handleOpenFolder({ id: item.id, name: item.name });
                              } else {
                                toggleFileSelection(item.id, item.name);
                              }
                            }}
                            className="font-semibold text-slate-800 truncate cursor-pointer hover:text-indigo-900"
                          >
                            {item.name}
                          </span>
                        </div>

                        {item.isFolder ? (
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleFolderSelection(item.id, item.name)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition border ${
                                isFolderSelected
                                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                                  : 'bg-indigo-900 text-white border-indigo-900 hover:bg-indigo-800'
                              }`}
                            >
                              {isFolderSelected ? '✓ Seleccionada' : 'Marcar Carpeta'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenFolder({ id: item.id, name: item.name })}
                              className="text-[11px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                              Abrir 📁
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleFileSelection(item.id, item.name)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition border ${
                              isFileSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isFileSelected ? '✓ Documento Elegido' : 'Seleccionar Documento'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancelar
          </button>

          {accessToken && (
            <button
              type="button"
              onClick={handleImportSelection}
              disabled={loadingRead}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition shadow-sm disabled:opacity-60"
            >
              {loadingRead ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950 shrink-0" />
                  <span className="animate-pulse">{readProgressMsg || 'Leyendo Selección de Drive...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    Importar Recursos ({selectedFolderIds.length + selectedFileIds.length > 0 ? selectedFolderIds.length + selectedFileIds.length : 'Actual'})
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
