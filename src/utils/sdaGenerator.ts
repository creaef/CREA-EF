import {
  SituacionAprendizaje,
  SesionTrabajo,
  ActividadEnSesion,
  JuegoActividadDB,
  Ciclo,
  TematicaEF,
  ModeloEstructuraSesion,
  ElementoRubrica,
  formatGameDescription,
} from '../types';
import { BASE_DATOS_ACTIVIDADES } from '../data/activitiesDatabase';
import { COMPETENCIAS_ESPECIFICAS_EF, CRITERIOS_EVALUACION_EF, SABERES_BASICOS_EF, ODS_LIST } from '../data/curriculumData';
import { MODELOS_ESTRUCTURA_SESION, PAUTAS_DUA_GLOBALES, ADAPTACIONES_NEAE_BASE, INSTRUMENTOS_EVALUACION_DEFAULT } from '../data/methodologiesAndModels';

// Filter database activities by cycle & theme
export function getActividadesFiltradas(ciclo: Ciclo, tematica: TematicaEF): JuegoActividadDB[] {
  let list = BASE_DATOS_ACTIVIDADES.filter(
    (act) => (act.ciclo === ciclo || act.ciclo === 'Todos') && act.tematica === tematica
  );

  // Fallback: If filtered list is small, include activities from "Todos" or related themes
  if (list.length < 3) {
    const fallbacks = BASE_DATOS_ACTIVIDADES.filter(
      (act) => act.ciclo === ciclo || act.ciclo === 'Todos'
    );
    list = [...list, ...fallbacks.filter((f) => !list.some((l) => l.id === f.id))];
  }
  return list;
}

// Map course to cycle
export function getCicloFromCurso(curso: string): Ciclo {
  if (curso.startsWith('1º') || curso.startsWith('2º')) return 'Primer Ciclo';
  if (curso.startsWith('3º') || curso.startsWith('4º')) return 'Segundo Ciclo';
  return 'Tercer Ciclo';
}

// Generate automatic sessions given model structure and activities database
export function generarSesionesAuto(
  numSesiones: number,
  ciclo: Ciclo,
  tematica: TematicaEF,
  modeloEstructura: ModeloEstructuraSesion,
  criteriosCodigos: string[]
): SesionTrabajo[] {
  const actividadesDisponibles = getActividadesFiltradas(ciclo, tematica);
  const modeloInfo = MODELOS_ESTRUCTURA_SESION.find((m) => m.id === modeloEstructura) || MODELOS_ESTRUCTURA_SESION[1];

  const iniciales = actividadesDisponibles.filter((a) => a.faseIdeal === 'Inicial');
  const principales = actividadesDisponibles.filter((a) => a.faseIdeal === 'Principal');
  const calmas = actividadesDisponibles.filter((a) => a.faseIdeal === 'Vuelta a la Calma');

  const sesiones: SesionTrabajo[] = [];

  for (let i = 1; i <= numSesiones; i++) {
    const fases: ActividadEnSesion[] = [];
    const materialesSet = new Set<string>();

    if (modeloEstructura === 'Modelo 1: Tradicional') {
      // 3 fases: Animación (10m), Principal (40m), Vuelta a la Calma (10m)
      const juegoIni = iniciales[(i - 1) % (iniciales.length || 1)] || actividadesDisponibles[0];
      const juegoPrin1 = principales[(i - 1) % (principales.length || 1)] || actividadesDisponibles[1] || juegoIni;
      const juegoPrin2 = principales[i % (principales.length || 1)] || actividadesDisponibles[2] || juegoPrin1;
      const juegoCalma = calmas[(i - 1) % (calmas.length || 1)] || actividadesDisponibles[actividadesDisponibles.length - 1];

      fases.push({
        fase: 'Animación (Fase Inicial)',
        duracionMin: 10,
        juegoId: juegoIni.id,
        nombreJuego: juegoIni.nombre,
        descripcion: juegoIni.descripcion,
        materiales: juegoIni.materiales,
        adaptacionDUA: juegoIni.atencionDiversidad,
      });

      fases.push({
        fase: 'Parte Principal (Módulo 1)',
        duracionMin: 20,
        juegoId: juegoPrin1.id,
        nombreJuego: juegoPrin1.nombre,
        descripcion: juegoPrin1.descripcion,
        materiales: juegoPrin1.materiales,
        adaptacionDUA: juegoPrin1.atencionDiversidad,
      });

      if (juegoPrin2 && juegoPrin2.id !== juegoPrin1.id) {
        fases.push({
          fase: 'Parte Principal (Módulo 2)',
          duracionMin: 20,
          juegoId: juegoPrin2.id,
          nombreJuego: juegoPrin2.nombre,
          descripcion: juegoPrin2.descripcion,
          materiales: juegoPrin2.materiales,
          adaptacionDUA: juegoPrin2.atencionDiversidad,
        });
      }

      fases.push({
        fase: 'Vuelta a la Calma',
        duracionMin: 10,
        juegoId: juegoCalma.id,
        nombreJuego: juegoCalma.nombre,
        descripcion: juegoCalma.descripcion,
        materiales: juegoCalma.materiales,
        adaptacionDUA: juegoCalma.atencionDiversidad,
      });
    } else if (modeloEstructura === 'Modelo 2: Competencial') {
      // 4 fases: Activación y Conexión (10m), Exploración (15m), Estructuración (15m), Aplicación y Reflexión (20m)
      const juego1 = iniciales[(i - 1) % (iniciales.length || 1)] || actividadesDisponibles[0];
      const juego2 = principales[(i - 1) % (principales.length || 1)] || actividadesDisponibles[1] || juego1;
      const juego3 = principales[i % (principales.length || 1)] || actividadesDisponibles[2] || juego2;
      const juego4 = calmas[(i - 1) % (calmas.length || 1)] || actividadesDisponibles[actividadesDisponibles.length - 1];

      fases.push({
        fase: 'Activación y Conexión',
        duracionMin: 10,
        juegoId: juego1.id,
        nombreJuego: `Reto de Entrada: ${juego1.nombre}`,
        descripcion: `Presentación del problema motriz de la sesión y juego de toma de contacto: ${juego1.descripcion}`,
        materiales: juego1.materiales,
        adaptacionDUA: juego1.atencionDiversidad,
      });

      fases.push({
        fase: 'Exploración Divergente',
        duracionMin: 15,
        juegoId: juego2.id,
        nombreJuego: juego2.nombre,
        descripcion: `Ensayo y error en grupos para resolver la tarea propuesta: ${juego2.descripcion}`,
        materiales: juego2.materiales,
        adaptacionDUA: juego2.atencionDiversidad,
      });

      fases.push({
        fase: 'Estructuración y Ajuste Táctico',
        duracionMin: 15,
        juegoId: juego3.id,
        nombreJuego: `Puesta a punto: ${juego3.nombre}`,
        descripcion: `Sistematización de los aprendizajes, aclaración de patrones técnicos y normas de seguridad: ${juego3.descripcion}`,
        materiales: juego3.materiales,
        adaptacionDUA: juego3.atencionDiversidad,
      });

      fases.push({
        fase: 'Aplicación y Reflexión Formativa',
        duracionMin: 20,
        juegoId: juego4.id,
        nombreJuego: juego4.nombre,
        descripcion: `Puesta en práctica final y autoevaluación formativa: ${juego4.descripcion}`,
        materiales: juego4.materiales,
        adaptacionDUA: juego4.atencionDiversidad,
      });
    } else {
      // Modelo 3: Metodologías Activas (Planificación 10m, Ejecución en Postas/Reto 40m, Puesta en común 10m)
      const juegoPrin1 = principales[(i - 1) % (principales.length || 1)] || actividadesDisponibles[0];
      const juegoPrin2 = principales[i % (principales.length || 1)] || actividadesDisponibles[1] || juegoPrin1;
      const juegoCalma = calmas[(i - 1) % (calmas.length || 1)] || actividadesDisponibles[2];

      fases.push({
        fase: 'Planificación / Asamblea Inicial',
        duracionMin: 10,
        nombreJuego: `Asamblea de Roles y Presentación de Misiones (Sesión ${i})`,
        descripcion:
          'Explicación del reto o estaciones de trabajo en el patio, reparto de roles (capitán, encargado de material, observador de Fair Play) y consenso de normas.',
        materiales: ['Pizarra táctica', 'Petos de roles'],
      });

      fases.push({
        fase: 'Ejecución / Rotación Activa por Postas',
        duracionMin: 40,
        juegoId: juegoPrin1.id,
        nombreJuego: `Estaciones de Trabajo: ${juegoPrin1.nombre} & ${juegoPrin2.nombre}`,
        descripcion: `Desarrollo de los retos centrales en pequeños grupos heterogéneos: 1) ${juegoPrin1.descripcion} 2) ${juegoPrin2.descripcion}`,
        materiales: [...juegoPrin1.materiales, ...juegoPrin2.materiales],
        adaptacionDUA: juegoPrin1.atencionDiversidad,
      });

      fases.push({
        fase: 'Evaluación Grupal / Puesta en Común',
        duracionMin: 10,
        juegoId: juegoCalma.id,
        nombreJuego: juegoCalma.nombre,
        descripcion: `Reflexión compartida en círculo y registro en el Cuaderno de Equipo o Diana de Autoevaluación: ${juegoCalma.descripcion}`,
        materiales: juegoCalma.materiales,
        adaptacionDUA: juegoCalma.atencionDiversidad,
      });
    }

    // Ensure all phase descriptions are formatted into 4 regulatory sections
    fases.forEach((f) => {
      f.descripcion = formatGameDescription(f.descripcion);
      f.materiales.forEach((m) => materialesSet.add(m));
    });

    sesiones.push({
      numeroSesion: i,
      titulo: `Sesión ${i}: Progresión ${i === 1 ? 'Inicial' : i === numSesiones ? 'de Consolidación y Reto Final' : 'de Desarrollo Motriz'}`,
      objetivoSesion: `Experimentar y resolver situaciones motrices de ${tematica.toLowerCase()} aplicando criterios de cooperación e inclusión.`,
      fases,
      criteriosTrabajados: criteriosCodigos,
      materialesTotales: Array.from(materialesSet),
    });
  }

  return sesiones;
}

// Generate default rubric from selected criteria
export function generarRubricaPorDefecto(criteriosCodigos: string[]): ElementoRubrica[] {
  return criteriosCodigos.map((cod) => {
    const critObj = CRITERIOS_EVALUACION_EF.find((c) => c.codigo === cod || c.id === cod);
    const desc = critObj ? critObj.descripcion : 'Demuestra el criterio de evaluación seleccionado.';
    return {
      criterioCodigo: cod,
      criterioTexto: desc,
      niveles: [
        {
          nivel: 'Iniciado (1-4)',
          descriptor: `Muestra dificultades para ${desc.toLowerCase().slice(0, 80)}... Requiere ayuda constante y supervisión docente.`,
        },
        {
          nivel: 'En proceso (5-6)',
          descriptor: `Realiza de forma básica o discontinua el desempeño: ${desc.toLowerCase().slice(0, 90)}... con ayuda puntual entre iguales.`,
        },
        {
          nivel: 'Conseguido (7-8)',
          descriptor: `Consigue adecuadamente y de forma autónoma el desempeño: ${desc}`,
        },
        {
          nivel: 'Excelente (9-10)',
          descriptor: `Demuestra un dominio sobresaliente, apoya a sus compañeros e integra con creatividad y espíritu crítico: ${desc}`,
        },
      ],
    };
  });
}

// Generate exact Markdown output string required by the prompt
export function exportarSdAaMarkdown(sda: SituacionAprendizaje): string {
  const compsList = sda.competenciasSeleccionadas
    .map((id) => {
      const c = COMPETENCIAS_ESPECIFICAS_EF.find((item) => item.id === id);
      return c ? `* **${c.id}:** ${c.nombre} (${c.descripcion})` : `* **${id}**`;
    })
    .join('\n');

  const critsList = sda.criteriosSeleccionados
    .map((cod) => {
      const cr = CRITERIOS_EVALUACION_EF.find((item) => item.codigo === cod || item.id === cod);
      return cr ? `* **${cr.codigo}:** ${cr.descripcion}` : `* **${cod}**`;
    })
    .join('\n');

  const saberesList = sda.saberesSeleccionados
    .map((cod) => {
      const sb = SABERES_BASICOS_EF.find((item) => item.codigo === cod);
      return sb ? `* **[Bloque ${sb.bloque}] ${sb.codigo}:** ${sb.descripcion}` : `* **${cod}**`;
    })
    .join('\n');

  const odsList = sda.odsSeleccionados
    .map((oId) => {
      const o = ODS_LIST.find((item) => item.id === oId);
      return o ? `* **${o.nombre}:** ${o.descripcion}` : `* **${oId}**`;
    })
    .join('\n');

  const descOpList = sda.descriptoresOperativos.map((d) => `\`${d}\``).join(', ');

  // Sessions markdown formatting
  const sesionesMd = sda.sesiones
    .map((ses) => {
      const fasesStr = ses.fases
        .map(
          (f) =>
            `    * ***${f.fase} (${f.duracionMin} min):*** **${f.nombreJuego}**. ${f.descripcion} *(Material: ${f.materiales.join(', ') || 'Sin material específico'})*`
        )
        .join('\n');

      return `* **Sesión ${ses.numeroSesion}: ${ses.titulo}** (60 min)\n${fasesStr}`;
    })
    .join('\n\n');

  // NEAE adaptations formatting
  const neaeMd = sda.adaptacionesNEAE
    .map(
      (a) =>
        `* **Adaptaciones para Necesidad ${a.categoria}:**\n  - *Materiales y Espacio:* ${a.materialesYEspacio || a.material || ''}\n  - *Pautas metodológicas/Reglas:* ${a.reglasYMetodologia || ''}`
    )
    .join('\n\n');

  // Rubric formatting
  const rubricaMd = sda.rubrica
    .map((r) => {
      const nivelesStr = r.niveles
        .map((n) => `  - **${n.nivel}:** ${n.descriptor}`)
        .join('\n');
      return `* **Criterio ${r.criterioCodigo}:** ${r.criterioTexto}\n${nivelesStr}`;
    })
    .join('\n\n');

  // Resources formatting
  const espStr = sda.recursosEspaciales.map((r) => `* ${r}`).join('\n');
  const matStr = sda.recursosMateriales.map((r) => `* ${r}`).join('\n');
  const extStr = sda.recursosExternos.map((r) => `* ${r}`).join('\n');

  return `---
## TÍTULO DE LA SITUACIÓN DE APRENDIZAJE: ${sda.titulo}
**Curso:** ${sda.curso} | **Ciclo:** ${sda.ciclo} | **Trimestre:** ${sda.trimestre} | **Nº de Sesiones:** ${sda.numSesiones}

### 1. Justificación y Temática
**Temática Principal:** ${sda.tematica}

${sda.justificacion}

### 2. Elementos Curriculares
#### Competencias Específicas
${compsList}

#### Criterios de Evaluación (Andalucía - Decreto 101/2023)
${critsList}

#### Saberes Básicos
${saberesList}

#### ODS, Temas Transversales y Descriptores Operativos
${odsList}
* **Descriptores Operativos del Perfil de Salida:** ${descOpList}

### 3. Metodología
* **Metodología Activa Principal:** ${sda.metodologiaActiva}
* **Modelo de Estructuración de Sesión:** ${sda.modeloEstructura}

*Propuesta didáctica basada en la progresión lógica de situaciones motrices, fomentando el aprendizaje significativo, la autonomía, la autorregulación emocional y el trabajo cooperativo en el patio de Educación Física.*

### 4. Desarrollo de las Sesiones y Cronograma
${sesionesMd}

### 5. Producto Final / Reto
${sda.productoFinal}

### 6. Atención a la Diversidad (Marco DUA)
#### Pautas DUA Universales
${sda.pautasDUAGlobales.map((p) => `* ${p}`).join('\n')}

#### Módulo NEAE (Atención a Casuísticas Específicas)
${neaeMd}

### 7. Evaluación
#### Evaluación Inicial
${sda.evaluacionInicial}

#### Instrumentos de Evaluación Formativa Utilizados
${sda.instrumentosEvaluacion.map((i) => `* **${i.tipo}:** ${i.descripcion} (${i.aplicacion})`).join('\n')}

#### Rúbrica de Evaluación Criterial
${rubricaMd}

### 8. Recursos
#### Recursos Espaciales e Instalaciones
${espStr}

#### Recursos Materiales Deportivos y Escolares
${matStr}

#### Recursos Digitales y Externos
${extStr}
---`;
}
