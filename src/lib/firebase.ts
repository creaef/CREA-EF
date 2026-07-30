import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

// Load configuration from env variables with fallback to firebase-applet-config.json
const effectiveConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  oAuthClientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || firebaseConfig.oAuthClientId,
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(effectiveConfig) : getApp();
export const auth = getAuth(app);

export const requestDriveTokenViaGIS = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const clientId = effectiveConfig.oAuthClientId;
    const scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

    const triggerTokenClient = () => {
      try {
        if (window.google?.accounts?.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: scope,
            prompt: 'select_account',
            callback: (response: any) => {
              if (response.error) {
                reject(new Error(response.error_description || response.error));
              } else if (response.access_token) {
                resolve(response.access_token);
              } else {
                reject(new Error('No se recibió token de acceso de Google.'));
              }
            },
            error_callback: (err: any) => {
              const errMsg = err?.message || err?.type || 'Error al solicitar token de Google.';
              if (errMsg.toLowerCase().includes('popup') || errMsg.toLowerCase().includes('failed to open popup')) {
                reject(new Error('El navegador o visor dentro del marco bloqueó la ventana emergente de inicio de sesión (Failed to open popup window).'));
              } else {
                reject(new Error(errMsg));
              }
            }
          });
          client.requestAccessToken();
        } else {
          reject(new Error('Google Identity Services no está listo.'));
        }
      } catch (err: any) {
        reject(err);
      }
    };

    if (window.google?.accounts?.oauth2) {
      triggerTokenClient();
    } else {
      const existingScript = document.getElementById('google-gis-script') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', triggerTokenClient);
        if (window.google?.accounts?.oauth2) {
          triggerTokenClient();
        }
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => triggerTokenClient();
      script.onerror = () => reject(new Error('No se pudo cargar el script de autenticación de Google.'));
      document.head.appendChild(script);
    }
  });
};

export const loginWithGoogleDrive = async (): Promise<{ user: User | null; token: string }> => {
  const isPlaceholderKey =
    !effectiveConfig.apiKey ||
    effectiveConfig.apiKey.includes('PLACEHOLDER') ||
    !effectiveConfig.oAuthClientId ||
    effectiveConfig.oAuthClientId.includes('PLACEHOLDER');

  if (!isPlaceholderKey) {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error('No se pudo obtener el token de acceso de Google Drive.');
      }

      return { user: result.user, token: credential.accessToken };
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        const friendlyErr = new Error(
          'La ventana de inicio de sesión se cerró antes de completar el acceso a Google Drive. Por favor, inténtalo de nuevo.'
        );
        (friendlyErr as any).code = err.code;
        throw friendlyErr;
      }

      if (err?.code !== 'auth/api-key-not-valid' && !err?.message?.includes('api-key-not-valid')) {
        console.warn('Firebase login failed, trying direct Google Identity Services (GIS) fallback...', err);
      }
    }
  }

  // Intentar fallback mediante Google Identity Services (GIS)
  try {
    const gisToken = await requestDriveTokenViaGIS();
    let currentUser: User | null = null;
    try {
      currentUser = auth.currentUser;
    } catch (e) {}
    return { user: currentUser, token: gisToken };
  } catch (gisErr: any) {
    if (isPlaceholderKey) {
      throw new Error(
        '⚠️ Configuración de Firebase / GCP pendiente: Las claves de Firebase y Client ID de Google OAuth 2.0 contienen valores por defecto (PLACEHOLDER). Para que cualquier usuario pueda conectar su propia cuenta de Google Drive, configura las claves en tu archivo .env o utiliza la opción "Token manual".'
      );
    }

    if (
      gisErr?.code === 'auth/api-key-not-valid' ||
      gisErr?.message?.includes('api-key-not-valid') ||
      gisErr?.message?.includes('API key')
    ) {
      throw new Error(
        '⚠️ La Clave de API de Firebase introducida no es válida. Revisa la consola de Firebase del proyecto para copiar tu apiKey correcta o usa la opción "Token manual".'
      );
    }

    if (
      gisErr?.message?.includes('origin_mismatch') ||
      gisErr?.code === 'auth/unauthorized-domain'
    ) {
      throw new Error(
        '⚠️ Error 400: origin_mismatch - La URL de esta aplicación no está autorizada en tu Client ID de Google OAuth 2.0.'
      );
    }

    throw gisErr;
  }
};

export const logoutGoogle = async () => {
  await signOut(auth);
};
