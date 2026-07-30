import React, { useState } from 'react';
import { Sparkles, FolderDown, Plus, HelpCircle, FileText, CheckCircle2, Info, LogOut, ShieldCheck, CreditCard, KeyRound, Users } from 'lucide-react';
import { SituacionAprendizaje } from '../types';
import { HowItWorksModal } from './HowItWorksModal';
import { SavedSdasModal } from './SavedSdasModal';
import { TesterManagerModal } from './TesterManagerModal';
import { UserSession } from './LandingPage';
import { CreaEfLogo } from './CreaEfLogo';
import { useColorTheme } from '../utils/theme';

interface NavbarProps {
  currentStep: number;
  onNewSdA: () => void;
  savedSdas: SituacionAprendizaje[];
  onLoadSdA: (sda: SituacionAprendizaje) => void;
  onDeleteSdA: (id: string) => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentStep, onNewSdA, savedSdas, onLoadSdA, onDeleteSdA, userSession, onLogout }) => {
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showTesterModal, setShowTesterModal] = useState(false);
  const { theme } = useColorTheme();

  const handleOpenHowItWorks = () => {
    setShowHowItWorks(true);
  };

  return (
    <header id="app-navbar" className={`text-white shadow-lg sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${theme.headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center space-x-3">
          <div id="brand-icon-container" className="bg-white p-1 rounded-2xl border border-white/30 backdrop-blur-sm shadow-md shrink-0">
            <CreaEfLogo className="w-11 h-11" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 id="app-main-title" className="text-2xl font-black tracking-tight leading-none">
                <span className="text-orange-500 drop-shadow-xs">Crea-</span>
                <span className="text-sky-400 drop-shadow-xs">Ef</span>
              </h1>
              <span id="andalucia-flag-badge" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-950/80 text-amber-300 border border-amber-400/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>
                LOMLOE Decreto 101/2023
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5 font-medium leading-snug">
              Diseña y personaliza tus<br className="hidden sm:inline" /> Situaciones de Aprendizaje de EF
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {userSession && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-950/90 border border-indigo-700 text-xs">
              {userSession.type === 'trial' && (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-300">Prueba ({userSession.generacionesUsadas || 0}/3 SdAs)</span>
                </>
              )}
              {userSession.type === 'user' && (
                <>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Suscripción Activa</span>
                </>
              )}
              {userSession.type === 'admin' && (
                <>
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-indigo-300">
                    {['creaef@gmail.com', 'admin@crea-ef.es'].includes(userSession.email?.toLowerCase() || '') ? 'Acceso Administrador' : 'Acceso Tester'}
                  </span>
                </>
              )}
            </div>
          )}

          {userSession?.type === 'admin' && ['creaef@gmail.com', 'admin@crea-ef.es'].includes(userSession?.email?.toLowerCase() || '') && (
            <button
              id="btn-tester-manager-modal"
              onClick={() => setShowTesterModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold transition border border-emerald-500/60 shadow-xs cursor-pointer"
              title="Gestión de Cuentas de Tester"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Gestión Testers</span>
            </button>
          )}

          {/* Cómo funciona Button */}
          <button
            id="btn-how-it-works"
            onClick={handleOpenHowItWorks}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-extrabold transition border border-amber-400/40 shadow-xs"
            title="Instrucciones paso a paso"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
              i
            </div>
            <span>Cómo funciona</span>
          </button>

          <button
            id="btn-saved-sdas-modal"
            onClick={() => setShowSavedModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 text-xs sm:text-sm font-semibold transition border border-indigo-600/60 shadow-xs"
          >
            <FolderDown className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Mis SdAs Guardadas</span>
            {savedSdas.length > 0 && (
              <span id="saved-sdas-badge-count" className="ml-1 bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-xs font-bold">
                {savedSdas.length}
              </span>
            )}
          </button>

          <button
            id="btn-new-sda-create"
            onClick={onNewSdA}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold transition shadow-md hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Nueva SdA</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-900/60 text-slate-300 hover:text-red-200 transition border border-slate-700"
              title="Cerrar sesión y volver a la Pantalla de Inicio"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* How it works Modal */}
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

      {/* Saved SdAs Modal */}
      <SavedSdasModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedSdas={savedSdas}
        onLoadSdA={onLoadSdA}
        onDeleteSdA={onDeleteSdA}
      />

      {/* Tester Manager Modal */}
      <TesterManagerModal
        isOpen={showTesterModal}
        onClose={() => setShowTesterModal(false)}
      />
    </header>
  );
};
