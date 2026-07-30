import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, UserX, UserCheck, Plus, Copy, Check, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';

interface TesterAcc {
  email: string;
  password?: string;
  estado?: string;
}

interface TesterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TesterManagerModal: React.FC<TesterManagerModalProps> = ({ isOpen, onClose }) => {
  const [testers, setTesters] = useState<TesterAcc[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('tester123');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchTesters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testers');
      const data = await res.json();
      if (Array.isArray(data.testers)) {
        setTesters(data.testers);
      }
    } catch (e) {
      console.error('Error fetching testers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTesters();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (email: string) => {
    if (!confirm(`¿Seguro que deseas eliminar/revocar el acceso a ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/testers/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg(`Tester ${email} eliminado correctamente.`);
        fetchTesters();
      }
    } catch (e) {
      console.error('Error deleting tester:', e);
    }
  };

  const handleAddOrRestore = async (emailToAdd?: string) => {
    const targetEmail = emailToAdd || newEmail.trim().toLowerCase();
    if (!targetEmail) return;

    try {
      const res = await fetch('/api/admin/testers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: newPass || 'tester123', estado: 'Activo' }),
      });
      if (res.ok) {
        setStatusMsg(`Tester ${targetEmail} guardado/activado.`);
        setNewEmail('');
        fetchTesters();
      }
    } catch (e) {
      console.error('Error adding tester:', e);
    }
  };

  const copyCredentials = (acc: TesterAcc) => {
    const text = `Email: ${acc.email}\nContraseña: ${acc.password || 'tester123'}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(acc.email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const modalContent = (
    <div
      id="tester-manager-modal-backdrop"
      className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="tester-manager-modal-card"
        className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 my-auto z-[100000] flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Gestión de Cuentas de Tester</h3>
              <p className="text-xs text-slate-400">
                10 cuentas de tester creadas (tester1@crea-ef.es a tester10@crea-ef.es / tester123)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center justify-between shrink-0">
            <span>{statusMsg}</span>
            <button type="button" onClick={() => setStatusMsg(null)} className="text-emerald-400 font-bold hover:underline">
              OK
            </button>
          </div>
        )}

        {/* Add new tester bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddOrRestore();
          }}
          className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0"
        >
          <label className="text-xs font-bold uppercase text-slate-300 block">Añadir o Restablecer un Tester:</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              placeholder="testerX@crea-ef.es"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="tester123"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-28 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Tester</span>
            </button>
          </div>
        </form>

        {/* List of testers */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Cargando lista de testers...</span>
            </div>
          ) : testers.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">No hay usuarios tester registrados.</div>
          ) : (
            testers.map((t) => (
              <div
                key={t.email}
                className="flex flex-wrap items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 gap-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg ${t.estado === 'Inactivo' ? 'bg-red-950 text-red-400 border border-red-800/50' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'}`}>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{t.email}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${t.estado === 'Inactivo' ? 'bg-red-900/60 text-red-300 border border-red-700/50' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'}`}>
                        {t.estado === 'Inactivo' ? 'Inactivo / Eliminado' : 'Activo'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Contraseña: <span className="font-mono text-amber-300">{t.password || 'tester123'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => copyCredentials(t)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 text-xs flex items-center space-x-1 cursor-pointer"
                    title="Copiar email y contraseña"
                  >
                    {copiedEmail === t.email ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-300">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-[10px] text-slate-300">Copiar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(t.email)}
                    className="p-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white transition border border-red-800/50 text-xs flex items-center space-x-1 cursor-pointer"
                    title="Eliminar este tester"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Eliminar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Al eliminar un tester, su acceso se revoca de forma inmediata.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
