export type Ciclo = 'Primer Ciclo' | 'Segundo Ciclo' | 'Tercer Ciclo';
export type Curso = '1º Primaria' | '2º Primaria' | '3º Primaria' | '4º Primaria' | '5º Primaria' | '6º Primaria';
export type Trimestre = '1º Trimestre' | '2º Trimestre' | '3º Trimestre';

export type TematicaEF = string;

export interface CompetenciaEspecifica {
  id: string; // e.g. "CE.EF.1"
  numero: number;
  nombre: string;
  descripcion: string;
}

export interface CriterioEvaluacion {
  id: string; // e.g. "1.1.a" or "EFI.1.A.1"
  codigo: string;
  ciclo: Ciclo;
  cursoRef?: string;
  competenciaId: string;
  descripcion: string;
}

export interface SaberBasico {
  codigo: string;
  bloque: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  bloqueNombre: string;
  ciclo: Ciclo;
  descripcion: string;
}

export interface MetodologiaActiva {
  id: string;
  nombre: string;
  descripcion: string;
  ejemploAplicacion: string;
}

export type ModeloEstructuraSesion = 'Modelo 1: Tradicional' | 'Modelo 2: Competencial' | 'Modelo 3: Metodologías Activas' | '';

export interface JuegoActividadDB {
  id: string;
  nombre: string;
  tematica: TematicaEF;
  ciclo: Ciclo | 'Todos';
  conexionCurricular: string;
  criteriosEvaluacion: string[];
  faseIdeal: 'Inicial' | 'Principal' | 'Vuelta a la Calma';
  descripcion: string;
  atencionDiversidad: string;
  materiales: string[];
}

export interface ActividadEnSesion {
  fase: string; // e.g. 'Calentamiento / Inicio', 'Parte Principal / Práctica', 'Vuelta a la Calma'
  duracionMin: number;
  juegoId?: string;
  nombreJuego: string;
  descripcion: string;
  materiales: string[];
  adaptacionDUA?: string;
  esquemaGrafico?: string; // Descripción o configuración del esquema visual de organización espacial
}

export interface SesionTrabajo {
  numeroSesion: number;
  titulo: string;
  objetivoSesion: string;
  fases: ActividadEnSesion[];
  criteriosTrabajados: string[];
  materialesTotales: string[];
}

export interface AdaptacionNEAE {
  categoria: string;
  materialesYEspacio?: string;
  reglasYMetodologia?: string;
  pautasDocente?: string;
  material?: string;
  espacio?: string;
}

export interface PautaDUA {
  principio: string;
  pautas: string[];
}

export interface NivelRubrica {
  nivel: 'Iniciado (1-4)' | 'En proceso (5-6)' | 'Conseguido (7-8)' | 'Excelente (9-10)';
  descriptor: string;
}

export interface ElementoRubrica {
  criterioCodigo: string;
  criterioTexto: string;
  niveles: NivelRubrica[];
}

export interface InstrumentoEvaluacion {
  tipo: string;
  nombre?: string;
  descripcion: string;
  aplicacion: string;
  itemsOIndicadores?: string[];
}

/**
 * Formatea la descripción del desarrollo de un juego asegurando
 * que cada uno de los 4 apartados numerados (1. ORGANIZACIÓN, 2. ROLES, 3. DESARROLLO, 4. VARIACIONES)
 * esté obligatoriamente presente sin duplicidades y estructurado con saltos de línea claros.
 */
export function formatGameDescription(text: string): string {
  if (!text) return '';
  let str = text.trim();

  // Clean HTML tags & markdown bold formatting that corrupt rendering
  str = str.replace(/<\/?(?:b|strong)>/gi, '');
  str = str.replace(/\*\*/g, '');

  const HEADERS = {
    h1: '1. ORGANIZACIÓN ESPACIAL Y TERRENO:',
    h2: '2. ROLES DE ALUMNADO Y ASIGNACIONES:',
    h3: '3. DESARROLLO PASO A PASO Y REGLAS COMPLETAS:',
    h4: '4. VARIACIONES, DUA Y SEGURIDAD:',
  };

  const has1 = /1\.\s*ORGANIZACI[OÓ]N/i.test(str);
  const has2 = /2\.\s*ROLES/i.test(str);
  const has3 = /3\.\s*DESARROLLO/i.test(str);
  const has4 = /4\.\s*VARIACIONES/i.test(str);

  if (!has1 && !has2 && !has3 && !has4) {
    return `${HEADERS.h1}
- Terreno y delimitación: Pista polideportiva o gimnasio delimitado por conos en zonas de trabajo equilibradas y seguras.
- Ubicación del alumnado: Dispersos de forma homogénea o distribuidos en subgrupos heterogéneos según la fase del juego.

${HEADERS.h2}
- Roles activos: Asignación clara de funciones (ejecutores, defensores, comodines o coordinadores) con rotación continua.
- Apoyo DUA: Parejas de tutoría entre iguales y asignación de responsabilidades inclusivas.

${HEADERS.h3}
- Secuencia de juego y normas: ${str}

${HEADERS.h4}
- Variaciones de dificultad: Progresión en la velocidad de juego, dimensiones de las zonas y tamaño de los móviles/materiales.
- Adaptaciones DUA y Seguridad: Materiales adaptados (tacto, sonido, contraste visual) y distancia prudencial con paredes y espalderas.`;
  }

  // Parse lines into sections 1, 2, 3, 4
  const lines = str.split('\n');
  let currentSec = 0;
  const secContents: { [key: number]: string[] } = { 0: [], 1: [], 2: [], 3: [], 4: [] };

  for (let l of lines) {
    let trimmed = l.trim();
    if (!trimmed) continue;

    if (/^\(?[1]\)?\.?\s*(?:ORGANIZACIÓN|ORGANIZACION)/i.test(trimmed) || /^(?:ORGANIZACIÓN|ORGANIZACION)\s*(?:ESPACIAL|espacial)?.*:/i.test(trimmed)) {
      currentSec = 1;
    } else if (/^\(?[2]\)?\.?\s*(?:ROLES)/i.test(trimmed) || /^(?:ROLES)\s*(?:DE\s*ALUMNADO)?.*:/i.test(trimmed)) {
      currentSec = 2;
    } else if (/^\(?[3]\)?\.?\s*(?:DESARROLLO)/i.test(trimmed) || /^(?:DESARROLLO)\s*(?:PASO\s*A\s*PASO)?.*:/i.test(trimmed)) {
      currentSec = 3;
    } else if (/^\(?[4]\)?\.?\s*(?:VARIACIONES)/i.test(trimmed) || /^(?:VARIACIONES)\s*(?:,\s*DUA|\/DUA)?.*:/i.test(trimmed)) {
      // If it's a bullet item under section 4 like "- Variaciones: ...", don't treat as new header
      if (/^[-*]\s*(?:Variaciones|VARIACIONES)/i.test(trimmed) && currentSec === 4) {
        secContents[currentSec].push(trimmed);
      } else {
        currentSec = 4;
      }
    } else {
      secContents[currentSec].push(trimmed);
    }
  }

  let p1 = secContents[1].join('\n').trim();
  let p2 = secContents[2].join('\n').trim();
  let p3 = secContents[3].join('\n').trim();
  let p4 = secContents[4].join('\n').trim();

  // Prepend unsectioned text (if any) to section 3
  if (secContents[0].length > 0 && secContents[0].join('').trim()) {
    p3 = (secContents[0].join('\n').trim() + '\n' + p3).trim();
  }

  if (!p1) {
    p1 = '- Terreno y delimitación: Pista polideportiva o gimnasio delimitado por conos en zonas de trabajo equilibradas y seguras.\n- Ubicación del alumnado: Distribución estratégica del grupo para optimizar el tiempo de compromiso motor.';
  }
  if (!p2) {
    p2 = '- Roles activos: Asignación clara de funciones por parejas/grupos con rotación de funciones y responsabilidades.\n- Apoyo DUA: Tutoría entre iguales y reparto equitativo de tareas motoras.';
  }
  if (!p3 || p3.includes('Desarrollo motor de la actividad guiado por el docente')) {
    p3 = '- Secuencia de juego y normas: El juego inicia con la señal sonora del docente. Los participantes se desplazan controladamente por la zona delimitada buscando alcanzar la meta o completar el reto motor. Se aplican normas de cooperación y oposición limpia: respetando el turno de acción, pasando el móvil a compañeros desmarcados para anotar o evitar la interceptación rival, y rotando posiciones tras cada ciclo de puntuación.';
  }
  if (!p4) {
    p4 = '- Variaciones de dificultad: Alternativas para simplificar o aumentar el reto motor (ritmo, distancias, móviles).\n- Adaptaciones DUA y Seguridad: Materiales acolchados, apoyos visuales y distancia de seguridad con superficies duras.';
  }

  return `${HEADERS.h1}\n${p1}\n\n${HEADERS.h2}\n${p2}\n\n${HEADERS.h3}\n${p3}\n\n${HEADERS.h4}\n${p4}`;
}

/**
 * Renderiza la descripción de un juego en formato HTML rico
 * estructurado con encabezados destacados, viñetas y texto justificado
 * para PDF, Word y vista previa del documento.
 */
export function renderFormattedGameDescriptionHtml(text: string): string {
  if (!text) return '';
  const formattedText = formatGameDescription(text);
  const lines = formattedText.split('\n');
  let html = '';

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      html += '<div style="height: 4px;"></div>';
      continue;
    }

    // Encabezados principales (1. ORGANIZACIÓN, 2. ROLES, 3. DESARROLLO, 4. VARIACIONES)
    if (/^(1\.|2\.|3\.|4\.)\s*(ORGANIZACIÓN|ORGANIZACION|ROLES|DESARROLLO|VARIACIONES|Organización|Organizacion|Roles|Desarrollo|Variaciones)/i.test(trimmed)) {
      html += `<div style="font-weight: 800; color: #1e1b4b; font-size: 11px; margin-top: 8px; margin-bottom: 3px; border-bottom: 1px solid #c7d2fe; padding-bottom: 2px; text-align: left; hyphens: none;">${trimmed}</div>`;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Elemento de lista / viñeta con etiqueta destacada antes de los dos puntos
      const content = trimmed.substring(2);
      const colonIdx = content.indexOf(':');

      if (colonIdx > 0 && colonIdx < 50) {
        const label = content.substring(0, colonIdx + 1);
        const value = content.substring(colonIdx + 1);
        html += `<div style="padding-left: 10px; margin-bottom: 2px; font-size: 10.5px; color: #334155; line-height: 1.5; text-align: justify; hyphens: none; word-wrap: break-word; overflow-wrap: break-word; font-weight: normal;">• <strong style="color: #0f172a; font-weight: bold;">${label}</strong>${value}</div>`;
      } else {
        html += `<div style="padding-left: 10px; margin-bottom: 2px; font-size: 10.5px; color: #334155; line-height: 1.5; text-align: justify; hyphens: none; word-wrap: break-word; overflow-wrap: break-word; font-weight: normal;">• ${content}</div>`;
      }
    } else {
      // Párrafo normal
      html += `<p style="margin: 0 0 3px 0; font-size: 10.5px; color: #334155; line-height: 1.5; text-align: justify; hyphens: none; word-wrap: break-word; overflow-wrap: break-word; font-weight: normal;">${trimmed}</p>`;
    }
  }

  return html;
}

export interface DriveFolderInfo {
  id: string;
  name: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
}

export interface SituacionAprendizaje {
  id: string;
  fechaCreacion: string;
  // Paso 1: Datos Generales
  titulo: string;
  curso: Curso;
  ciclo: Ciclo;
  trimestre: Trimestre;
  numSesiones: number;
  tematica: TematicaEF;
  justificacion: string;

  // Paso 2 & 3: Curriculares
  competenciasSeleccionadas: string[]; // ids
  criteriosSeleccionados: string[]; // codigos
  saberesSeleccionados: string[]; // codigos
  odsSeleccionados: string[]; // e.g. "ODS 3", "ODS 5"
  descriptoresOperativos: string[]; // e.g. "CPSAA2", "CC1"

  // Paso 4: Metodología
  metodologiaActiva: string;
  modeloEstructura: ModeloEstructuraSesion;

  // Paso 5: Sesiones & Drive documentation
  driveFolderId?: string;
  driveFolderName?: string;
  driveDocumentationText?: string;
  porcentajeDrive?: number;
  porcentajeBancoJuegos?: number;
  porcentajeIA?: number;
  sesiones: SesionTrabajo[];

  // Paso 6: Producto Final
  productoFinal: string;

  // Paso 7: Diversidad
  neaeSeleccionadas: string[];
  adaptacionesNEAE: AdaptacionNEAE[];
  pautasDUAGlobales: PautaDUA[] | string[];

  // Paso 8: Evaluación
  instrumentosSeleccionados: string[];
  evaluacionInicial: string;
  instrumentosEvaluacion: InstrumentoEvaluacion[];
  rubrica: ElementoRubrica[];

  // Paso 9: Recursos
  recursosEspaciales: string[];
  recursosMateriales: string[];
  recursosExternos: string[];
  recursosCurriculares: string[];
}
