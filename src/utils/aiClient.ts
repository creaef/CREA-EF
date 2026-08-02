import { generarSesionesAuto } from './sdaGenerator';

// Instruction de Sistema Oficial para IA de Educación Física
const SYSTEM_INSTRUCTION_EF = `Eres un catedrático experto en Didáctica de la Educación Física y especialista en desarrollo de Situaciones de Aprendizaje (SdA) alineadas con la LOMLOE y el Decreto 101/2023.

REGLAS DE ORO OBLIGATORIAS:
1. Redacta contenido pedagógicamente rico, específico, apasionante y libre de estereotipos o frases vacías.
2. REGLA SOBRE LA TEMÁTICA REGIONAL (CON EXCEPCIÓN EXPLÍCITA): Por norma general, QUEDA PROHIBIDO forzar referencias a la cultura andaluza o folclore en juegos genéricos (ej. baloncesto, parkour, atletismo, juegos cooperativos). EXCEPCIÓN OBLIGATORIA: Si la temática indicada por el docente o la documentación adjunta señala explícitamente la cultura o contenidos andaluces (ej. "Juegos Populares y Tradicionales de Andalucía", "Día de Andalucía", "Danzas Andaluzas", "Patrimonio Motriz Andaluz"), EN ESE CASO SÍ SE DEBEN adaptar, diseñar y buscar juegos y actividades claramente relacionados con la temática andaluza.
3. Si el docente adjunta documentación (Word, PDF, Excel o Google Drive), DEBES LEERLA ATENTAMENTE e integrar las propuestas de los archivos en la parte principal de las sesiones.
4. Garantiza la inclusión real aplicando los principios del Diseño Universal para el Aprendizaje (DUA) y ofreciendo variaciones adaptadas concretas para alumnado con necesidades específicas (NEAE).`;

// Función central para invocar la API REST de Google Gemini directamente desde el navegador
async function callGeminiREST(
  prompt: string,
  systemInstruction?: string,
  responseMimeType?: string
): Promise<string> {
  let apiKey =
    (typeof localStorage !== 'undefined' && localStorage.getItem('user_gemini_api_key')?.trim()) ||
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.startsWith('AQ.') || apiKey.includes('PLACEHOLDER')) {
    apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  }

  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    throw new Error('API_KEY_INVALID');
  }

  const modelsToTry = ['gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      if (responseMimeType) {
        payload.generationConfig = { responseMimeType };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim()) {
          return candidateText.trim();
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`[Gemini REST ${model}] HTTP ${res.status}:`, errJson);
        lastError = new Error(errJson.error?.message || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(`[Gemini REST ${model}] Error:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Error de conexión con la API de Gemini');
}

export async function fetchApiJson<T>(
  url: string,
  options: RequestInit,
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return data as T;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData?.error) {
        const errMsg = typeof errData.error === 'string' ? errData.error : errData.error.message;
        if (errMsg) throw new Error(errMsg);
      }
    }
  } catch (err: any) {
    if (err && err.message && (err.message.includes('🔑') || err.message.includes('API key') || err.message.includes('Clave'))) {
      throw err;
    }
    console.warn(`[fetchApiJson ${url}] Backend falló, ejecutando fallback cliente:`, err);
  }

  return await fallbackFn();
}

function getUserApiKey(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  const key = localStorage.getItem('user_gemini_api_key');
  return key && key.trim() ? key.trim() : undefined;
}

function getGoogleAccessToken(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  const token = localStorage.getItem('sda_drive_access_token') || localStorage.getItem('google_access_token');
  return token && token.trim() ? token.trim() : undefined;
}

// 1. Generar Justificación de la SdA con IA Gemini Real
export async function generateJustificationApi(params: {
  titulo: string;
  curso: string;
  ciclo: string;
  tematica: string;
}): Promise<string> {
  return fetchApiJson<{ justificacion: string }>(
    '/api/ai/generate-justification',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Redacta una justificación pedagógica, apasionante y motivadora (entre 180 y 260 palabras) para una Situación de Aprendizaje de Educación Física.
Título: "${params.titulo}"
Curso/Nivel: ${params.curso} (${params.ciclo})
Temática principal: ${params.tematica}

Instrucciones pedagógicas de alta calidad:
1. Explica la oportunidad motivadora de la temática para despertar la ilusión del alumnado de ${params.curso}.
2. Detalla los aspectos psicoevolutivos (8-9 años en 3º Primaria): esquema corporal, desplazamientos, saltos, equilibrio dinámico/estático y autorregulación motriz.
3. Justifica el sentido funcional del aprendizaje: hábitos saludables, higiene postural y prevención de accidentes en la vida diaria.
4. Fundamenta en el marco DUA y el Decreto 101/2023 de Andalucía, garantizando equidad e inclusión para todo el alumnado (equilibristas, acróbatas, malabaristas u otros roles).
5. Destaca valores de cooperación, coeducación, gestión emocional y respeto a la diversidad en un entorno motivador.
6. Devuelve únicamente el texto de la justificación redactado en Markdown limpio con párrafos fluidos.`;

        const text = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF);
        if (text) return { justificacion: text };
      } catch (e) {
        console.warn('Invocación Gemini REST para justificación falló:', e);
      }

      return {
        justificacion: `La temática de **${params.tematica}** para **${params.curso}** despierta la motivación intrínseca y el interés del alumnado en una etapa evolutiva idónea para consolidar las habilidades motrices básicas, afinar el esquema corporal y desafiar el equilibrio dinámico y estático.

A través de esta propuesta pedagógica, el aprendizaje cobra un sentido funcional: el control corporal se transfiere a la vida cotidiana mejorando la higiene postural, la prevención de accidentes y el afianzamiento de hábitos saludables y activos.

Alineada con el Decreto 101/2023 de Andalucía y fundamentada en el marco DUA, esta propuesta garantiza la inclusión y la equidad ofreciendo múltiples vías de ejecución y expresión, donde cada estudiante encuentra su propio reto adaptado. Así, en la pista del gimnasio, se vivencian valores esenciales como la cooperación, la coeducación, la gestión emocional y el respeto a la diversidad.`,
      };
    }
  ).then((res) => (res && res.justificacion) || '');
}

// 2. Generar Rúbrica de Evaluación Formativa con IA Gemini Real
export async function generateRubricApi(criterios: any[]): Promise<any[]> {
  return fetchApiJson<{ rubrica: any[] }>(
    '/api/ai/generate-rubric',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criterios, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Genera los descriptores graduados para una Rúbrica de Evaluación Formativa Criterial (4 Niveles: Iniciado, En proceso, Conseguido, Excelente) para los siguientes Criterios de Evaluación de Educación Física:
${JSON.stringify(criterios, null, 2)}

Devuelve una respuesta JSON estricta en el siguiente formato:
[
  {
    "criterioCodigo": "código del criterio",
    "criterioTexto": "texto del criterio",
    "niveles": [
      { "nivel": "Iniciado (1-4)", "descriptor": "descripción detallada del desempeño para nivel iniciado" },
      { "nivel": "En proceso (5-6)", "descriptor": "descripción detallada del desempeño para nivel en proceso" },
      { "nivel": "Conseguido (7-8)", "descriptor": "descripción detallada del desempeño para nivel conseguido" },
      { "nivel": "Excelente (9-10)", "descriptor": "descripción detallada del desempeño para nivel excelente" }
    ]
  }
]`;

        const jsonText = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF, 'application/json');
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return { rubrica: parsed };
        }
      } catch (e) {
        console.warn('Invocación Gemini REST para rúbrica falló:', e);
      }

      const rubricaFallback = criterios.map((crit: any) => ({
        criterioCodigo: crit.codigo || crit.criterioCodigo || 'EF.1',
        criterioTexto: crit.texto || crit.criterioTexto || 'Criterio de evaluación de EF',
        niveles: [
          { nivel: 'Iniciado (1-4)', descriptor: 'Muestra dificultades iniciales en la aplicación de las habilidades requeridas y precisa ayuda continua.' },
          { nivel: 'En proceso (5-6)', descriptor: 'Aplica las habilidades motrices y conceptos básicos de forma parcial o con apoyo ocasional.' },
          { nivel: 'Conseguido (7-8)', descriptor: 'Demuestra un dominio autónomo y adecuado de las competencias motrices y colaborativas.' },
          { nivel: 'Excelente (9-10)', descriptor: 'Demuestra un desempeño sobresaliente, proponiendo soluciones creativas y apoyando al grupo.' },
        ],
      }));
      return { rubrica: rubricaFallback };
    }
  ).then((res) => (res && res.rubrica) || []);
}

// 3. Generar Evaluación Inicial con IA Gemini Real
export async function generateInitialEvalApi(params: { tematica: string; curso: string }): Promise<any> {
  return fetchApiJson<{ evaluacionInicial: any }>(
    '/api/ai/generate-initial-eval',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Diseña la Evaluación Inicial y Diagnóstica para una SdA de Educación Física (${params.tematica}, ${params.curso}).
Proporciona en formato JSON:
{
  "actividadInicial": "descripción detallada de la sesión o circuito diagnóstico",
  "indicadoresObservacion": ["indicador 1", "indicador 2", "indicador 3", "indicador 4"],
  "instrumento": "herramienta de registro recomendada"
}`;

        const jsonText = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF, 'application/json');
        if (jsonText) {
          return { evaluacionInicial: JSON.parse(jsonText) };
        }
      } catch (e) {}

      return {
        evaluacionInicial: {
          actividadInicial: `Circuito diagnósticos de habilidades motrices básicas y toma de contacto con el material de ${params.tematica}.`,
          indicadoresObservacion: [
            'Grado de coordinación y control en ejecuciones individuales.',
            'Respeto por las normas de seguridad y turno de participación.',
            'Disposición al trabajo en equipo y toma de decisiones.',
          ],
          instrumento: 'Escala de observación diagnóstica cualitativa (3 niveles).',
        },
      };
    }
  ).then((res) => (res && res.evaluacionInicial) || {});
}

// 4. Generar Adaptaciones de Diversidad (DUA / NEAE) con IA Gemini Real
export async function generateDiversityApi(params: {
  tematica: string;
  ciclo: string;
  necesidades?: string;
  neaeSeleccionadas?: string[];
  sdaContext?: any;
}): Promise<any> {
  return fetchApiJson<any>(
    '/api/ai/generate-diversity',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Diseña las medidas de Atención a la Diversidad (DUA y NEAE) para Educación Física (${params.tematica}, ${params.ciclo}).
Necesidades especificadas: ${params.necesidades || (params.neaeSeleccionadas ? params.neaeSeleccionadas.join(', ') : 'Diversidad general en el aula (TDAH, motórica, auditiva, visual, TEA)')}.

Devuelve en JSON:
{
  "pautasDua": [
    "Pauta 1 de representación y accesibilidad visual/práctica",
    "Pauta 2 de acción y expresión motriz ajustada",
    "Pauta 3 de implicación, roles e incentivos cooperativos"
  ],
  "medidasNeae": [
    "Medida concreta 1 para adaptación de materiales y terreno",
    "Medida concreta 2 para flexibilización de reglas y metodologías",
    "Medida concreta 3 para pautas docentes, mediación y tutores de apoyo"
  ]
}`;

        const jsonText = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF, 'application/json');
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return { adaptaciones: parsed, adaptacionesNEAE: parsed.adaptacionesNEAE || [], pautasDUA: parsed.pautasDUA || [] };
        }
      } catch (e) {}

      return {
        adaptaciones: {
          pautasDua: [
            'Proporcionar múltiples medios de representación: apoyos visuales, pictogramas y demostraciones fidedignas antes de cada juego.',
            'Ofrecer opciones de graduación en la dificultad motriz (tamaño de materiales, distancias y zonas de confort).',
            'Fomentar la implicación mediante la elección libre de roles (jugador, estratega, anotador) y refuerzo positivo.',
          ],
          medidasNeae: [
            'Adaptación de materiales: balones sonoros/espuma de alta visibilidad y agarres adaptados.',
            'Modificación de reglas: eximir de límites temporales o botes y establecer tutorías de ayuda entre iguales.',
            'Organización del espacio: delimitación clara con conos de alto contraste y reducción de distancias exigentes.',
          ],
        },
      };
    }
  ).then((res) => (res && (res.adaptaciones || res)) || {});
}

// 5. Generar Reto Final Apasionante con IA Gemini Real
export async function generateFinalChallengeApi(params: {
  tematica: string;
  curso: string;
  metodologia?: string;
  sesionesText?: string;
}): Promise<string> {
  return fetchApiJson<{ retoFinal: string }>(
    '/api/ai/generate-final-challenge',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Diseña un Reto Final o Producto Motor apasionante, inclusivo y significativo (entre 160 y 230 palabras) para culminar esta SdA de Educación Física.
Temática: ${params.tematica}
Curso: ${params.curso}
Metodología: ${params.metodologia || 'Aprendizaje Basado en Retos / Metodologías Activas'}
Sesiones diseñadas de referencia:
${params.sesionesText || 'Secuencia de sesiones de aprendizaje motriz.'}

Instrucciones pedagógicas:
1. Propón un título motivador entrecomillado para el Reto Final (ej. Reto Final "El Gran Gala de Circo de 3º: ¡El Espectáculo de la Diversidad!").
2. Detalla cómo el alumnado se organiza en pequeñas compañías o equipos cooperativos para diseñar su muestra/estación.
3. Explica cómo cada estudiante selecciona un rol acorde a sus habilidades asegurando protagonismo sin competitividad (acróbatas, equilibristas, malabaristas, directores de pista, jueces).
4. Integra las adaptaciones DUA (distintos niveles de estabilidad, apoyos visuales) y la celebración final ante la comunidad educativa.`;

        const text = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF);
        if (text) return { retoFinal: text };
      } catch (e) {
        console.warn('Invocación Gemini REST para reto final falló:', e);
      }

      return {
        retoFinal: `Reto Final "Gran Festival Coeducativo de ${params.tematica}": Para cerrar nuestra SdA, el alumnado de ${params.curso} se organizará en equipos cooperativos para diseñar y presentar estaciones de reto motor. Cada grupo seleccionará roles activos (acróbatas, equilibristas, organizadores) adaptados a sus capacidades, asegurando que todos tengan un papel protagonista. La meta colectiva es realizar una exhibición inclusiva ante la comunidad educativa donde prime el Fair Play y el aprendizaje compartido.`,
      };
    }
  ).then((res) => (res && res.retoFinal) || '');
}

// 6. Generar Sesiones de Trabajo con IA Gemini Real (4 juegos por Parte Principal)
export async function generateSessionsApi(params: {
  numSesiones: number;
  ciclo: any;
  curso?: any;
  tematica: any;
  modeloEstructura: any;
  criteriosCodigos: string[];
  driveDocumentationText?: string;
}): Promise<any[]> {
  return fetchApiJson<{ sesiones: any[] }>(
    '/api/ai/generate-sessions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        let docContextPrompt = '';
        if (params.driveDocumentationText && params.driveDocumentationText.trim().length > 0) {
          docContextPrompt = `
INSTRUCCIÓN CRÍTICA DE SELECCIÓN Y COMPLECIÓN DE JUEGOS CON DOCUMENTACIÓN:
El docente ha adjuntado los siguientes archivos y guías didácticas (Word, PDF, Excel o Drive):
--- INICIO DOCUMENTACIÓN ADJUNTA ---
${params.driveDocumentationText.slice(0, 18000)}
--- FIN DOCUMENTACIÓN ADJUNTA ---

JERARQUÍA OBLIGATORIA DE SELECCIÓN:
1. Incluye prioritariamente los juegos etiquetados como "JUEGO SELECCIONADO POR EL DOCENTE".
2. NO te limites solo a los juegos marcados: examina toda la documentación adjunta y añade otros juegos relevantes que encajen con la temática "${params.tematica}".
3. Si el docente no marcó juegos en el banco, busca y selecciona automáticamente en la documentación aportada los juegos más adecuados para la temática.
4. Si la documentación no alcanza para cubrir todas las fases de las ${params.numSesiones} sesiones, autocompleta transparente con IA Gemini creando juegos acordes a la temática.`;
        }

        const prompt = `Diseña una secuencia didáctica completa de EXACTAMENTE ${params.numSesiones} SESIONES de Educación Física (60 min cada una).
Curso/Nivel: ${params.curso || '3º Primaria'} (${params.ciclo})
Temática: ${params.tematica}
Modelo de Estructura de Sesión: ${params.modeloEstructura}
Criterios de Evaluación: ${JSON.stringify(params.criteriosCodigos || [])}

${docContextPrompt}

ESTRUCTURA MÍNIMA OBLIGATORIA PARA CADA SESIÓN:
- Fase 1: Calentamiento / Conexión (10 min) -> 1 Juego
- Fase 2: PARTE PRINCIPAL / EXPLORACIÓN / ESTACIONES -> OBLIGATORIAMENTE EXACTAMENTE 4 JUEGOS O TAREAS MOTRICES DISTINTAS (Tarea 1/4, Tarea 2/4, Tarea 3/4, Tarea 4/4) (10 min cada una = 40 min total)
- Fase 3: Vuelta a la Calma / Reflexión (10 min) -> 1 Juego

Para CADA JUEGO, la descripción DEBE ESTRUCTURARSE CON ESTAS 4 SECCIONES EN TEXTO CON VIÑETAS (-):
1. ORGANIZACIÓN ESPACIAL Y TERRENO
2. ROLES DE ALUMNADO Y ASIGNACIONES
3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS
4. VARIACIONES, DUA Y SEGURIDAD

Devuelve en JSON estricto:
[
  {
    "numero": 1,
    "titulo": "Título motivador de la sesión",
    "objetivoSesion": "Objetivo pedagógico",
    "recursosMateriales": ["conos", "balones"],
    "fases": [
      {
        "fase": "Fase Inicial / Calentamiento",
        "duracionMin": 10,
        "nombreJuego": "Nombre Juego 1",
        "descripcion": "Descripción estructurada en 4 secciones...",
        "materiales": ["material 1"],
        "adaptacionDUA": "medida inclusiva"
      },
      {
        "fase": "Parte Principal (Tarea 1/4)",
        "duracionMin": 10,
        "nombreJuego": "Nombre Juego Principal 1",
        "descripcion": "Descripción estructurada en 4 secciones...",
        "materiales": ["material 1"],
        "adaptacionDUA": "medida inclusiva"
      },
      {
        "fase": "Parte Principal (Tarea 2/4)",
        "duracionMin": 10,
        "nombreJuego": "Nombre Juego Principal 2",
        "descripcion": "Descripción estructurada en 4 secciones...",
        "materiales": ["material 1"],
        "adaptacionDUA": "medida inclusiva"
      },
      {
        "fase": "Parte Principal (Tarea 3/4)",
        "duracionMin": 10,
        "nombreJuego": "Nombre Juego Principal 3",
        "descripcion": "Descripción estructurada en 4 secciones...",
        "materiales": ["material 1"],
        "adaptacionDUA": "medida inclusiva"
      },
      {
        "fase": "Parte Principal (Tarea 4/4)",
        "duracionMin": 10,
        "nombreJuego": "Nombre Juego Principal 4",
        "descripcion": "Descripción estructurada en 4 secciones...",
        "materiales": ["material 1"],
        "adaptacionDUA": "medida inclusiva"
      },
      {
        "fase": "Vuelta a la Calma y Reflexión",
        "duracionMin": 10,
        "nombreJuego": "Nombre Juego Cierre",
        "descripcion": "Descripción estructurada en 4 secciones...",
        "materiales": ["material 1"],
        "adaptacionDUA": "medida inclusiva"
      }
    ]
  }
]`;

        const jsonText = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF, 'application/json');
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const arraySesiones = Array.isArray(parsed) ? parsed : parsed.sesiones || parsed.sesion;
          if (Array.isArray(arraySesiones) && arraySesiones.length > 0) {
            return { sesiones: arraySesiones };
          }
        }
      } catch (e) {
        console.warn('Invocación Gemini REST para sesiones falló:', e);
      }

      const fallback = generarSesionesAuto(
        params.numSesiones || 6,
        params.ciclo || 'Primer Ciclo',
        params.tematica || 'Juegos Motores',
        params.modeloEstructura || 'Modelo 1: Tradicional',
        params.criteriosCodigos || []
      );
      return { sesiones: fallback };
    }
  ).then((res) => (res && res.sesiones) || []);
}

// 7. Enriquecer Sesión Completa con IA Gemini Real
export async function enrichFullSessionApi(params: {
  sesion: any;
  ciclo: any;
  tematica: any;
}): Promise<any> {
  return fetchApiJson<{ sesion: any }>(
    '/api/ai/enrich-full-session',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Enriquece y desarrolla minuciosamente la siguiente sesión de Educación Física (${params.tematica}, ${params.ciclo}):
${JSON.stringify(params.sesion, null, 2)}

Cada juego debe contener las 4 secciones obligatorias (1. Organización Espacial, 2. Roles de Alumnado, 3. Desarrollo y Reglas, 4. Variaciones DUA/Seguridad).
Devuelve el objeto de la sesión enriquecido en formato JSON.`;

        const jsonText = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF, 'application/json');
        if (jsonText) {
          return { sesion: JSON.parse(jsonText) };
        }
      } catch (e) {}

      return { sesion: params.sesion };
    }
  ).then((res) => (res && res.sesion) || {});
}

// 8. Generar Herramientas de Evaluación con IA Gemini Real
export async function generateEvaluationToolsApi(params: {
  tematica: string;
  ciclo: string;
  selectedInstrumentTypes?: string[];
  criteriosSeleccionados?: string[];
  curso?: string;
}): Promise<any[]> {
  return fetchApiJson<{ herramientas: any[] }>(
    '/api/ai/generate-evaluation-tools',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userGeminiApiKey: getUserApiKey(), googleAccessToken: getGoogleAccessToken() }),
    },
    async () => {
      try {
        const prompt = `Diseña Instrumentos de Evaluación Formativa para Educación Física (${params.tematica}, ${params.curso || params.ciclo}).
Tipos de instrumentos a incluir: ${JSON.stringify(params.selectedInstrumentTypes || ['Rúbrica', 'Lista de Cotejo', 'Diana de Autoevaluación'])}
Criterios trabajados: ${JSON.stringify(params.criteriosSeleccionados || [])}

Devuelve en JSON:
[
  { "nombre": "...", "tipo": "...", "descripcion": "...", "aplicacion": "...", "itemsOIndicadores": ["...", "..."] }
]`;

        const jsonText = await callGeminiREST(prompt, SYSTEM_INSTRUCTION_EF, 'application/json');
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const arrayTools = Array.isArray(parsed) ? parsed : (parsed.herramientas || []);
          return { herramientas: arrayTools };
        }
      } catch (e) {}

      return {
        herramientas: [
          { nombre: 'Rúbrica Analítica DUA Criterial', tipo: 'Heteroevaluación', descripcion: 'Evaluación cualitativa de las competencias específicas y criterios de la LOMLOE.' },
          { nombre: 'Diana de Autoevaluación Motriz', tipo: 'Autoevaluación', descripcion: 'Reflexión visual e individual sobre el esfuerzo, actitud y aprendizaje.' },
          { nombre: 'Registro de Coevaluación en Parejas', tipo: 'Coevaluación', descripcion: 'Feedback respetuoso y colaborativo entre compañeros durante los juegos.' },
        ],
      };
    }
  ).then((res) => (res && res.herramientas) || []);
}
