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

// Filter database activities by cycle & theme respecting strict regional rule
export function getActividadesFiltradas(ciclo: Ciclo, tematica: string): JuegoActividadDB[] {
  const normTematica = String(tematica || '').toLowerCase().trim();
  const isAndalucianTheme = /andaluz|andalucía|flamenco|sevillana|giralda|alhambra/i.test(normTematica);

  let list = BASE_DATOS_ACTIVIDADES.filter((act) => {
    const actCicloMatch = act.ciclo === ciclo || act.ciclo === 'Todos';
    const actTematicaNorm = act.tematica.toLowerCase();
    const isExactMatch = actTematicaNorm === normTematica;
    const isPartialMatch = actTematicaNorm.includes(normTematica) || normTematica.includes(actTematicaNorm);
    return actCicloMatch && (isExactMatch || isPartialMatch);
  });

  // Fallback: If filtered list is small, include activities from neutral/universal themes
  if (list.length < 6) {
    const fallbacks = BASE_DATOS_ACTIVIDADES.filter((act) => {
      const actCicloMatch = act.ciclo === ciclo || act.ciclo === 'Todos';
      const isActAndalucian = /andaluz|andalucía|flamenco|sevillana|giralda|alhambra/i.test(act.tematica + ' ' + act.nombre);
      if (!isAndalucianTheme && isActAndalucian) {
        return false; // REGLA ESTRICTA: Excluir juegos andaluces si la temática no los solicita explícitamente
      }
      return actCicloMatch;
    });

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
  const modeloInfo =
    MODELOS_ESTRUCTURA_SESION.find((m) => m.id === modeloEstructura) ||
    MODELOS_ESTRUCTURA_SESION[1];

  const iniciales = actividadesDisponibles.filter((a) => a.faseIdeal === 'Inicial');
  const principales = actividadesDisponibles.filter((a) => a.faseIdeal === 'Principal');
  const calmas = actividadesDisponibles.filter((a) => a.faseIdeal === 'Vuelta a la Calma');

  const sesiones: SesionTrabajo[] = [];

  for (let i = 1; i <= numSesiones; i++) {
    const fases: ActividadEnSesion[] = [];
    const materialesSet = new Set<string>();

    // Iteración estricta en el orden exacto definido por las fases del modelo metodológico elegido
    modeloInfo.fases.forEach((faseDef, idx) => {
      if (idx === 0) {
        // Fase 1: Inicio / Calentamiento / Conexión (10 min)
        const juegoIni = iniciales[(i - 1) % (iniciales.length || 1)] || actividadesDisponibles[0];
        if (juegoIni?.materiales) juegoIni.materiales.forEach((m) => materialesSet.add(m));

        fases.push({
          fase: faseDef.nombre,
          duracionMin: 10,
          juegoId: juegoIni?.id,
          nombreJuego: juegoIni?.nombre || `Calentamiento: ${tematica}`,
          descripcion: formatGameDescription(juegoIni?.descripcion || 'Movilidad articular y juego de activación motriz.'),
          materiales: juegoIni?.materiales || ['Conos'],
          adaptacionDUA: juegoIni?.atencionDiversidad || 'Apoyos visuales y demostración práctica.',
        });
      } else if (idx === modeloInfo.fases.length - 1) {
        // Fase Final: Vuelta a la Calma / Debriefing / Autoevaluación (10 min)
        const juegoCalma = calmas[(i - 1) % (calmas.length || 1)] || actividadesDisponibles[actividadesDisponibles.length - 1];
        if (juegoCalma?.materiales) juegoCalma.materiales.forEach((m) => materialesSet.add(m));

        fases.push({
          fase: faseDef.nombre,
          duracionMin: 10,
          juegoId: juegoCalma?.id,
          nombreJuego: juegoCalma?.nombre || `Vuelta a la Calma y Reflexión`,
          descripcion: formatGameDescription(juegoCalma?.descripcion || 'Juego de relajación, estiramientos y metacognición en diana.'),
          materiales: juegoCalma?.materiales || [],
          adaptacionDUA: 'Semáforo emocional y diana visual.',
        });
      } else {
        // Fase 2: PARTE PRINCIPAL / EXPLORACIÓN / ESTACIONES -> OBLIGATORIAMENTE 4 JUEGOS MOTRICES (10 min cada uno = 40 min total)
        for (let subIdx = 1; subIdx <= 4; subIdx++) {
          const gameOffset = (i - 1) * 4 + (subIdx - 1);
          const juegoPrin = principales[gameOffset % (principales.length || 1)] || actividadesDisponibles[gameOffset % actividadesDisponibles.length] || actividadesDisponibles[0];
          if (juegoPrin?.materiales) juegoPrin.materiales.forEach((m) => materialesSet.add(m));

          fases.push({
            fase: `${faseDef.nombre} (Tarea ${subIdx}/4)`,
            duracionMin: 10,
            juegoId: juegoPrin?.id,
            nombreJuego: juegoPrin?.nombre || `Tarea ${subIdx}: Desafío Motor de ${tematica}`,
            descripcion: formatGameDescription(juegoPrin?.descripcion || `Actividad central ${subIdx} enfocada en ${tematica}.`),
            materiales: juegoPrin?.materiales || ['Material específico EF'],
            adaptacionDUA: juegoPrin?.atencionDiversidad || 'Grupos heterogéneos y asignación de roles flexibles.',
          });
        }
      }
    });

    // Ensure all phase descriptions are formatted into 4 regulatory sections
    fases.forEach((f) => {
      f.descripcion = formatGameDescription(f.descripcion);
    });

    sesiones.push({
      numeroSesion: i,
      titulo: `Sesión ${i}: ${fases[1]?.nombreJuego || fases[0]?.nombreJuego || tematica}`,
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
