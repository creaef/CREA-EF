import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import mammoth from 'mammoth';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import * as XLSX from 'xlsx';
import { formatGameDescription } from './src/types';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Lazy initializer for Stripe Client
function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('PLACEHOLDER')) {
    return null;
  }
  return new Stripe(secretKey);
}

app.use(express.json({ limit: '10mb' }));

function getPdfParser() {
  if (typeof pdfParseModule === 'function') return pdfParseModule;
  if (typeof (pdfParseModule as any).default === 'function') return (pdfParseModule as any).default;
  if (typeof (pdfParseModule as any).default?.default === 'function') return (pdfParseModule as any).default.default;
  return null;
}

// Resolver clave de API de Gemini funcional (prioriza clave personalizada, luego GEMINI_API_KEY o VITE_FIREBASE_API_KEY)
function resolveGeminiApiKey(customApiKey?: string): string {
  if (customApiKey && customApiKey.trim() && !customApiKey.startsWith('AQ.') && !customApiKey.includes('PLACEHOLDER')) {
    return customApiKey.trim();
  }
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim() && !envKey.startsWith('AQ.') && !envKey.includes('PLACEHOLDER')) {
    return envKey.trim();
  }
  const firebaseKey = process.env.VITE_FIREBASE_API_KEY;
  if (firebaseKey && firebaseKey.trim()) {
    return firebaseKey.trim();
  }
  return '';
}

// Lazy initializer para el cliente oficial de Google Gemini
function getGenAIClient(customApiKey?: string) {
  const apiKey = resolveGeminiApiKey(customApiKey);

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper para ejecutar peticiones Gemini con reintento automático y fallbacks a modelos oficiales válidos
async function callGeminiWithRetry(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 2
) {
  // Modelos oficiales vigentes en la API de Google Generative Language (Prioridad Gemini Pro)
  const modelsToTry = [
    params.model || 'gemini-2.5-pro',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;

  for (const modelCandidate of uniqueModels) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const currentParams = { ...params, model: modelCandidate };
        const response = await ai.models.generateContent(currentParams);

        const firstCandidate = response.candidates?.[0];
        const finishReason = firstCandidate?.finishReason || 'STOP';
        const safetyRatings = firstCandidate?.safetyRatings || [];

        console.log(`[Gemini API - Éxito] Modelo: ${modelCandidate} (modelVersion: ${response.modelVersion || modelCandidate})`);
        if (response.usageMetadata) {
          console.log(`  Usage Tokens -> Prompt: ${response.usageMetadata.promptTokenCount}, Candidates: ${response.usageMetadata.candidatesTokenCount}, Total: ${response.usageMetadata.totalTokenCount}`);
        }

        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err || '');
        console.warn(`[Gemini API - ${modelCandidate}] Falló: ${errStr.slice(0, 150)}`);
        break; // Probar siguiente modelo candidato
      }
    }
  }

  throw lastError || new Error('El servicio de la API de Gemini no está disponible en este momento. Por favor, inténtalo de nuevo.');
}

// System instruction prompt for EF LOMLOE Expert
const SYSTEM_INSTRUCTION_EF = `Eres un catedrático experto en Didáctica de la Educación Física y especialista en desarrollo de Situaciones de Aprendizaje (SdA) alineadas con la LOMLOE y el Decreto 101/2023.

REGLAS DE ORO OBLIGATORIAS:
1. Redacta contenido pedagógicamente rico, específico, apasionante y libre de estereotipos o frases vacías.
2. REGLA SOBRE LA TEMÁTICA REGIONAL (CON EXCEPCIÓN EXPLÍCITA): Por norma general, QUEDA PROHIBIDO forzar referencias a la cultura andaluza o folclore en juegos genéricos (ej. baloncesto, parkour, atletismo, juegos cooperativos). EXCEPCIÓN OBLIGATORIA: Si la temática indicada por el docente o la documentación adjunta señala explícitamente la cultura o contenidos andaluces (ej. "Juegos Populares y Tradicionales de Andalucía", "Día de Andalucía", "Danzas Andaluzas", "Patrimonio Motriz Andaluz"), EN ESE CASO SÍ SE DEBEN adaptar, diseñar y buscar juegos y actividades claramente relacionados con la temática andaluza.
3. Si el docente adjunta documentación (Word, PDF, Excel o Google Drive), DEBES LEERLA ATENTAMENTE e integrar las propuestas de los archivos en la parte principal de las sesiones.
4. Garantiza la inclusión real aplicando los principios del Diseño Universal para el Aprendizaje (DUA) y ofreciendo variaciones adaptadas concretas para alumnado con necesidades específicas (NEAE).
Responde siempre en español profesional, motivador y docente.`;

/**
 * Safely parses JSON strings returned by AI models, stripping markdown fences,
 * extracting the inner JSON object/array, and cleaning trailing content or control characters.
 */
function safeParseAIJson<T = any>(text: string | undefined | null, defaultValue: T): T {
  if (!text || typeof text !== 'string') return defaultValue;

  let cleaned = text.trim();

  // Strip markdown code fences (```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    const fenceIdx = cleaned.indexOf('```');
    if (fenceIdx !== -1) {
      cleaned = cleaned.substring(0, fenceIdx).trim();
    }
  }

  // Extract from first { or [ to matching last } or ]
  const firstObj = cleaned.indexOf('{');
  const firstArr = cleaned.indexOf('[');

  let startIdx = -1;
  let endIdx = -1;

  if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
    startIdx = firstObj;
    endIdx = cleaned.lastIndexOf('}');
  } else if (firstArr !== -1) {
    startIdx = firstArr;
    endIdx = cleaned.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[safeParseAIJson] Primary JSON parse failed, attempting sanitization...', err);
    try {
      const sanitized = cleaned
        .replace(/,\s*([\}\]])/g, '$1')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => (c === '\n' || c === '\r' || c === '\t' ? c : ''));
      return JSON.parse(sanitized);
    } catch (e2) {
      console.error('[safeParseAIJson] Failed to parse JSON response:', e2, '\nLength:', text.length);
      return defaultValue;
    }
  }
}

// --- BANCO Y CONTROL DE ACCESO PERSISTENTE CON FILE STORE ---
const AUTH_USERS_FILE = path.join(process.cwd(), 'auth_users.json');

interface DevAccount {
  email: string;
  password: string;
  estado: 'Activo' | 'Inactivo';
}

interface UserAccount {
  nombre?: string;
  apellidos?: string;
  email: string;
  password: string;
  estadoPago: 'Pendiente' | 'Pagado';
}

interface AuthData {
  devsStore: DevAccount[];
  usersStore: UserAccount[];
}

function getDefaultAuthData(): AuthData {
  const initialDevs: DevAccount[] = [
    { email: 'creaef@gmail.com', password: 'admin123', estado: 'Activo' },
    { email: 'admin@crea-ef.es', password: 'admin123', estado: 'Activo' },
    { email: 'tester@crea-ef.es', password: 'tester123', estado: 'Activo' },
  ];
  const initialUsers: UserAccount[] = [
    { email: 'creaef@gmail.com', password: 'admin123', estadoPago: 'Pagado' },
    { email: 'admin@crea-ef.es', password: 'admin123', estadoPago: 'Pagado' },
  ];

  // Generar los 10 testers solicitados con email tester1@crea-ef.es ... tester10@crea-ef.es y contraseña tester123
  for (let i = 1; i <= 10; i++) {
    const email = `tester${i}@crea-ef.es`;
    initialDevs.push({ email, password: 'tester123', estado: 'Activo' });
    initialUsers.push({ email, password: 'tester123', estadoPago: 'Pendiente' });
  }

  return {
    devsStore: initialDevs,
    usersStore: initialUsers,
  };
}

function loadAuthData(): AuthData {
  try {
    if (fs.existsSync(AUTH_USERS_FILE)) {
      const content = fs.readFileSync(AUTH_USERS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.devsStore) && Array.isArray(data.usersStore)) {
        // Garantizar que estén los 10 testers por defecto si faltan y actualizar sus contraseñas a tester123
        let modified = false;
        const defaultData = getDefaultAuthData();
        defaultData.devsStore.forEach((dev) => {
          const existingDev = data.devsStore.find((d: DevAccount) => d.email === dev.email);
          if (!existingDev) {
            data.devsStore.push(dev);
            modified = true;
          }
        });
        defaultData.usersStore.forEach((usr) => {
          const existingUser = data.usersStore.find((u: UserAccount) => u.email === usr.email);
          if (!existingUser) {
            data.usersStore.push(usr);
            modified = true;
          }
        });
        if (modified) {
          saveAuthData(data);
        }
        return data;
      }
    }
  } catch (e) {
    console.error('Error al leer auth_users.json:', e);
  }
  const defaultData = getDefaultAuthData();
  saveAuthData(defaultData);
  return defaultData;
}

function saveAuthData(data: AuthData) {
  try {
    fs.writeFileSync(AUTH_USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error al guardar auth_users.json:', e);
  }
}

const trialStore = new Map<string, { count: number; lastAccess: Date }>();

// Vía 1: Trial (Doble Validación)
app.post('/api/auth/trial', (req, res) => {
  const { email, deviceCount } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  const cleanEmail = String(email).trim().toLowerCase();
  let record = trialStore.get(cleanEmail);

  if (!record) {
    record = { count: Math.max(0, Number(deviceCount) || 0), lastAccess: new Date() };
    trialStore.set(cleanEmail, record);
  }

  if (record.count >= 3 || Number(deviceCount) >= 3) {
    return res.status(403).json({
      blocked: true,
      message: 'Límite máximo de 3 Situaciones de Aprendizaje de prueba alcanzado en este email o dispositivo.',
      generacionesUsadas: record.count,
    });
  }

  record.count += 1;
  record.lastAccess = new Date();

  return res.json({
    blocked: false,
    generacionesUsadas: record.count,
    generacionesRestantes: Math.max(0, 3 - record.count),
  });
});

// Vía 2: Registro de Usuario
app.post('/api/auth/user/register', (req, res) => {
  const { nombre, apellidos, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });

  const cleanEmail = String(email).trim().toLowerCase();
  const authData = loadAuthData();
  const existing = authData.usersStore.find((u) => u.email === cleanEmail);
  if (existing) {
    if (existing.estadoPago === 'Pendiente') {
      existing.password = String(password);
      if (nombre) existing.nombre = String(nombre).trim();
      if (apellidos) existing.apellidos = String(apellidos).trim();
      saveAuthData(authData);
      return res.json({ success: true, estadoPago: 'Pendiente', email: cleanEmail });
    }
    return res.status(400).json({ message: 'El correo ya se encuentra registrado con suscripción pagada. Inicia sesión.' });
  }

  const newUser: UserAccount = {
    nombre: nombre ? String(nombre).trim() : '',
    apellidos: apellidos ? String(apellidos).trim() : '',
    email: cleanEmail,
    password: String(password),
    estadoPago: 'Pendiente' as const,
  };
  authData.usersStore.push(newUser);
  saveAuthData(authData);

  return res.json({ success: true, estadoPago: 'Pendiente', email: cleanEmail });
});

// Vía 2: Login de Usuario
app.post('/api/auth/user/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = String(email).trim().toLowerCase();
  const authData = loadAuthData();
  
  // Verificar si está inactivo en devsStore
  const dev = authData.devsStore.find((d) => d.email === cleanEmail);
  if (dev && dev.estado === 'Inactivo') {
    return res.status(403).json({ message: '⛔ Acceso revocado. La cuenta de tester se encuentra inactiva o eliminada.' });
  }

  const user = authData.usersStore.find((u) => u.email === cleanEmail && u.password === String(password));

  if (!user) {
    return res.status(401).json({ message: 'Credenciales de usuario incorrectas o cuenta no registrada.' });
  }

  return res.json({ success: true, estadoPago: user.estadoPago, email: user.email });
});

// Vía 2: Confirmar Pago Stripe (Webhook Simulation / Fallback)
app.post('/api/auth/user/confirm-payment', (req, res) => {
  const { email } = req.body;
  const cleanEmail = String(email).trim().toLowerCase();
  const authData = loadAuthData();
  const user = authData.usersStore.find((u) => u.email === cleanEmail);

  if (user) {
    user.estadoPago = 'Pagado';
    saveAuthData(authData);
    return res.json({ success: true, estadoPago: 'Pagado' });
  }

  // If new user direct checkout
  authData.usersStore.push({ email: cleanEmail, password: '123', estadoPago: 'Pagado' });
  saveAuthData(authData);
  return res.json({ success: true, estadoPago: 'Pagado' });
});

// Stripe Real Checkout Session Endpoint
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  const { email } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email es requerido.' });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(400).json({ error: 'Stripe Secret Key no está configurada.' });
  }

  try {
    const origin = req.headers.origin || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Suscribirse a App Ilimitada Crea-Ef',
              description: 'Acceso ilimitado y permanente a la plataforma de creación de Situaciones de Aprendizaje de EF, Banco de Juegos y herramientas de IA (IVA incluido).',
              tax_code: 'txcd_10000000',
            },
            unit_amount: 1200, // 12.00 EUR (IVA incluido)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: cleanEmail,
      success_url: `${origin}?payment=success&email=${encodeURIComponent(cleanEmail)}`,
      cancel_url: `${origin}?payment=cancel`,
      metadata: {
        email: cleanEmail,
      },
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error('Error al crear sesión de pago en Stripe:', err);
    return res.status(500).json({ error: err.message || 'Error al conectar con la pasarela de Stripe.' });
  }
});

// Stripe Real Webhook Endpoint
app.post('/api/stripe/webhook', (req, res) => {
  const stripe = getStripeClient();
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (stripe && webhookSecret && !webhookSecret.includes('PLACEHOLDER') && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Stripe Webhook Signature Verification Failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    try {
      const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      event = bodyObj as Stripe.Event;
    } catch (e) {
      return res.status(400).send('Webhook Payload Error');
    }
  }

  if (event && event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_email || session.metadata?.email;
    if (customerEmail) {
      const cleanEmail = customerEmail.trim().toLowerCase();
      const authData = loadAuthData();
      const user = authData.usersStore.find((u) => u.email === cleanEmail);
      if (user) {
        user.estadoPago = 'Pagado';
        saveAuthData(authData);
      } else {
        authData.usersStore.push({ email: cleanEmail, password: '123', estadoPago: 'Pagado' });
        saveAuthData(authData);
      }
      console.log(`[Stripe Webhook] Suscripción activada para: ${cleanEmail}`);
    }
  }

  res.json({ received: true });
});

// Vía 3: Login Admin / Desarrolladores / Testers
app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = String(email).trim().toLowerCase();
  const authData = loadAuthData();
  const dev = authData.devsStore.find((d) => d.email === cleanEmail && d.password === String(password));

  if (!dev) {
    return res.status(401).json({ message: 'Credenciales de administración/tester incorrectas.' });
  }

  if (dev.estado === 'Inactivo') {
    return res.status(403).json({
      message: '⛔ Acceso revocado. Tu usuario de tester/desarrollador se encuentra INACTIVO o ha sido eliminado.',
      estado: 'Inactivo',
    });
  }

  return res.json({ success: true, estado: 'Activo', email: dev.email });
});

// API ADMIN: Obtener lista de testers y usuarios
app.get('/api/admin/testers', (req, res) => {
  const authData = loadAuthData();
  res.json({ testers: authData.devsStore, users: authData.usersStore });
});

// API ADMIN: Eliminar un tester
app.delete('/api/admin/testers/:email', (req, res) => {
  const cleanEmail = String(req.params.email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email requerido.' });
  }
  const authData = loadAuthData();
  authData.devsStore = authData.devsStore.filter((d) => d.email !== cleanEmail);
  authData.usersStore = authData.usersStore.filter((u) => u.email !== cleanEmail);
  saveAuthData(authData);
  res.json({ success: true, message: `Tester ${cleanEmail} eliminado.` });
});

// API ADMIN: Añadir o actualizar un tester
app.post('/api/admin/testers', (req, res) => {
  const { email, password, estado } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email es obligatorio.' });
  }
  const pass = String(password || 'tester123');
  const st = estado === 'Inactivo' ? 'Inactivo' : 'Activo';

  const authData = loadAuthData();
  const existingDev = authData.devsStore.find((d) => d.email === cleanEmail);
  if (existingDev) {
    existingDev.password = pass;
    existingDev.estado = st;
  } else {
    authData.devsStore.push({ email: cleanEmail, password: pass, estado: st });
  }

  const existingUser = authData.usersStore.find((u) => u.email === cleanEmail);
  if (existingUser) {
    existingUser.password = pass;
    existingUser.estadoPago = st === 'Activo' ? 'Pagado' : 'Pendiente';
  } else {
    authData.usersStore.push({ email: cleanEmail, password: pass, estadoPago: st === 'Activo' ? 'Pagado' : 'Pendiente' });
  }

  saveAuthData(authData);
  res.json({ success: true, message: `Tester ${cleanEmail} guardado con éxito.` });
});

// API 1: Generar Justificación de la SdA
app.post('/api/ai/generate-justification', async (req, res) => {
  try {
    const { titulo, curso, ciclo, tematica } = req.body;
    if (!titulo || !tematica) {
      return res.status(400).json({ error: 'Título y temática son requeridos.' });
    }

    const ai = getGenAIClient(req.body.userGeminiApiKey);
    const prompt = `Redacta una justificación pedagógica, apasionante y motivadora (entre 180 y 260 palabras) para una Situación de Aprendizaje de Educación Física.
Título: "${titulo}"
Curso/Nivel: ${curso} (${ciclo})
Temática principal: ${tematica}

Instrucciones pedagógicas:
- Justifica la pertinencia de la temática según el desarrollo psicoevolutivo del alumnado de ${curso}.
- Conecta con la relevancia para la vida diaria, el fomento de hábitos saludables, la inclusión DUA y las competencias clave LOMLOE.
- Devuelve únicamente el texto de la justificación redactado en Markdown limpio.`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.7,
      },
    });

    res.json({ justificacion: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error generating justification:', error);
    res.status(500).json({ error: error.message || 'Error al generar la justificación con IA.' });
  }
});

// API 2: Generar Rúbrica de Evaluación
app.post('/api/ai/generate-rubric', async (req, res) => {
  try {
    const { criterios } = req.body;
    if (!criterios || !Array.isArray(criterios) || criterios.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de criterios de evaluación.' });
    }

    const ai = getGenAIClient(req.body.userGeminiApiKey);
    const prompt = `Genera los descriptores de una Rúbrica de Evaluación Formativa para los siguientes Criterios de Evaluación de Educación Física (LOMLOE):
${JSON.stringify(criterios, null, 2)}

Devuelve una respuesta en formato JSON estricto con el siguiente esquema:
[
  {
    "criterioCodigo": "código del criterio",
    "criterioTexto": "texto del criterio",
    "niveles": [
      { "nivel": "Iniciado (1-4)", "descriptor": "descripción del desempeño para nivel iniciado" },
      { "nivel": "En proceso (5-6)", "descriptor": "descripción del desempeño para nivel en proceso" },
      { "nivel": "Conseguido (7-8)", "descriptor": "descripción del desempeño para nivel conseguido" },
      { "nivel": "Excelente (9-10)", "descriptor": "descripción del desempeño para nivel excelente" }
    ]
  }
]`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson(response.text, []);
    res.json({ rubrica: parsed });
  } catch (error: any) {
    console.error('Error generating rubric:', error);
    res.status(500).json({ error: error.message || 'Error al generar la rúbrica.' });
  }
});

// API 3: Generar o Enriquecer Reto / Producto Final
app.post('/api/ai/generate-final-challenge', async (req, res) => {
  try {
    const { titulo, curso, tematica, metodologia } = req.body;
    const ai = getGenAIClient(req.body.userGeminiApiKey);

    const prompt = `Propón un Producto Final o Reto Motor motivador, significativo e inclusivo para culminar una Situación de Aprendizaje de Educación Física.
Título: "${titulo}"
Curso: ${curso}
Temática: ${tematica}
Metodología: ${metodologia}

Proporciona un título para el Reto y una descripción detallada (100-180 palabras) explicando en qué consiste, cómo participa todo el alumnado y cuál es la meta colectiva.
Devuelve en formato JSON: { "tituloReto": "...", "descripcionReto": "..." }`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        responseMimeType: 'application/json',
      },
    });

    const data = safeParseAIJson(response.text, {});
    res.json(data);
  } catch (error: any) {
    console.error('Error generating challenge:', error);
    res.status(500).json({ error: error.message || 'Error al generar el reto final.' });
  }
});

// API 4: Generar Sesiones de Trabajo con Gemini (incluyendo lectura de documentación de Google Drive)
app.post('/api/ai/generate-sessions', async (req, res) => {
  try {
    const {
      numSesiones,
      curso,
      ciclo,
      tematica,
      modeloEstructura,
      criteriosSeleccionados,
      driveDocumentationText,
      userGeminiApiKey,
    } = req.body;

    const ai = getGenAIClient(userGeminiApiKey);

    let documentationInstruction = '';
    if (driveDocumentationText && driveDocumentationText.trim().length > 0) {
      documentationInstruction = `
INSTRUCCIÓN CRÍTICA DE BÚSQUEDA, SELECCIÓN Y COMPLECIÓN DE JUEGOS:
El docente ha proporcionado la siguiente base de conocimiento (documentos PDF, Word, Excel o carpetas de Drive):
--- INICIO DOCUMENTACIÓN APORTADA ---
${driveDocumentationText.slice(0, 15000)}
--- FIN DOCUMENTACIÓN APORTADA ---

JERARQUÍA MÁXIMA Y REGLAS DE SELECCIÓN DE JUEGOS:
1. JUEGOS SELECCIONADOS POR EL DOCENTE (PRIORIDAD ALTA): Si en la documentación previa aparecen referencias con "JUEGO SELECCIONADO POR EL DOCENTE", la IA DEBE incluir prioritariamente esos juegos específicos en las sesiones correspondientes.
2. NO LIMITARSE SOLO A LOS MARCADOS: Los juegos seleccionados manualmente NO deben ser los únicos. La IA DEBE examinar el resto de la documentación aportada (PDF, Word, Excel o Drive) y extraer otros juegos y tareas motrices acordes a la temática ("${tematica}") y ciclo (${curso} - ${ciclo}) para completar la secuencia.
3. SI NO SE MARCAN JUEGOS EN EL BANCO: La IA rastreará automáticamente toda la documentación aportada y seleccionará por sí misma los juegos más idóneos y coherentes con la temática "${tematica}".
4. COMPLEMENTACIÓN CON IA SI FALTA INFORMACIÓN: Si en los documentos aportados no hay suficientes juegos para cubrir todas las fases de las ${numSesiones} sesiones, o si la información de algún juego es esquemática, la IA Gemini DEBE autocompletar e inventar de forma transparente los juegos restantes respetando estrictamente la temática "${tematica}".
5. CUMPLIMENTACIÓN EN 4 SECCIONES: Cada juego (sea extraído o autocompletado por IA) DEBE llevar sus 4 apartados desarrollados (1. Organización Espacial, 2. Roles, 3. Desarrollo y Reglas, 4. Variaciones DUA/Seguridad).`;
    } else {
      documentationInstruction = `Genera actividades y juegos originales, altamente pedagógicos e innovadores para Educación Física, acordes a la temática "${tematica}" y nivel ${curso} (${ciclo}). Si no hay documentación aportada, la IA buscará y seleccionará autónomamente los juegos más adecuados para esta temática y nivel, desarrollando cada uno con sus 4 apartados obligatorios.`;
    }

    const prompt = `Diseña una secuencia didáctica completa de EXACTAMENTE ${numSesiones} SESIONES de Educación Física (60 minutos cada una).
Curso/Nivel: ${curso} (${ciclo})
Temática(s) seleccionada(s): ${tematica}
Modelo de Estructura de Sesión: ${modeloEstructura}
Criterios de Evaluación trabajados: ${JSON.stringify(criteriosSeleccionados || [])}

${documentationInstruction}

INSTRUCCIÓN MANDATORIA Y CRÍTICA PARA CADA UNA DE LAS SESIONES (DESDE LA SESIÓN 1 HASTA LA SESIÓN ${numSesiones}):
Debes generar un array "sesiones" con EXACTAMENTE ${numSesiones} OBJETOS DE SESIÓN (desde numeroSesion 1 hasta numeroSesion ${numSesiones}). NINGUNA SESIÓN PUEDE SER ABREVIADA O RESUMIDA.

REGLA ANTI-REPETICIÓN Y VARIEDAD MOTRIZ MANDATORIA:
Queda ABSOLUTAMENTE PROHIBIDO repetir el mismo juego o el mismo nombre de juego en diferentes sesiones o fases. Cada juego o tarea motriz debe tener un nombre único, ser original y estar directamente alineado con la temática "${tematica}" y el ciclo "${ciclo}".

¡REGLA INDISPENSABLE DE ESTRUCTURA Y CONTENIDO PARA CADA JUEGO EN TODAS LAS SESIONES (1, 2, 3, 4, ..., ${numSesiones})!:
Queda ESTRICTAMENTE PROHIBIDO recortar o resumir las explicaciones a partir de la Sesión 2. TODAS Y CADA UNA DE LAS SESIONES DEBEN CONTENER EXPLICACIONES EXTENSAS Y DETALLADAS (mínimo 180-250 palabras por juego) CON LOS 4 APARTADOS OBLIGATORIOS Y FORMATO CON VIÑETAS (-):

1. ORGANIZACIÓN ESPACIAL Y TERRENO:
- Terreno y delimitación: Distribución exacta en pista/gimnasio (ej. 4 cuadrantes delimitados con conos, zonas de seguridad).
- Ubicación del alumnado y docente: Puntos de inicio, zonas de espera y posición estratégica del profesorado.

2. ROLES DE ALUMNADO Y ASIGNACIONES:
- Roles activos: Atacantes, defensores, comodines, jueces/árbitros o anotadores.
- Rotaciones y DUA: Sistema de rotación periódica y asignación de parejas de apoyo (tutoría entre iguales).

3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:
- Secuencia de juego y normas: Explicación minuciosa y real de CÓMO SE JUEGA a dicho juego desde la señal inicial, dinámica de desplazamientos, pases, reglas específicas de puntuación y objetivo motor. Queda ABSOLUTAMENTE PROHIBIDO poner frases genéricas como "desarrollo motor guiado por el docente".
- Normas y puntuación: Sistema de puntuación, faltas, qué está permitido y qué no.
- Progresión y reto: Evolución de la dificultad del reto motor.

4. VARIACIONES, DUA Y SEGURIDAD:
- Variaciones de dificultad: Al menos 2 progresiones (facilitar/complicar).
- Adaptaciones DUA / NEAE: Medidas específicas de material, espacio o reglas para alumnado con TDAH, TEA, motórico o visual.
- Medidas de seguridad: Distancias con paredes, espalderas y uso adecuado del material.

HILO NARRATIVO Y GAMIFICACIÓN:
Integra un hilo narrativo continuo y gamificado que conecte todas las sesiones de principio a fin si la metodología es Gamificación (ej. misiones, niveles, insignias, mapa del tesoro, historia envolvente). Si es otra metodología, contextualiza los retos y juegos en la temática del título y en el Reto/Producto Final.

INTEGRACIÓN DE COMPETENCIA DIGITAL Y HERRAMIENTAS REALES:
Incorpora el uso de herramientas tecnológicas reales en las sesiones (ej. tabletas digitales para autograbación del movimiento, códigos QR con retos/pistas, apps de análisis técnico, formularios digitales de coevaluación como Google Forms, Plickers o Kahoot).

ESTRUCURA Y FASES DE CADA SESIÓN (60 MINUTOS TOTALES):
Cada sesión DEBE contener exactamente 6 objetos en la lista "fases" (1 Calentamiento + 4 Juegos en la Parte Principal + 1 Vuelta a la Calma):
1. Fase 1: "fase": "Calentamiento / Inicio", "duracionMin": 10
2. Fase 2: "fase": "Parte Principal / Práctica", "duracionMin": 10
3. Fase 3: "fase": "Parte Principal / Práctica", "duracionMin": 10
4. Fase 4: "fase": "Parte Principal / Práctica", "duracionMin": 10
5. Fase 5: "fase": "Parte Principal / Práctica", "duracionMin": 10
6. Fase 6: "fase": "Vuelta a la Calma / Reflexión", "duracionMin": 10

Devuelve una respuesta JSON estricta con este formato:
{
  "porcentajeDrive": 45,
  "porcentajeBancoJuegos": 35,
  "porcentajeIA": 20,
  "fuentesUtilizadas": ["Banco de Juegos Excel: Juegos_Cooperativos.xlsx", "Carpeta Drive: UD_Habilidades"],
  "sesiones": [
    {
      "numeroSesion": 1,
      "titulo": "Título de la sesión 1",
      "objetivoSesion": "Objetivo pedagógico de la sesión 1",
      "materialesTotales": ["Conos", "Pelotas", "Petos"],
      "fases": [
        {
          "fase": "Calentamiento / Inicio",
          "duracionMin": 10,
          "nombreJuego": "Activación Inicial",
          "descripcion": "1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno: Circuito delimitado por conos.\n- Ubicación: Semicírculo de atención.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles: Parejas con rotación activa.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia: Dinámica de movilidad articular e integración temática...\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Modificación de ritmos y apoyos visuales DUA.",
          "materiales": ["Conos"]
        },
        {
          "fase": "Parte Principal / Práctica",
          "duracionMin": 10,
          "nombreJuego": "Juego 1: Actividad Principal",
          "descripcion": "1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: Pista dividida en cuadrantes de 10x10m.\n- Ubicación: 4 grupos de 6 alumnos.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: Atacantes y defensores con petos de colores.\n- Rotaciones: Cambio de rol cada 3 minutos.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: El equipo atacante debe desplazar el móvil...\n- Normas y puntuación: Cada pase completado suma 1 punto...\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Ampliación de la zona de gol o restricción de botes.\n- Adaptaciones DUA: Balón sonoro/contrastado y pareja de tutoría.\n- Seguridad: Mantener 2m de distancia con espalderas.",
          "materiales": ["Pelotas", "Petos"]
        }
      ]
    }
  ]
}`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.75,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson<any>(response.text, {});
    let sesionesRes: any[] = Array.isArray(parsed) ? parsed : (parsed.sesiones || []);

    // Ensure array length matches numSesiones requested with complete 4-part structured game descriptions
    if (sesionesRes.length < numSesiones) {
      console.warn(`[API] Gemini devolvió ${sesionesRes.length} sesiones de las ${numSesiones} solicitadas. Auto-completando sesiones restantes con formato estructurado...`);
      const existingCount = sesionesRes.length;
      for (let i = existingCount + 1; i <= numSesiones; i++) {
        sesionesRes.push({
          numeroSesion: i,
          titulo: `Sesión ${i}: Profundización y Aplicación Práctica (${tematica})`,
          objetivoSesion: `Desarrollar y consolidar las habilidades motrices y conceptos clave de la temática ${tematica}.`,
          materialesTotales: ['Conos', 'Petos', 'Pelotas', 'Picas'],
          fases: [
            {
              fase: 'Calentamiento / Inicio',
              duracionMin: 10,
              nombreJuego: 'Activación Dinámica Temática',
              descripcion: `1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: Pista polideportiva delimitada por 4 conos de esquinas.\n- Ubicación del alumnado: Dispersos de forma homogénea en la zona central.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: Alumnado en carrera libre con 3 dinamizadores de movilidad.\n- Rotaciones DUA: Cambio de dinamizadores cada 2 minutos.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: Movilidad articular activa integrando la temática ${tematica}.\n- Normas y puntuación: Respetar las señales del profesorado y las pautas de ritmo.\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Modificar la velocidad de desplazamiento y sentido del giro.\n- Adaptaciones DUA y Seguridad: Apoyo visual con tarjetas y distancia con paredes.`,
              materiales: ['Conos'],
            },
            {
              fase: 'Parte Principal / Práctica',
              duracionMin: 10,
              nombreJuego: 'Juego 1: Progresión Táctica Cooperativa',
              descripcion: `1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: Dos campos de 15x10m separados por una línea central de conos.\n- Ubicación del alumnado: Dos equipos de 6 alumnos distribuidos en cada campo.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: 4 pasadores activos y 2 receptores móviles.\n- Rotaciones DUA: Rotación obligatoria tras cada consecución de objetivo.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: Pases consecutivos para progresar hasta la zona de meta.\n- Normas y puntuación: Mínimo 3 pases antes de conseguir punto.\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Permitir comodines ofensivos o aumentar el tamaño del móvil.\n- Adaptaciones DUA y Seguridad: Balones de agarre fácil y zona de confort sin oposición.`,
              materiales: ['Pelotas', 'Conos'],
            },
            {
              fase: 'Parte Principal / Práctica',
              duracionMin: 10,
              nombreJuego: 'Juego 2: Reto de Habilidades y Precisión',
              descripcion: `1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: 4 estaciones situadas en las esquinas del pabellón.\n- Ubicación del alumnado: Grupos de 5 alumnos por estación.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: Ejecutor, anotador digital en tableta y recogedor.\n- Rotaciones DUA: Rotación en sentido horario cada 2,5 minutos.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: Superar el circuito técnico acumulando aciertos.\n- Normas y puntuación: Registrar las puntuaciones respetando las reglas de turno.\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Aumentar o reducir la distancia al objetivo.\n- Adaptaciones DUA y Seguridad: Materiales acolchados e instrucciones con pictogramas.`,
              materiales: ['Petos', 'Picas'],
            },
            {
              fase: 'Parte Principal / Práctica',
              duracionMin: 10,
              nombreJuego: 'Juego 3: Situación Real Adaptada',
              descripcion: `1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: Media pista polideportiva con zonas francas.\n- Ubicación del alumnado: Equipos mixtos con petos distintivos.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: Atacantes, defensores y árbitros asistentes con silbato.\n- Rotaciones DUA: Inclusión obligatoria en las jugadas decisivas.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: Simulación de partido o reto global con reglas modificadas.\n- Normas y puntuación: Puntuación doble si intervienen todos los miembros del equipo.\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Modificar las zonas prohibidas o número de toques.\n- Adaptaciones DUA y Seguridad: Petos sensoriales y protecciones laterales.`,
              materiales: ['Pelotas', 'Petos'],
            },
            {
              fase: 'Parte Principal / Práctica',
              duracionMin: 10,
              nombreJuego: 'Juego 4: Desafío de Aplicación y Evaluación',
              descripcion: `1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: Pista completa dividida en 3 calles paralelas.\n- Ubicación del alumnado: Filas organizadas con distancia de seguridad.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: Ejecutores y coevaluadores con lista de cotejo digital/física.\n- Rotaciones DUA: Parejas de coevaluación fija.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: Puesta en práctica de la secuencia motriz completa de la sesión.\n- Normas y puntuación: Autoevaluación del esfuerzo y consecución del reto.\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Elección libre del nivel de reto (fácil, medio, avanzado).\n- Adaptaciones DUA y Seguridad: Tiempos flexibles de ejecución.`,
              materiales: ['Conos', 'Petos'],
            },
            {
              fase: 'Vuelta a la Calma / Reflexión',
              duracionMin: 10,
              nombreJuego: 'Asamblea y Evaluación Formativa',
              descripcion: `1. ORGANIZACIÓN ESPACIAL Y TERRENO:\n- Terreno y delimitación: Semicírculo central en el suelo sobre esterillas.\n- Ubicación del alumnado: Todo el grupo reunido en zona tranquila.\n\n2. ROLES DE ALUMNADO Y ASIGNACIONES:\n- Roles activos: Portavoces de grupo y alumnado reflexionando libremente.\n- Rotaciones DUA: Participación guiada por el docente.\n\n3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:\n- Secuencia de juego: Estiramientos dirigidos y debate reflexivo sobre lo aprendido.\n- Normas y puntuación: Respeto del turno de palabra y coevaluación.\n\n4. VARIACIONES, DUA Y SEGURIDAD:\n- Variaciones: Expresión con escala visual de emojis o tabletas.\n- Adaptaciones DUA y Seguridad: Ambiente relajado sin ruidos estruendosos.`,
              materiales: ['Esterillas'],
            },
          ],
        });
      }
    }

    // Post-process all sessions and ensure all descriptions are formatted with 4-part structure
    sesionesRes.forEach((ses) => {
      if (ses.fases && Array.isArray(ses.fases)) {
        ses.fases.forEach((f: any) => {
          if (f.descripcion) {
            f.descripcion = formatGameDescription(f.descripcion);
          }
        });
      }
    });

    const hasDriveDocs = Boolean(driveDocumentationText && driveDocumentationText.trim().length > 0 && (driveDocumentationText.includes('Google Drive') || driveDocumentationText.includes('PDF') || driveDocumentationText.includes('Ficha') || driveDocumentationText.includes('UD_') || driveDocumentationText.includes('Documento')));
    const hasBancoJuegos = Boolean(driveDocumentationText && (driveDocumentationText.includes('BANCO DE JUEGOS') || driveDocumentationText.includes('Excel') || driveDocumentationText.includes('EXCEL') || driveDocumentationText.includes('.xlsx')));

    let pDrive = typeof parsed.porcentajeDrive === 'number' ? parsed.porcentajeDrive : (hasDriveDocs ? 45 : 0);
    let pBanco = typeof parsed.porcentajeBancoJuegos === 'number' ? parsed.porcentajeBancoJuegos : (hasBancoJuegos ? 35 : 0);
    let pIA = typeof parsed.porcentajeIA === 'number' ? parsed.porcentajeIA : Math.max(10, 100 - pDrive - pBanco);

    res.json({
      sesiones: sesionesRes,
      porcentajeDrive: pDrive,
      porcentajeBancoJuegos: pBanco,
      porcentajeIA: pIA,
      fuentesUtilizadas: parsed.fuentesUtilizadas || [],
    });
  } catch (error: any) {
    console.error('Error generating sessions:', error);
    res.status(500).json({ error: error.message || 'Error al generar las sesiones con IA.' });
  }
});

// API: Enriquecer y Cumplimentar Explicación Completa de un Juego / Actividad
app.post('/api/ai/enrich-game-description', async (req, res) => {
  try {
    const { nombreJuego, descripcion, tematica, curso } = req.body;
    const ai = getGenAIClient(req.body.userGeminiApiKey);

    const prompt = `Actúa como Catedrático Experto en Didáctica de la Educación Física y LOMLOE.
Completa, re-genera o desarrolla en su totalidad el siguiente juego/actividad para Educación Física (${curso || 'Educación Primaria'}, temática: "${tematica || 'General'}"):

Nombre del juego actual: "${nombreJuego || 'Juego o Actividad de EF'}"
Explicación o notas existentes: "${descripcion || ''}"

INSTRUCCIÓN CRÍTICA:
1. Si la explicación existente es breve, escasa, vacía o no tiene datos suficientes para explicar el juego, DEBES SUSTITUIR O REGENERAR EL JUEGO POR COMPLETO proponiendo un juego específico, tradicional o innovador de Educación Física perfecto para la temática "${tematica || 'General'}" y nivel "${curso || 'Primaria'}".
2. Redacta una explicación extensa (180-250 palabras) con todos los detalles pedagógicos y prácticos.
3. Debes incluir OBLIGATORIAMENTE los 4 apartados numerados estructurados con viñetas (-):

1. ORGANIZACIÓN ESPACIAL Y TERRENO:
- Terreno y delimitación: ...
- Ubicación del alumnado y docente: ...

2. ROLES DE ALUMNADO Y ASIGNACIONES:
- Roles activos: ...
- Rotaciones y DUA: ...

3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:
- Secuencia de juego: ...
- Normas y puntuación: ...
- Progresión y reto motor: ...

4. VARIACIONES, DUA Y SEGURIDAD:
- Variaciones de dificultad: ...
- Adaptaciones DUA / NEAE: ...
- Medidas de seguridad: ...

Devuelve un JSON estricto con:
{
  "nombreJuego": "Nombre definitivo del juego (mantener el original o nuevo si se sustituyó por falta de datos)",
  "descripcionEnriquecida": "..."
}`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson<any>(response.text, {});
    const textRes = parsed.descripcionEnriquecida || parsed.descripcion || response.text || '';
    const formatted = formatGameDescription(textRes);
    res.json({
      nombreJuego: parsed.nombreJuego || nombreJuego,
      descripcionEnriquecida: formatted,
    });
  } catch (error: any) {
    console.error('Error enriching game description:', error);
    res.status(500).json({ error: error.message || 'Error al enriquecer la descripción del juego.' });
  }
});

// API: Enriquecer / Autocompletar Sesión Completa con IA
app.post('/api/ai/enrich-full-session', async (req, res) => {
  try {
    const { sesion, tematica, curso } = req.body;
    if (!sesion || !sesion.fases) {
      return res.status(400).json({ error: 'Datos de sesión incompletos.' });
    }

    const ai = getGenAIClient(req.body.userGeminiApiKey);
    const prompt = `Actúa como Catedrático de Educación Física. Analiza y autocompleta/enriquece TODAS las actividades de la siguiente sesión.
Si alguna actividad está vacía, incompleta, sin explicación o con datos escasos, REGENÉRALA O COMPLÉTALA con un juego de Educación Física muy detallado para ${curso || 'Primaria'} y temática "${tematica || 'General'}".

Sesión actual:
Título: "${sesion.titulo || ''}"
Fases/Actividades actuales:
${JSON.stringify(sesion.fases, null, 2)}

REGLA INDISPENSABLE:
Cada una de las fases/actividades devueltas debe tener su "nombreJuego", "duracionMin", "materiales" y su "descripcion" REDACTADA EXTENSAMENTE con los 4 apartados obligatorios:
1. ORGANIZACIÓN ESPACIAL Y TERRENO
2. ROLES DE ALUMNADO Y ASIGNACIONES
3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS
4. VARIACIONES, DUA Y SEGURIDAD

Devuelve un JSON estricto con la estructura de la sesión actualizada:
{
  "titulo": "${sesion.titulo || ''}",
  "objetivoSesion": "${sesion.objetivoSesion || ''}",
  "materialesTotales": ${JSON.stringify(sesion.materialesTotales || [])},
  "fases": [
    {
      "fase": "...",
      "duracionMin": 10,
      "nombreJuego": "...",
      "descripcion": "...",
      "materiales": ["..."]
    }
  ]
}`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson<any>(response.text, {});
    if (parsed.fases && Array.isArray(parsed.fases)) {
      parsed.fases.forEach((f: any) => {
        if (f.descripcion) f.descripcion = formatGameDescription(f.descripcion);
      });
    }

    res.json({ sesionActualizada: parsed });
  } catch (error: any) {
    console.error('Error enriching full session:', error);
    res.status(500).json({ error: error.message || 'Error al enriquecer la sesión completa.' });
  }
});

// API: Lectura y Extracción de Archivos Locales (PDF, Word, Excel, TXT)
app.post('/api/parse-local-file', async (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'Faltan parámetros fileName o base64Data' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const ext = path.extname(fileName).toLowerCase();
    let extractedText = '';

    if (ext === '.pdf') {
      try {
        const parserFn = getPdfParser();
        if (typeof parserFn === 'function') {
          const data = await parserFn(buffer);
          extractedText = data.text || '';
        } else {
          extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑ]/g, ' ');
        }
      } catch (pdfErr) {
        console.error('Error parseando PDF:', pdfErr);
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑ]/g, ' ');
      }
    } else if (ext === '.docx' || ext === '.doc') {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (wordErr) {
        console.error('Error parseando Word:', wordErr);
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑ]/g, ' ');
      }
    } else if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      try {
        const workbook = XLSX.read(buffer, {
          type: 'buffer',
          cellFormula: false,
          cellHTML: false,
          cellStyles: false,
          sheetStubs: false,
        });
        const sheetTexts: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv && csv.trim()) {
            sheetTexts.push(`--- HOJA: ${sheetName} ---\n${csv.trim()}`);
          }
        });
        extractedText = sheetTexts.join('\n\n');
      } catch (excelErr) {
        console.error('Error parseando Excel:', excelErr);
        extractedText = buffer.toString('utf-8');
      }
    } else {
      // Archivo de texto plano / Markdown (.txt, .md, etc.)
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No se pudo extraer texto del archivo seleccionado.' });
    }

    res.json({
      fileName,
      charCount: extractedText.length,
      extractedText: extractedText.trim(),
    });
  } catch (error: any) {
    console.error('Error en /api/parse-local-file:', error);
    res.status(500).json({ error: error.message || 'Error al procesar el archivo local.' });
  }
});

// API 5: Generar Atención a la Diversidad (Adaptaciones NEAE + Pautas DUA)
app.post('/api/ai/generate-diversity', async (req, res) => {
  try {
    const { neaeSeleccionadas, necesidades, sdaContext, tematica, ciclo, curso } = req.body;
    const ai = getGenAIClient(req.body.userGeminiApiKey);

    const activeCases = (neaeSeleccionadas && Array.isArray(neaeSeleccionadas) && neaeSeleccionadas.length > 0)
      ? neaeSeleccionadas
      : (typeof necesidades === 'string' && necesidades.trim() ? necesidades.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const themeStr = tematica || sdaContext?.tematica || 'Educación Física';
    const levelStr = curso || ciclo || sdaContext?.curso || 'Primaria';
    const titleStr = sdaContext?.titulo || 'Situación de Aprendizaje de EF';

    const prompt = `Diseña la propuesta completa de Atención a la Diversidad (Adaptaciones NEAE y Pautas DUA) para una Situación de Aprendizaje de Educación Física.
Contexto:
- Título SdA: "${titleStr}"
- Curso / Nivel: ${levelStr}
- Temática: ${themeStr}
- Alumnado NEAE / Casuísticas seleccionadas: ${JSON.stringify(activeCases)}

Instrucciones:
1. Para cada casuística o necesidad NEAE seleccionada (ej: TDAH, Discapacidad Motora, Discapacidad Visual, Discapacidad Auditiva, TEA, Altas Capacidades, etc.), redacta adaptaciones motrices específicas de Educación Física para materiales, espacio, reglas y pautas docentes.
2. Genera Pautas Universales DUA organizadas según las 3 redes (Compromiso, Representación, Acción/Expresión).

Devuelve una respuesta JSON estricta con esta estructura:
{
  "adaptacionesNEAE": [
    {
      "categoria": "Categoría o Casuística NEAE",
      "materialesYEspacio": "Adaptación concreta de materiales y organización espacial en el gimnasio/pista",
      "reglasYMetodologia": "Flexibilización de reglas, tiempos y apoyos en los juegos",
      "pautasDocente": "Indicaciones clave para el docente y tutores de apoyo"
    }
  ],
  "pautasDUA": [
    {
      "principio": "Pauta I: Proporcionar Múltiples Formas de Compromiso",
      "pautas": ["Estrategia DUA 1 de motivación e implicación", "Estrategia DUA 2", "Estrategia DUA 3"]
    },
    {
      "principio": "Pauta II: Proporcionar Múltiples Formas de Representación",
      "pautas": ["Estrategia DUA 1 de apoyos visuales y sensoriales", "Estrategia DUA 2", "Estrategia DUA 3"]
    },
    {
      "principio": "Pauta III: Proporcionar Múltiples Formas de Acción y Expresión",
      "pautas": ["Estrategia DUA 1 de respuestas variadas y roles flexibles", "Estrategia DUA 2", "Estrategia DUA 3"]
    }
  ]
}`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson<any>(response.text, {});
    res.json({
      adaptaciones: parsed,
      adaptacionesNEAE: parsed.adaptacionesNEAE || [],
      pautasDUA: parsed.pautasDUA || [],
      medidasNeae: (parsed.adaptacionesNEAE || []).map((a: any) => `${a.categoria}: ${a.materialesYEspacio}. ${a.reglasYMetodologia}`),
      pautasDua: (parsed.pautasDUA || []).flatMap((p: any) => p.pautas || []),
    });
  } catch (error: any) {
    console.error('Error generating diversity:', error);
    res.status(500).json({ error: error.message || 'Error al generar la atención a la diversidad.' });
  }
});

// API 5b: Generar Evaluación Inicial Diagnóstica
app.post('/api/ai/generate-initial-eval', async (req, res) => {
  try {
    const { tematica, curso, ciclo } = req.body;
    const ai = getGenAIClient(req.body.userGeminiApiKey);

    const prompt = `Diseña la Evaluación Inicial y Diagnóstica para una SdA de Educación Física (${tematica || 'General'}, ${curso || ciclo || 'Primaria'}).
Devuelve en formato JSON estricto:
{
  "evaluacionInicial": {
    "actividadInicial": "descripción detallada de la sesión o circuito diagnóstico adaptado a la temática ${tematica}",
    "indicadoresObservacion": [
      "Grado de control y ejecución motriz específica",
      "Respeto a las normas de seguridad y juego limpio",
      "Cooperación y toma de decisiones tácticas en grupo"
    ],
    "instrumento": "Escala de observación diagnóstica cualitativa"
  }
}`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson(response.text, {});
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating initial eval:', error);
    res.status(500).json({ error: error.message || 'Error al generar la evaluación inicial.' });
  }
});

// API 6: Generar Instrumentos de Evaluación Formativa seleccionados por el usuario
app.post('/api/ai/generate-evaluation-tools', async (req, res) => {
  try {
    const { selectedInstrumentTypes, tematica, criteriosSeleccionados, curso, ciclo } = req.body;
    const ai = getGenAIClient(req.body.userGeminiApiKey);

    const prompt = `Genera los Instrumentos de Evaluación Formativa seleccionados por el docente para una Situación de Aprendizaje de Educación Física (${curso || ciclo || 'Primaria'}).
Temática(s): ${tematica || 'General'}
Criterios de Evaluación seleccionados: ${JSON.stringify(criteriosSeleccionados || [])}
Tipos de Instrumentos a generar obligatoriamente: ${JSON.stringify(selectedInstrumentTypes || [])}

Instrucciones:
Para cada tipo de instrumento solicitado (ej: Lista de Cotejo, Escala de Observación, Diana de Autoevaluación, Cuaderno de Campo / Registro Anecdótico, Coevaluación), genera su descripción, cómo se aplica en clase y una lista de ítems u observaciones específicos alineados directamente con los criterios de evaluación y la temática.

Devuelve una respuesta JSON estricta con el siguiente formato:
[
  {
    "tipo": "Nombre del Instrumento (ej: Lista de Cotejo)",
    "nombre": "Título del instrumento específico",
    "descripcion": "Explicación del objeto de evaluación",
    "aplicacion": "Cuándo y cómo lo aplica el alumnado o docente durante las clases",
    "itemsOIndicadores": [
      "Ítem o indicador de logro 1",
      "Ítem o indicador de logro 2",
      "Ítem o indicador de logro 3",
      "Ítem o indicador de logro 4"
    ]
  }
]`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseAIJson(response.text, []);
    res.json({ instrumentos: parsed });
  } catch (error: any) {
    console.error('Error generating evaluation tools:', error);
    res.status(500).json({ error: error.message || 'Error al generar los instrumentos de evaluación.' });
  }
});

// Helper to handle Google Drive / OAuth errors gracefully
function handleDriveError(res: express.Response, error: any, defaultMsg: string) {
  console.error(defaultMsg, error);
  const errStr = String(error?.message || error || '');
  const isAuthError =
    error?.status === 401 ||
    error?.code === 401 ||
    error?.response?.status === 401 ||
    errStr.includes('invalid authentication credentials') ||
    errStr.includes('OAuth 2 access token') ||
    errStr.includes('invalid_grant') ||
    errStr.includes('Unauthenticated') ||
    errStr.includes('Invalid Credentials');

  if (isAuthError) {
    return res.status(401).json({
      error: 'Tu sesión de Google Drive ha caducado o las credenciales no son válidas. Por favor, vuelve a iniciar sesión con tu cuenta de Google.',
    });
  }
  return res.status(500).json({ error: error.message || defaultMsg });
}

// API 7: List Google Drive Folders & Files (Browser Endpoint)
app.post('/api/drive/list', async (req, res) => {
  try {
    const { accessToken, folderId = 'root', search = '' } = req.body;
    if (!accessToken) {
      return res.status(401).json({ error: 'OAuth access token es requerido. Por favor, inicia sesión con Google.' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    let query = "trashed = false";
    if (search && search.trim().length > 0) {
      const sanitized = search.trim().replace(/'/g, "\\'");
      query += ` and name contains '${sanitized}'`;
    } else if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, modifiedTime, iconLink, size)',
      pageSize: 50,
      orderBy: 'folder,name',
    });

    const items = (response.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      modifiedTime: f.modifiedTime,
      iconLink: f.iconLink,
      size: f.size,
    }));

    res.json({ items, folderId });
  } catch (error: any) {
    handleDriveError(res, error, 'Error al listar archivos/carpetas de Google Drive.');
  }
});

// API 7b: List Google Drive Folders (Legacy Compatible)
app.post('/api/drive/folders', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(401).json({ error: 'OAuth access token es requerido.' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
      pageSize: 50,
      orderBy: 'name',
    });

    res.json({ folders: response.data.files || [] });
  } catch (error: any) {
    handleDriveError(res, error, 'Error al listar las carpetas de Google Drive.');
  }
});

// API 8: Read files in a Google Drive folder
app.post('/api/drive/read-folder', async (req, res) => {
  try {
    const { accessToken, folderId } = req.body;
    if (!accessToken || !folderId) {
      return res.status(400).json({ error: 'accessToken y folderId son requeridos.' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });

    // List files inside the folder
    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 20,
    });

    const files = filesRes.data.files || [];
    let aggregatedText = '';

    for (const file of files) {
      try {
        if (file.mimeType === 'application/vnd.google-apps.document' && file.id) {
          // Read Google Doc content
          const docRes = await docs.documents.get({ documentId: file.id });
          const content = docRes.data.body?.content || [];
          let docText = '';
          content.forEach((block) => {
            if (block.paragraph) {
              block.paragraph.elements?.forEach((el) => {
                if (el.textRun?.content) docText += el.textRun.content;
              });
            }
          });
          aggregatedText += `\n--- ARCHIVO: ${file.name} ---\n${docText}\n`;
        } else if (file.mimeType === 'text/plain' && file.id) {
          // Export text plain
          const textRes = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'text' });
          aggregatedText += `\n--- ARCHIVO: ${file.name} ---\n${textRes.data}\n`;
        } else if (file.id) {
          // Attempt export for other drive docs
          try {
            const expRes = await drive.files.export({ fileId: file.id, mimeType: 'text/plain' }, { responseType: 'text' });
            aggregatedText += `\n--- ARCHIVO: ${file.name} ---\n${expRes.data}\n`;
          } catch (e) {
            aggregatedText += `\n--- ARCHIVO: ${file.name} (tipo: ${file.mimeType}) ---\n`;
          }
        }
      } catch (fErr) {
        console.warn(`Could not read file ${file.name}:`, fErr);
      }
    }

    res.json({
      fileCount: files.length,
      files: files.map((f) => ({ id: f.id, name: f.name })),
      documentationText: aggregatedText.trim(),
    });
  } catch (error: any) {
    handleDriveError(res, error, 'Error al leer la carpeta de Google Drive.');
  }
});

// API 8b: Read multiple selected folders & individual documents from Google Drive
app.post('/api/drive/read-selected', async (req, res) => {
  try {
    const { accessToken, folderIds = [], fileIds = [] } = req.body;
    if (!accessToken) {
      return res.status(401).json({ error: 'OAuth access token es requerido.' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });

    let aggregatedText = '';
    const readFilesList: { id: string; name: string }[] = [];

    // Helper to read single file
    const readFileContent = async (fileId: string, fileName?: string, mimeType?: string) => {
      try {
        let name = fileName;
        let type = mimeType;
        if (!name || !type) {
          const meta = await drive.files.get({ fileId, fields: 'id, name, mimeType' });
          name = meta.data.name || 'Archivo Sin Nombre';
          type = meta.data.mimeType || '';
        }

        readFilesList.push({ id: fileId, name: name || 'Documento Drive' });

        if (type === 'application/vnd.google-apps.document') {
          const docRes = await docs.documents.get({ documentId: fileId });
          const content = docRes.data.body?.content || [];
          let text = '';
          content.forEach((block) => {
            if (block.paragraph) {
              block.paragraph.elements?.forEach((el) => {
                if (el.textRun?.content) text += el.textRun.content;
              });
            }
          });
          aggregatedText += `\n--- ARCHIVO / FUENTE: ${name} ---\n${text}\n`;
        } else if (type === 'text/plain') {
          const textRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });
          aggregatedText += `\n--- ARCHIVO / FUENTE: ${name} ---\n${textRes.data}\n`;
        } else {
          try {
            const expRes = await drive.files.export({ fileId, mimeType: 'text/plain' }, { responseType: 'text' });
            aggregatedText += `\n--- ARCHIVO / FUENTE: ${name} ---\n${expRes.data}\n`;
          } catch {
            aggregatedText += `\n--- ARCHIVO / FUENTE: ${name} (tipo: ${type}) ---\n`;
          }
        }
      } catch (err) {
        console.warn(`Could not read file ${fileId}:`, err);
      }
    };

    // 1. Read files inside selected folders (prioritizing topic matches)
    for (const fId of folderIds) {
      try {
        const folderMeta = await drive.files.get({ fileId: fId, fields: 'id, name' });
        const filesInFolder = await drive.files.list({
          q: `'${fId}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType)',
          pageSize: 40,
        });
        const items = (filesInFolder.data.files || []).filter(
          (item) => item.id && item.mimeType !== 'application/vnd.google-apps.folder'
        );

        // Sort items so those matching key topics (parkour, equilibrio, saltos, etc.) are prioritized at the top
        const priorityKeywords = ['parkour', 'equilibrio', 'salto', 'desplazamiento', 'deporte', 'atletismo', 'baloncesto', 'fútbol', 'juego', 'ficha', 'unidad'];
        items.sort((a, b) => {
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          const aPriority = priorityKeywords.some((kw) => aName.includes(kw)) ? 1 : 0;
          const bPriority = priorityKeywords.some((kw) => bName.includes(kw)) ? 1 : 0;
          return bPriority - aPriority;
        });

        for (const item of items) {
          if (item.id) {
            await readFileContent(item.id, `[Carpeta ${folderMeta.data.name}] ${item.name}`, item.mimeType);
          }
        }
      } catch (fErr) {
        console.warn(`Error scanning folder ${fId}:`, fErr);
      }
    }

    // 2. Read individual selected files
    for (const fileId of fileIds) {
      await readFileContent(fileId);
    }

    res.json({
      fileCount: readFilesList.length,
      sourceFiles: readFilesList.map((f) => f.name),
      documentationText: aggregatedText.trim(),
    });
  } catch (error: any) {
    handleDriveError(res, error, 'Error al procesar la selección de Google Drive.');
  }
});

// API 9: Create Google Doc directly in user's Drive
app.post('/api/docs/create-doc', async (req, res) => {
  try {
    const { accessToken, sda } = req.body;
    if (!accessToken) {
      return res.status(401).json({ error: 'OAuth access token es requerido.' });
    }
    if (!sda || !sda.titulo) {
      return res.status(400).json({ error: 'Datos de la SdA requeridos.' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const docs = google.docs({ version: 'v1', auth });

    // 1. Create document
    const createRes = await docs.documents.create({
      requestBody: {
        title: `SdA EF - ${sda.titulo} (${sda.curso})`,
      },
    });

    const documentId = createRes.data.documentId;
    if (!documentId) {
      throw new Error('No se pudo obtener la ID del documento creado.');
    }

    // Format full SdA text and build formatting requests for Google Docs API
    interface TextSegment {
      text: string;
      style?: 'title' | 'heading1' | 'heading2' | 'boldLabel';
    }

    const segments: TextSegment[] = [];

    segments.push({ text: `SITUACIÓN DE APRENDIZAJE: ${(sda.titulo || 'EDUCACIÓN FÍSICA').toUpperCase()}\n`, style: 'title' });
    segments.push({ text: `Curso: ${sda.curso} (${sda.ciclo}) | Trimestre: ${sda.trimestre} | Nº Sesiones: ${sda.numSesiones}\n`, style: 'boldLabel' });
    segments.push({ text: `Temáticas: ${sda.tematica}\n\n`, style: 'boldLabel' });

    segments.push({ text: `1. JUSTIFICACIÓN DE LA PROPUESTA\n`, style: 'heading1' });
    segments.push({ text: `${sda.justificacion || 'Sin justificación.'}\n\n` });

    segments.push({ text: `2. CONEXIÓN CURRICULAR (DECRETO 101/2023 ANDALUCÍA)\n`, style: 'heading1' });
    segments.push({ text: `Competencias Específicas: `, style: 'boldLabel' });
    segments.push({ text: `${(sda.competenciasSeleccionadas || []).join(', ')}\n` });
    segments.push({ text: `Criterios de Evaluación: `, style: 'boldLabel' });
    segments.push({ text: `${(sda.criteriosSeleccionados || []).join(', ')}\n\n` });

    segments.push({ text: `3. SABERES BÁSICOS, ODS Y DESCRIPTORES OPERATIVOS\n`, style: 'heading1' });
    segments.push({ text: `Saberes Básicos: `, style: 'boldLabel' });
    segments.push({ text: `${(sda.saberesSeleccionados || []).join(', ')}\n` });
    segments.push({ text: `ODS: `, style: 'boldLabel' });
    segments.push({ text: `${(sda.odsSeleccionados || []).join(', ')}\n` });
    segments.push({ text: `Descriptores Operativos: `, style: 'boldLabel' });
    segments.push({ text: `${(sda.descriptoresOperativos || []).join(', ')}\n\n` });

    segments.push({ text: `4. METODOLOGÍA Y MODELO DE ESTRUCTURA\n`, style: 'heading1' });
    segments.push({ text: `Metodología Activa: `, style: 'boldLabel' });
    segments.push({ text: `${sda.metodologiaActiva || 'Por definir'}\n` });
    segments.push({ text: `Modelo de Estructura: `, style: 'boldLabel' });
    segments.push({ text: `${sda.modeloEstructura}\n\n` });

    segments.push({ text: `5. SECUENCIA DIDÁCTICA DE SESIONES DE TRABAJO (60 MINUTOS)\n`, style: 'heading1' });
    (sda.sesiones || []).forEach((ses: any, idx: number) => {
      segments.push({ text: `--- SESIÓN ${idx + 1}: ${ses.titulo} ---\n`, style: 'heading2' });
      segments.push({ text: `Objetivo: `, style: 'boldLabel' });
      segments.push({ text: `${ses.objetivoSesion || 'Desarrollo motriz y actitudinal'}\n` });
      segments.push({ text: `Materiales: `, style: 'boldLabel' });
      segments.push({ text: `${(ses.materialesTotales || []).join(', ')}\n` });

      (ses.fases || []).forEach((f: any) => {
        segments.push({ text: `  * [${f.fase} - ${f.duracionMin} min] `, style: 'boldLabel' });
        segments.push({ text: `${f.nombreJuego}\n`, style: 'boldLabel' });
        segments.push({ text: `    Descripción: `, style: 'boldLabel' });
        segments.push({ text: `${f.descripcion}\n` });
      });
      segments.push({ text: `\n` });
    });

    segments.push({ text: `6. PRODUCTO FINAL / RETO MOTOR\n`, style: 'heading1' });
    segments.push({ text: `${sda.productoFinal || 'Sin definir.'}\n\n` });

    segments.push({ text: `7. ATENCIÓN A LA DIVERSIDAD (NEAE Y PAUTAS DUA)\n`, style: 'heading1' });
    if (sda.adaptacionesNEAE && sda.adaptacionesNEAE.length > 0) {
      sda.adaptacionesNEAE.forEach((a: any) => {
        const cat = a.categoria || a.casuistica || 'Atención a la Diversidad';
        const mat = a.materialesYEspacio || a.medida || 'Adaptación de materiales, espacios y balones acolchados.';
        const reg = a.reglasYMetodologia || 'Flexibilización de tiempos, normas y apoyos visuales DUA.';
        const pau = a.pautasDocente || 'Refuerzo positivo, clima inclusivo y tutorías de apoyo entre iguales.';
        segments.push({ text: `* Adaptación NEAE [${cat}]:\n`, style: 'boldLabel' });
        segments.push({ text: `  - Materiales y Espacio: ${mat}\n` });
        segments.push({ text: `  - Reglas y Metodología: ${reg}\n` });
        segments.push({ text: `  - Pautas Docente: ${pau}\n` });
      });
    }
    if (sda.pautasDUAGlobales && sda.pautasDUAGlobales.length > 0) {
      sda.pautasDUAGlobales.forEach((d: any) => {
        const titleStr = typeof d === 'string' ? d : d.principio || d.pauta || 'Pauta DUA';
        segments.push({ text: `* Pauta DUA: `, style: 'boldLabel' });
        segments.push({ text: `${titleStr}\n` });
        if (typeof d !== 'string' && Array.isArray(d.pautas)) {
          d.pautas.forEach((p: string) => {
            segments.push({ text: `  - ${p}\n` });
          });
        }
      });
    }
    segments.push({ text: `\n` });

    segments.push({ text: `8. EVALUACIÓN FORMATIVA, DIAGNÓSTICA Y RÚBRICA CRITERIAL\n`, style: 'heading1' });
    if (sda.evaluacionInicial) {
      segments.push({ text: `Evaluación Inicial y Diagnóstica:\n`, style: 'boldLabel' });
      segments.push({ text: `${sda.evaluacionInicial}\n\n` });
    }

    if (sda.rubrica && sda.rubrica.length > 0) {
      segments.push({ text: `Rúbrica de Evaluación Formativa Criterial (4 Niveles):\n`, style: 'boldLabel' });
      sda.rubrica.forEach((r: any) => {
        segments.push({ text: `* Criterio ${r.criterioCodigo || ''}: ${r.criterioTexto || ''}\n`, style: 'heading2' });
        if (Array.isArray(r.niveles)) {
          r.niveles.forEach((n: any) => {
            segments.push({ text: `  [${n.nivel}]: `, style: 'boldLabel' });
            segments.push({ text: `${n.descriptor}\n` });
          });
        }
      });
      segments.push({ text: `\n` });
    }

    if (sda.instrumentosEvaluacion && sda.instrumentosEvaluacion.length > 0) {
      segments.push({ text: `Instrumentos de Evaluación Formativa:\n`, style: 'boldLabel' });
      sda.instrumentosEvaluacion.forEach((inst: any) => {
        segments.push({ text: `* Instrumento: ${inst.tipo || inst.nombre || 'Evaluación Formativa'}\n`, style: 'boldLabel' });
        segments.push({ text: `  Descripción: ${inst.descripcion || 'Registro cualitativo de competencias.'}\n` });
      });
    }

    // Build single text string and formatting ranges
    let fullContent = '';
    const formattingRequests: any[] = [];

    let currentIndex = 1; // Google Docs indices start at 1
    for (const seg of segments) {
      const segText = seg.text;
      const startIndex = currentIndex;
      fullContent += segText;
      currentIndex += segText.length;
      const endIndex = currentIndex;

      if (seg.style === 'title') {
        formattingRequests.push({
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle: {
              bold: true,
              fontSize: { magnitude: 18, unit: 'PT' },
              foregroundColor: { color: { rgbColor: { red: 0.04, green: 0.13, blue: 0.25 } } }, // Navy #0A2240
            },
            fields: 'bold,fontSize,foregroundColor',
          },
        });
      } else if (seg.style === 'heading1') {
        formattingRequests.push({
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle: {
              bold: true,
              fontSize: { magnitude: 13, unit: 'PT' },
              foregroundColor: { color: { rgbColor: { red: 0.04, green: 0.13, blue: 0.25 } } }, // Navy #0A2240
            },
            fields: 'bold,fontSize,foregroundColor',
          },
        });
      } else if (seg.style === 'heading2') {
        formattingRequests.push({
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle: {
              bold: true,
              fontSize: { magnitude: 11, unit: 'PT' },
              foregroundColor: { color: { rgbColor: { red: 0.91, green: 0.36, blue: 0.02 } } }, // Orange #E85D04
            },
            fields: 'bold,fontSize,foregroundColor',
          },
        });
      } else if (seg.style === 'boldLabel') {
        formattingRequests.push({
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle: {
              bold: true,
            },
            fields: 'bold',
          },
        });
      }
    }

    // Apply JUSTIFIED paragraph alignment to full document
    formattingRequests.unshift({
      updateParagraphStyle: {
        range: { startIndex: 1, endIndex: currentIndex },
        paragraphStyle: {
          alignment: 'JUSTIFIED',
          lineSpacing: 115,
        },
        fields: 'alignment,lineSpacing',
      },
    });

    // Insert content and apply styling
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: fullContent,
            },
          },
          ...formattingRequests,
        ],
      },
    });

    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    res.json({ docId: documentId, docUrl });
  } catch (error: any) {
    handleDriveError(res, error, 'Error al crear el documento en Google Docs.');
  }
});

// API: Generar Estrategia de Evaluación Inicial / Diagnóstica
app.post('/api/ai/generate-initial-eval', async (req, res) => {
  try {
    const { tematica, curso, criteriosSeleccionados } = req.body;

    const ai = getGenAIClient(req.body.userGeminiApiKey);
    const prompt = `Redacta una estrategia de Evaluación Inicial / Diagnóstica para una Situación de Aprendizaje de Educación Física en Primaria (${curso}):
Temática: "${tematica || 'Educación Física'}"
Criterios de Evaluación: ${JSON.stringify(criteriosSeleccionados || [])}

Escribe entre 80 y 150 palabras explicando:
- Una prueba inicial o juego diagnóstico para valorar las competencias y contenidos previos del alumnado.
- Qué indicadores clave observará el docente durante la primera sesión.
- Cómo se registrarán de forma ágil las necesidades y niveles de partida del alumnado.`;

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EF,
        temperature: 0.7,
      },
    });

    res.json({ evaluacionInicial: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error generating initial evaluation:', error);
    res.status(500).json({ error: error.message || 'Error al generar la evaluación inicial con IA.' });
  }
});

// API: Persistencia de SdAs del Usuario por Email (Servidor y Disco)
const USER_SDAS_FILE = path.join(process.cwd(), 'user_sdas.json');

function readUserSdasFromFile(): Record<string, any[]> {
  try {
    if (fs.existsSync(USER_SDAS_FILE)) {
      const content = fs.readFileSync(USER_SDAS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading user_sdas.json:', e);
  }
  return {};
}

function writeUserSdasToFile(data: Record<string, any[]>) {
  try {
    fs.writeFileSync(USER_SDAS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing user_sdas.json:', e);
  }
}

app.get('/api/sdas', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) {
    return res.json({ sdas: [] });
  }
  const db = readUserSdasFromFile();
  const userSdas = db[email] || [];
  res.json({ sdas: userSdas });
});

app.post('/api/sdas', (req, res) => {
  const { email, sda } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !sda || !sda.id) {
    return res.status(400).json({ error: 'Email y SdA válidos son obligatorios.' });
  }
  const db = readUserSdasFromFile();
  const list = db[cleanEmail] || [];
  const filtered = list.filter((s: any) => s.id !== sda.id);
  db[cleanEmail] = [sda, ...filtered];
  writeUserSdasToFile(db);
  res.json({ success: true, sdas: db[cleanEmail] });
});

app.delete('/api/sdas/:id', (req, res) => {
  const idToDelete = req.params.id;
  const cleanEmail = String(req.query.email || req.body?.email || '').trim().toLowerCase();
  if (!cleanEmail || !idToDelete) {
    return res.status(400).json({ error: 'Email e ID son requeridos.' });
  }
  const db = readUserSdasFromFile();
  const list = db[cleanEmail] || [];
  db[cleanEmail] = list.filter((s: any) => s.id !== idToDelete);
  writeUserSdasToFile(db);
  res.json({ success: true, sdas: db[cleanEmail] });
});

// Boot server and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        etag: false,
        lastModified: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor SdA Educación Física corriendo en http://localhost:${PORT}`);
  });
}

startServer();
