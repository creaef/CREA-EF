import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Search,
  Plus,
  X,
  CheckCircle2,
  Cloud,
  Loader2,
  AlertCircle,
  Database,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SesionTrabajo, formatGameDescription } from '../types';

export interface ExcelGame {
  id: string;
  nombre: string;
  tematica: string;
  criterio: string;
  ciclo: string;
  descripcion: string;
  material: string;
  origen?: string;
}

interface ExcelGameDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesiones: SesionTrabajo[];
  setSesiones: (s: SesionTrabajo[]) => void;
  activeSessionIndex?: number;
  onGamesImportedForAI?: (gamesText: string) => void;
  onGamesCleared?: () => void;
}

export const ExcelGameDatabaseModal: React.FC<ExcelGameDatabaseModalProps> = ({
  isOpen,
  onClose,
  sesiones,
  setSesiones,
  activeSessionIndex = 0,
  onGamesImportedForAI,
  onGamesCleared,
}) => {
  const [games, setGames] = useState<ExcelGame[]>(() => {
    try {
      const stored = localStorage.getItem('custom_excel_games_database');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [selectedCiclo, setSelectedCiclo] = useState('Todos');
  const [targetSessionIdx, setTargetSessionIdx] = useState<number>(activeSessionIndex);
  const [targetFase, setTargetFase] = useState<string>('Parte Principal / Práctica');
  const [isParsing, setIsParsing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  // Persist games in localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('custom_excel_games_database', JSON.stringify(games));
    } catch (e) {
      console.error('Error saving excel games:', e);
    }
  }, [games]);

  if (!isOpen) return null;

  // Function to parse XLSX/CSV file buffer or array ultra-fast across all sheets
  const parseExcelBuffer = (arrayBuffer: ArrayBuffer, fileName: string) => {
    try {
      setIsParsing(true);
      setErrorMsg(null);

      // Fast XLSX read disabling unneeded styling/formula evaluation
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellFormula: false,
        cellHTML: false,
        cellStyles: false,
        sheetStubs: false,
      });

      const parsed: ExcelGame[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;

        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (!rawRows || rawRows.length === 0) return;

        rawRows.forEach((row, idx) => {
          let nombre = '';
          let tematica = '';
          let criterio = '';
          let ciclo = '';
          let descripcion = '';
          let material = '';

          Object.keys(row).forEach((k) => {
            const keyLower = k.toLowerCase().trim();
            const val = String(row[k]).trim();
            if (!val) return;

            if (keyLower.includes('nombre') || keyLower.includes('juego') || keyLower.includes('actividad') || keyLower.includes('titulo')) {
              if (!nombre) nombre = val;
            } else if (keyLower.includes('temat') || keyLower.includes('contenido') || keyLower.includes('categoria')) {
              if (!tematica) tematica = val;
            } else if (keyLower.includes('criterio') || keyLower.includes('evalua') || keyLower.includes('competenc')) {
              if (!criterio) criterio = val;
            } else if (keyLower.includes('ciclo') || keyLower.includes('nivel') || keyLower.includes('curso') || keyLower.includes('etapa')) {
              if (!ciclo) ciclo = val;
            } else if (keyLower.includes('descrip') || keyLower.includes('desarrollo') || keyLower.includes('regla') || keyLower.includes('explicacion')) {
              if (!descripcion) descripcion = val;
            } else if (keyLower.includes('material') || keyLower.includes('recurso')) {
              if (!material) material = val;
            }
          });

          // Fallback positioning if headers were generic
          if (!nombre && row['A']) nombre = String(row['A']);
          if (!descripcion && row['E']) descripcion = String(row['E']);

          if (nombre && nombre.toLowerCase() !== 'nombre' && nombre.toLowerCase() !== 'juego') {
            parsed.push({
              id: `excel-${Date.now()}-${sheetName}-${idx}`,
              nombre,
              tematica: tematica || sheetName || 'General EF',
              criterio: criterio || 'General',
              ciclo: ciclo || 'Todos los Ciclos',
              descripcion: descripcion || 'Sin descripción.',
              material: material || 'Sin material específico',
              origen: `${fileName} (${sheetName})`,
            });
          }
        });
      });

      if (parsed.length === 0) {
        setErrorMsg('No se detectaron filas válidas de juegos. Asegúrate de tener columnas como: Nombre, Temática, Criterio, Ciclo, Descripción, Material.');
      } else {
        const merged = [...parsed, ...games];
        setGames(merged);
        setStatusMsg(`¡Éxito! Se importaron ${parsed.length} juegos desde "${fileName}".`);
        
        // Notify AI generator if callback provided
        if (onGamesImportedForAI) {
          const gamesSummary = parsed.map(g => `* JUEGO: ${g.nombre} | Temática: ${g.tematica} | Ciclo: ${g.ciclo} | Material: ${g.material}\n  Descripción: ${g.descripcion}`).join('\n');
          onGamesImportedForAI(gamesSummary);
        }
      }
    } catch (err: any) {
      console.error('Error parsing excel:', err);
      setErrorMsg('Error al leer el archivo Excel: ' + (err.message || 'Formato no soportado.'));
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        parseExcelBuffer(evt.target.result as ArrayBuffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddSelectedToSession = () => {
    if (selectedGames.length === 0) return;
    let copy = [...sesiones];

    if (copy.length === 0) {
      copy = [
        {
          numeroSesion: 1,
          titulo: 'Sesión 1: Unidades y Juegos Importados',
          objetivoSesion: 'Practicar juegos y actividades seleccionados del Banco de Juegos.',
          materialesTotales: [],
          fases: [],
          criteriosTrabajados: [],
        },
      ];
    }

    const targetIdx = targetSessionIdx < copy.length ? targetSessionIdx : 0;
    const targetSession = copy[targetIdx];
    if (!targetSession) return;

    const toAdd = games.filter((g) => selectedGames.includes(g.id));

    toAdd.forEach((g) => {
      targetSession.fases.push({
        fase: targetFase,
        duracionMin: 10,
        nombreJuego: g.nombre,
        descripcion: formatGameDescription(`[Juego Importado Excel] ${g.descripcion} (Material: ${g.material})`),
        materiales: g.material ? [g.material] : [],
      });
    });

    setSesiones(copy);
    setStatusMsg(`¡Éxito! Añadidos ${toAdd.length} juego(s) a la Sesión ${targetIdx + 1}.`);
    setSelectedGames([]);
  };

  const handleClearAllGames = () => {
    setGames([]);
    setSelectedGames([]);
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
    if (onGamesCleared) {
      onGamesCleared();
    }
    setStatusMsg('Base de datos de juegos Excel y archivos vaciada por completo.');
  };

  // Filter games
  const filteredGames = games.filter((g) => {
    const matchQuery =
      g.nombre.toLowerCase().includes(search.toLowerCase()) ||
      g.tematica.toLowerCase().includes(search.toLowerCase()) ||
      g.criterio.toLowerCase().includes(search.toLowerCase()) ||
      g.descripcion.toLowerCase().includes(search.toLowerCase());

    const matchCiclo = selectedCiclo === 'Todos' || g.ciclo.toLowerCase().includes(selectedCiclo.toLowerCase());

    return matchQuery && matchCiclo;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-lg font-bold">Banco de Juegos desde Excel y Drive</h3>
              <p className="text-xs text-emerald-100">
                Importa tus documentos de Excel (.xlsx, .xls, .csv) con listas de juegos clasificados por temática, nivel y criterios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Upload Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition">
              <Upload className="w-4 h-4 text-emerald-200" />
              <span>Importar Excel (.xlsx / .csv)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {games.length > 0 && (
              <span className="text-xs font-bold text-slate-700 bg-emerald-100 text-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-300">
                {games.length} Juegos en Base de Datos
              </span>
            )}
          </div>

          <button
            onClick={handleClearAllGames}
            className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200 transition cursor-pointer"
            title="Vaciar por completo el banco de juegos de Excel y desconectar Google"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar Banco de Juegos y Fuentes</span>
          </button>
        </div>

        {/* Status / Error Notifications */}
        {statusMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-700 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por juego, temática, regla..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-slate-900 font-bold placeholder:text-slate-500 placeholder:font-normal shadow-2xs"
            />
          </div>

          <div>
            <select
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-slate-900 font-bold shadow-2xs"
            >
              <option value="Todos">Todos los Ciclos / Niveles</option>
              <option value="Primer Ciclo">Primer Ciclo (1º/2º)</option>
              <option value="Segundo Ciclo">Segundo Ciclo (3º/4º)</option>
              <option value="Tercer Ciclo">Tercer Ciclo (5º/6º)</option>
            </select>
          </div>

          {selectedGames.length > 0 && (
            <div className="flex items-center space-x-2 justify-end">
              <select
                value={targetSessionIdx}
                onChange={(e) => setTargetSessionIdx(Number(e.target.value))}
                className="text-xs p-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold shadow-2xs"
              >
                {sesiones.map((s, idx) => (
                  <option key={idx} value={idx}>
                    Añadir a Sesión {idx + 1}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddSelectedToSession}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Insertar ({selectedGames.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Game List Table / Cards */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-slate-100/50">
          {isParsing ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-bold">Analizando estructura de columnas del Excel...</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
              <Database className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No hay juegos cargados en el banco</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sube tu primer archivo Excel (.xlsx) con tu colección de juegos. La app extraerá automáticamente los títulos, reglas, temáticas, ciclos y materiales.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGames.map((g) => {
                const isChecked = selectedGames.includes(g.id);
                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-xl border transition bg-white shadow-2xs space-y-2 ${
                      isChecked ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedGames((prev) => prev.filter((id) => id !== g.id));
                            } else {
                              setSelectedGames((prev) => [...prev, g.id]);
                            }
                          }}
                          className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{g.nombre}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200">
                              Temática: {g.tematica}
                            </span>
                            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200">
                              Ciclo: {g.ciclo}
                            </span>
                            {g.criterio && (
                              <span className="text-[10px] font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                                Criterio: {g.criterio}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {g.origen || 'Excel'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {g.descripcion}
                    </p>

                    {g.material && (
                      <p className="text-[11px] text-slate-600 font-semibold">
                        📦 <strong>Material:</strong> {g.material}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Los juegos importados quedarán guardados en tu navegador y enriquecerán las sesiones generadas.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition"
          >
            Cerrar Banco de Juegos
          </button>
        </div>
      </div>
    </div>
  );
};
