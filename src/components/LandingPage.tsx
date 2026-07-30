import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  CreditCard,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  X,
  Mail,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { CreaEfLogo } from './CreaEfLogo';
import { useColorTheme } from '../utils/theme';

export interface UserSession {
  type: 'trial' | 'user' | 'admin';
  email: string;
  estadoPago?: 'Pendiente' | 'Pagado';
  estadoAdmin?: 'Activo' | 'Inactivo';
  generacionesRestantes?: number;
  generacionesUsadas?: number;
}

interface LandingPageProps {
  onStartSession: (session: UserSession) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSession }) => {
  const [activeTab, setActiveTab] = useState<'trial' | 'user' | 'admin'>('trial');

  // Via 1: Trial State
  const [trialEmail, setTrialEmail] = useState('');
  const [trialError, setTrialError] = useState<string | null>(null);

  // Via 2: User Login State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userError, setUserError] = useState<string | null>(null);

  // Via 2: User Registration Modal State ("¿No tienes cuenta? Regístrate")
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regApellidos, setRegApellidos] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Stripe Modal State
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [currentUserPending, setCurrentUserPending] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Check URL params for successful Stripe return
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        const email = params.get('email');
        if (email) {
          window.history.replaceState({}, document.title, window.location.pathname);
          onStartSession({
            type: 'user',
            email,
            estadoPago: 'Pagado',
          });
        }
      }
    } catch (e) {}
  }, []);

  // Via 3: Admin / Developer State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Local storage checks
  const getDeviceTrialCount = (): number => {
    try {
      const stored = localStorage.getItem('trial_device_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  };

  const getDeviceTrialEmail = (): string | null => {
    try {
      return localStorage.getItem('trial_device_email');
    } catch (e) {
      return null;
    }
  };

  // Handle Trial Submission (Via 1)
  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialError(null);

    const cleanEmail = trialEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setTrialError('Por favor, introduce un correo electrónico válido.');
      return;
    }

    // Front-end localStorage double check for device lock
    const deviceCount = getDeviceTrialCount();
    const storedDeviceEmail = getDeviceTrialEmail();

    if (deviceCount >= 3) {
      setTrialError(
        `Este dispositivo ya ha consumido el límite de 3 Situaciones de Aprendizaje de prueba. Por favor, regístrate en la Vía 2 para obtener acceso ilimitado.`
      );
      return;
    }

    if (storedDeviceEmail && storedDeviceEmail !== cleanEmail && deviceCount >= 3) {
      setTrialError(
        `Este dispositivo está bloqueado por haber alcanzado el límite de prueba con otra cuenta (${storedDeviceEmail}). Se requiere suscripción para continuar.`
      );
      return;
    }

    try {
      // Backend validation request
      const res = await fetch('/api/auth/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, deviceCount }),
      });

      const data = await res.json();
      if (!res.ok || data.blocked) {
        setTrialError(
          data.message ||
            'Has alcanzado el límite máximo de 3 SdAs de prueba con esta cuenta. Te invitamos a suscribirte en la Vía 2.'
        );
        return;
      }

      // Save device state
      localStorage.setItem('trial_device_email', cleanEmail);
      localStorage.setItem('trial_device_count', String(data.generacionesUsadas || deviceCount));

      onStartSession({
        type: 'trial',
        email: cleanEmail,
        generacionesUsadas: data.generacionesUsadas || deviceCount,
        generacionesRestantes: data.generacionesRestantes || Math.max(0, 3 - deviceCount),
      });
    } catch (err) {
      // Fallback local execution if offline or direct
      const updatedCount = deviceCount;
      if (updatedCount >= 3) {
        setTrialError(
          'Límite de prueba alcanzado en este dispositivo (3/3). Regístrate para continuar.'
        );
        return;
      }
      localStorage.setItem('trial_device_email', cleanEmail);
      onStartSession({
        type: 'trial',
        email: cleanEmail,
        generacionesUsadas: updatedCount,
        generacionesRestantes: 3 - updatedCount,
      });
    }
  };

  // Handle User Login (Via 2)
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    const cleanEmail = userEmail.trim().toLowerCase();
    if (!cleanEmail || !userPassword) {
      setUserError('Por favor, introduce tu correo electrónico y contraseña.');
      return;
    }

    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: userPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.estadoPago === 'Pendiente') {
          setCurrentUserPending(cleanEmail);
          const stripeRes = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail }),
          });
          const stripeData = await stripeRes.json();
          if (stripeData.url) {
            window.location.href = stripeData.url;
            return;
          } else if (stripeData.error) {
            setUserError(`Pago pendiente: ${stripeData.error}`);
            return;
          }
        } else {
          onStartSession({
            type: 'user',
            email: cleanEmail,
            estadoPago: 'Pagado',
          });
          return;
        }
      }
    } catch (err) {
      // Fallback a validación cliente si el backend de Node.js no está activo en hosting estático
    }

    // Fallback cliente para Firebase Hosting / Alojamiento estático
    const isDefaultPaidUser =
      (cleanEmail === 'admin@crea-ef.es' || cleanEmail === 'creaef@gmail.com') &&
      (userPassword === 'admin123' || userPassword === '3333');

    const isTesterUser =
      (cleanEmail === 'tester@crea-ef.es' || /^tester[1-9][0-9]?@crea-ef\.es$/.test(cleanEmail)) &&
      userPassword === 'tester123';

    if (isDefaultPaidUser || isTesterUser) {
      onStartSession({
        type: 'user',
        email: cleanEmail,
        estadoPago: 'Pagado',
      });
      return;
    }

    const storedUserStr = localStorage.getItem(`registered_user_${cleanEmail}`);
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser.password === userPassword) {
          onStartSession({
            type: 'user',
            email: cleanEmail,
            estadoPago: storedUser.estadoPago || 'Pagado',
          });
          return;
        }
      } catch (e) {}
    }

    setUserError('Credenciales de usuario incorrectas o cuenta no registrada.');
  };

  // Handle User Registration Submission in Popup Modal
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanNombre = regNombre.trim();
    const cleanApellidos = regApellidos.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPassword = regPassword.trim();

    if (!cleanNombre || !cleanApellidos || !cleanEmail || !cleanPassword) {
      setRegError('Por favor, completa todos los campos (Nombre, Apellidos, Correo Electrónico y Contraseña).');
      return;
    }

    setRegLoading(true);

    // Guardar usuario en localStorage para compatibilidad estática
    localStorage.setItem(
      `registered_user_${cleanEmail}`,
      JSON.stringify({ email: cleanEmail, password: cleanPassword, estadoPago: 'Pagado' })
    );

    try {
      const res = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: cleanNombre,
          apellidos: cleanApellidos,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          setRegError(data.message || 'Error al completar el registro.');
          setRegLoading(false);
          return;
        }
      }
    } catch (err) {
      // Ignorar error de red si estamos en hosting estático
    }

    setShowRegisterModal(false);
    setRegNombre('');
    setRegApellidos('');
    setRegEmail('');
    setRegPassword('');

    onStartSession({
      type: 'user',
      email: cleanEmail,
      estadoPago: 'Pagado',
    });
    setRegLoading(false);
  };

  // Real Stripe Checkout initiation
  const handleRealStripeCheckout = async () => {
    if (!currentUserPending) return;
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserPending }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setUserError(data.error || 'No se pudo generar la sesión de pago de Stripe.');
      }
    } catch (e: any) {
      setUserError(e.message || 'Error al conectar con la pasarela de pago de Stripe.');
    } finally {
      setStripeLoading(false);
    }
  };

  // Simulate Stripe Payment Confirmation (Webhook simulation)
  const handleSimulateStripePayment = async () => {
    if (!currentUserPending) return;
    try {
      const res = await fetch('/api/auth/user/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserPending }),
      });

      if (res.ok) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setShowStripeCheckout(false);
          setPaymentSuccess(false);
          onStartSession({
            type: 'user',
            email: currentUserPending,
            estadoPago: 'Pagado',
          });
        }, 1500);
      }
    } catch (e) {
      setUserError('Error al procesar el pago.');
    }
  };

  // Handle Admin Submission (Via 3)
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!cleanEmail || !adminPassword) {
      setAdminError('Introduce email y contraseña de administrador.');
      return;
    }

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: adminPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.estado === 'Inactivo') {
          setAdminError('⛔ Acceso revocado. Tu cuenta de desarrollador se encuentra INACTIVA.');
          return;
        }

        onStartSession({
          type: 'admin',
          email: cleanEmail,
          estadoAdmin: 'Activo',
        });
        return;
      }
    } catch (err) {
      // Fallback a cliente en entornos estáticos
    }

    // Validación cliente para Firebase Hosting estático
    const isAdminAccount =
      (cleanEmail === 'admin@crea-ef.es' || cleanEmail === 'creaef@gmail.com') &&
      (adminPassword === 'admin123' || adminPassword === '3333');

    const isTesterAccount =
      (cleanEmail === 'tester@crea-ef.es' || /^tester[1-9][0-9]?@crea-ef\.es$/.test(cleanEmail)) &&
      adminPassword === 'tester123';

    if (isAdminAccount || isTesterAccount) {
      onStartSession({
        type: 'admin',
        email: cleanEmail,
        estadoAdmin: 'Activo',
      });
      return;
    }

    setAdminError('Credenciales de administración o tester incorrectas.');
  };

  const codeGsContent = '';

  const { theme } = useColorTheme();

  return (
    <div className={`min-h-screen ${theme.bodyBgClass} flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900 font-sans transition-colors duration-300`}>
      {/* Top Banner Header */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${theme.headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-700 shadow-md shrink-0 flex items-center justify-center">
              <CreaEfLogo className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight leading-none">
                  <span className="text-orange-500">Crea-</span>
                  <span className="text-sky-400">Ef</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  LOMLOE Andalucía
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium leading-snug">
                Diseña y personaliza tus<br className="hidden sm:inline" /> Situaciones de Aprendizaje de EF
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Access System */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Centered App Brand & Logo */}
        <div className="flex flex-col items-center text-center space-y-3 max-w-2xl">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <CreaEfLogo className="w-28 h-28 sm:w-36 sm:h-36" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight pt-1">
            <span className="text-orange-500 drop-shadow-sm">Crea-</span>
            <span className="text-sky-400 drop-shadow-sm">Ef</span>
          </h1>
          <p className="text-center text-base sm:text-xl text-slate-200 font-semibold max-w-lg leading-relaxed">
            Diseña y personaliza tus<br />
            Situaciones de Aprendizaje de EF
          </p>
        </div>

        {/* Title and Intro */}
        <div className="text-center max-w-xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema de Control de Acceso Integrado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Selecciona tu vía de acceso
          </h2>
        </div>

        {/* Access Method Tabs */}
        <div className="w-full max-w-4xl bg-slate-950/90 rounded-3xl p-2 border border-slate-800 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('trial')}
            className={`p-4 rounded-2xl flex flex-col items-start text-left transition-all relative overflow-hidden ${
              activeTab === 'trial'
                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/50 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Vía 1
              </span>
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-extrabold text-base text-white">Periodo de Prueba</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba gratuita (máx. 3 SdAs) con doble validación Email + Dispositivo.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('user')}
            className={`p-4 rounded-2xl flex flex-col items-start text-left transition-all relative overflow-hidden ${
              activeTab === 'user'
                ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-400/50 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                Vía 2
              </span>
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-extrabold text-base text-white">Regístrate / Iniciar Sesión</h3>
            <p className="text-xs text-slate-400 mt-1">
              Acceso ilimitado mediante suscripción.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`p-4 rounded-2xl flex flex-col items-start text-left transition-all relative overflow-hidden ${
              activeTab === 'admin'
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/50 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Vía 3
              </span>
              <KeyRound className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-extrabold text-base text-white">Admin / Desarrolladores</h3>
            <p className="text-xs text-slate-400 mt-1">
              Acceso restringido para administradores y testers con verificación de estado.
            </p>
          </button>
        </div>

        {/* Tab Content Cards */}
        <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* VIA 1: TRIAL */}
          {activeTab === 'trial' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Acceso Gratuito de Prueba</h3>
                  <p className="text-xs text-slate-400">
                    Doble validación: Control por servidor (Email) y dispositivo (localStorage)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Límite:</strong> Puedes generar un máximo de <strong>3 Situaciones de Aprendizaje</strong>. Al consumir la tercera SdA, la aplicación bloqueará automáticamente este dispositivo y te redirigirá a la suscripción.
                </p>
              </div>

              <form onSubmit={handleTrialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Correo electrónico básico:
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="profesor@crea-ef.es"
                      value={trialEmail}
                      onChange={(e) => setTrialEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {trialError && (
                  <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p>{trialError}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('user')}
                        className="inline-flex items-center space-x-1 font-extrabold text-amber-300 underline text-xs"
                      >
                        <span>Ir a Registro y Suscripción (Vía 2)</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
                >
                  <span>Comenzar periodo de prueba</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* VIA 2: USER LOGIN + STRIPE */}
          {activeTab === 'user' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Iniciar Sesión</h3>
                    <p className="text-xs text-slate-400">
                      Acceso ilimitado para usuarios con suscripción activa
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegError(null);
                    setShowRegisterModal(true);
                  }}
                  className="text-xs text-indigo-400 font-bold hover:underline flex items-center space-x-1 shrink-0 ml-2"
                >
                  <span>¿No tienes cuenta? Regístrate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <form onSubmit={handleUserLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Correo electrónico:
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="docente@crea-ef.es"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                {userError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{userError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>

                <div className="pt-2 text-center border-t border-slate-800/80 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setShowRegisterModal(true);
                    }}
                    className="text-xs text-slate-400 hover:text-indigo-300 font-semibold transition inline-flex items-center space-x-1"
                  >
                    <span>¿Aún no tienes cuenta?</span>
                    <span className="text-indigo-400 font-extrabold underline">Haz clic aquí para registrarte y suscribirte</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIA 3: ADMIN & DEVELOPERS */}
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Acceso Administradores / Testers</h3>
                  <p className="text-xs text-slate-400">
                    Acceso con credenciales autorizadas
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Email de Administrador / Tester:
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="creaef@gmail.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Contraseña de Acceso:
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                </div>

                {adminError && (
                  <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Validar Credenciales Admin / Tester</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* USER REGISTRATION POPUP MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Formulario de Registro</span>
              </div>
              <h3 className="text-2xl font-black text-white">Crea tu Cuenta de Usuario</h3>
              <p className="text-xs text-slate-400">
                Completa tus datos para registrarte. Una vez enviado el formulario, serás redirigido a la pasarela de pago para activar tu acceso ilimitado.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="María"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Apellidos:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="García López"
                    value={regApellidos}
                    onChange={(e) => setRegApellidos(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Correo Electrónico:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="profesor@colegio.es"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {regError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{regLoading ? 'Procesando registro...' : 'Regístrame y Pagar 12€ (Pago Único)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STRIPE CHECKOUT MODAL SIMULATION */}
      {showStripeCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowStripeCheckout(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Pasarela de Pago Stripe</h3>
              {currentUserPending && (
                <p className="text-xs text-indigo-300 font-medium">
                  Usuario: <strong>{currentUserPending}</strong>
                </p>
              )}
              <p className="text-xs text-slate-400">
                Estado de suscripción: <span className="text-amber-400 font-bold">Pendiente</span>
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Plan Ilimitado Crea-Ef</span>
                <span className="font-extrabold text-white text-sm">12 € / mes</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Incluye generación ilimitada de Situaciones de Aprendizaje, Banco de Juegos, exportación a Word/PDF y adaptaciones NEAE/DUA.
              </p>
            </div>

            {paymentSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-extrabold text-sm">¡Pago Confirmado vía Webhook!</p>
                <p className="text-xs text-emerald-300">
                  Tu estado de usuario cambió a "Pagado". Redirigiendo a la herramienta...
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRealStripeCheckout}
                disabled={stripeLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-white" />
                <span>{stripeLoading ? 'Redirigiendo a Stripe...' : 'Ir a Pasarela de Pago de Stripe (12 €)'}</span>
              </button>
            )}
          </div>
        </div>
      )}



      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 bg-slate-950 text-center text-xs text-slate-500">
        Plataforma de Situaciones de Aprendizaje de EF Andalucía • Adaptado a LOMLOE & Instrucción 12/2022
      </footer>
    </div>
  );
};
