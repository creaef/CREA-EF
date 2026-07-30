import { CompetenciaEspecifica, CriterioEvaluacion, SaberBasico, Ciclo } from '../types';

export const COMPETENCIAS_ESPECIFICAS_EF: CompetenciaEspecifica[] = [
  {
    id: 'CE.EF.1',
    numero: 1,
    nombre: 'Estilo de vida activo y saludable',
    descripcion:
      'Adoptar un estilo de vida activo y saludable, practicando regularmente actividades físicas, lúdicas y deportivas, adoptando comportamientos que potencien la salud física, mental y social, así como medidas de responsabilidad individual y colectiva durante la práctica motriz.',
  },
  {
    id: 'CE.EF.2',
    numero: 2,
    nombre: 'Resolución de problemas en situaciones motrices',
    descripcion:
      'Adaptar los elementos propios del esquema corporal, las capacidades físicas, perceptivo-motrices y coordinativas, así como las habilidades y destrezas motrices, aplicando procesos de percepción, decisión y ejecución adecuados a la lógica interna y a los objetivos de diferentes situaciones.',
  },
  {
    id: 'CE.EF.3',
    numero: 3,
    nombre: 'Autorregulación emocional e interacción social',
    descripcion:
      'Desarrollar procesos de autorregulación e interacción en el marco de la práctica motriz, con actitud empática e inclusiva, haciendo uso de habilidades sociales y actitudes de cooperación, respeto, inclusión, trabajo en equipo y deportividad.',
  },
  {
    id: 'CE.EF.4',
    numero: 4,
    nombre: 'Manifestaciones de la cultura motriz',
    descripcion:
      'Reconocer y practicar diferentes manifestaciones lúdicas, físico-deportivas y artístico-expresivas propias de la cultura motriz, valorando su influencia y sus aportaciones estéticas y creativas a la cultura tradicional y contemporánea (con especial acento en Andalucía).',
  },
  {
    id: 'CE.EF.5',
    numero: 5,
    nombre: 'Interacción eficiente y sostenible con el entorno',
    descripcion:
      'Valorar diferentes medios naturales y urbanos como contextos de práctica motriz, interactuando con ellos y comprendiendo la importancia de su conservación desde un enfoque sostenible, adoptando medidas de responsabilidad individual durante la práctica.',
  },
];

export const CRITERIOS_EVALUACION_EF: CriterioEvaluacion[] = [
  // --- PRIMER CICLO (1º y 2º) ---
  {
    id: '1.1.a',
    codigo: 'EFI.1.1.a',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Identificar los desplazamientos activos como práctica saludable, buscando la posibilidad de integrar normas de seguridad y hábitos de higiene en prácticas motrices cotidianas.',
  },
  {
    id: '1.2.b',
    codigo: 'EFI.1.2.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Explorar las posibilidades de la propia motricidad a través del juego, aplicando en distintas situaciones cotidianas medidas básicas de cuidado de la salud personal y educación postural.',
  },
  {
    id: '1.3.b',
    codigo: 'EFI.1.3.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Participar en juegos de activación y vuelta a la calma reconociendo su utilidad para adaptar el cuerpo a la actividad física y evitar lesiones.',
  },
  {
    id: '2.1.b',
    codigo: 'EFI.2.1.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Reconocer la importancia de establecer metas claras a la hora de desarrollar proyectos motores de carácter individual, cooperativo o colaborativo.',
  },
  {
    id: '2.2.b',
    codigo: 'EFI.2.2.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Adoptar decisiones en contextos de práctica motriz de manera ajustada según las circunstancias (esquema corporal, espacialidad, giros y desplazamientos).',
  },
  {
    id: '2.3.b',
    codigo: 'EFI.2.3.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Descubrir, reconocer y emplear los componentes cualitativos y cuantitativos de la motricidad de manera lúdica e integrada mejorando el dominio corporal.',
  },
  {
    id: '3.1.b',
    codigo: 'EFI.3.1.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.3',
    descripcion:
      'Identificar las emociones que se producen durante el juego, intentando gestionarlas de forma positiva y disfrutando de la actividad física.',
  },
  {
    id: '3.2.b',
    codigo: 'EFI.3.2.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.3',
    descripcion:
      'Respetar las normas consensuadas en clase, las reglas de juego y actuar desde los parámetros de la deportividad y el juego limpio.',
  },
  {
    id: '4.1.b',
    codigo: 'EFI.4.1.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.4',
    descripcion:
      'Participar activamente en juegos tradicionales andaluces y manifestaciones artístico-expresivas propias del entorno cercano.',
  },
  {
    id: '4.3.b',
    codigo: 'EFI.4.3.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.4',
    descripcion:
      'Adecuar los distintos usos comunicativos de la corporalidad y sus manifestaciones a diferentes ritmos y contextos expresivos.',
  },
  {
    id: '5.1.b',
    codigo: 'EFI.5.1.b',
    ciclo: 'Primer Ciclo',
    competenciaId: 'CE.EF.5',
    descripcion:
      'Participar en actividades lúdico-recreativas de forma segura en los entornos natural y urbano, adoptando actitudes de respeto y cuidado.',
  },

  // --- SEGUNDO CICLO (3º y 4º) ---
  {
    id: '2.1.1.b',
    codigo: 'EFI.2.1.1.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Reconocer la actividad física como alternativa de ocio saludable, identificando desplazamientos activos y sostenibles y sus beneficios físico-mentales.',
  },
  {
    id: '2.1.2.b',
    codigo: 'EFI.2.1.2.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Aplicar medidas de educación postural, alimentación saludable, higiene corporal y preparación de la práctica motriz en el aula y en casa.',
  },
  {
    id: '2.1.3.b',
    codigo: 'EFI.2.1.3.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Tomar medidas de precaución y prevención de lesiones en el cuidado del material deportivo y la vivencia de protocolos básicos ante accidentes.',
  },
  {
    id: '2.2.1.b',
    codigo: 'EFI.2.2.1.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Llevar a cabo proyectos motores de carácter individual o cooperativo empleando estrategias de monitorización y seguimiento del esfuerzo.',
  },
  {
    id: '2.2.2.b',
    codigo: 'EFI.2.2.2.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Adoptar decisiones tácticas y motrices en juegos predeportivos de invasión, red, campo y bate ajustándose a la lógica interna de cada situación.',
  },
  {
    id: '2.2.3.b',
    codigo: 'EFI.2.2.3.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Emplear habilidades motrices genéricas y combinadas con control tónico-postural e independencia segmentaria en retos motores.',
  },
  {
    id: '2.3.1.b',
    codigo: 'EFI.2.3.1.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.3',
    descripcion:
      'Mostrar una disposición positiva hacia la práctica física y el esfuerzo, regulando la impulsividad y resolviendo conflictos dialogadamente.',
  },
  {
    id: '2.3.3.b',
    codigo: 'EFI.2.3.3.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.3',
    descripcion:
      'Desarrollar habilidades sociales de acogida, inclusión y ayuda mutua en prácticas motrices variadas rechazando conductas discriminatorias.',
  },
  {
    id: '2.4.1.b',
    codigo: 'EFI.2.4.1.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.4',
    descripcion:
      'Participar activamente en juegos populares, deportes tradicionales de Andalucía, bailes y danzas del folclore andaluz contextualizando su origen.',
  },
  {
    id: '2.4.3.b',
    codigo: 'EFI.2.4.3.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.4',
    descripcion:
      'Reproducir combinaciones de movimientos o coreografías comunicando sensaciones, emociones e ideas a través de la expresión corporal.',
  },
  {
    id: '2.5.1.b',
    codigo: 'EFI.2.5.1.b',
    ciclo: 'Segundo Ciclo',
    competenciaId: 'CE.EF.5',
    descripcion:
      'Desarrollar una práctica motriz segura y orientada en entornos naturales y urbanos, respetando el medio ambiente y los parques de Andalucía.',
  },

  // --- TERCER CICLO (5º y 6º) ---
  {
    id: '3.1.1.b',
    codigo: 'EFI.3.1.1.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Reconocer los efectos beneficiosos a nivel físico y mental de la actividad física regular integrándola de forma autónoma en la vida diaria.',
  },
  {
    id: '3.1.2.b',
    codigo: 'EFI.3.1.2.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Integrar los procesos de calentamiento específico, dosificación del esfuerzo, estiramientos, hidratación y hábitos de higiene tras la práctica.',
  },
  {
    id: '3.1.3.b',
    codigo: 'EFI.3.1.3.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.1',
    descripcion:
      'Adoptar medidas de seguridad antes, durante y después de la práctica físico-deportiva, aplicando la conducta PAS ante posibles accidentes.',
  },
  {
    id: '3.2.1.b',
    codigo: 'EFI.3.2.1.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Desarrollar proyectos motores de carácter individual o cooperativo definiendo metas, seleccionando estrategias y evaluando los resultados.',
  },
  {
    id: '3.2.2.b',
    codigo: 'EFI.3.2.2.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Aplicar principios de toma de decisiones tácticas en deportes modificados (invasión, red, pared, campo y bate) anticipándose a la acción del rival.',
  },
  {
    id: '3.2.3.b',
    codigo: 'EFI.3.2.3.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.2',
    descripcion:
      'Adquirir control corporal en habilidades motrices específicas y capacidades condicionales (resistencia, velocidad, fuerza y flexibilidad) con fin lúdico.',
  },
  {
    id: '3.3.2.b',
    codigo: 'EFI.3.3.2.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.3',
    descripcion:
      'Respetar las normas consensuadas, actuar desde los parámetros del fair play o juego limpio y asumir distintos roles (jugador, árbitro, organizador).',
  },
  {
    id: '3.3.3.b',
    codigo: 'EFI.3.3.3.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.3',
    descripcion:
      'Convivir mostrando habilidades sociales de diálogo, resolución pacífica de conflictos y actitud crítica activa contra estereotipos y sexismo en el deporte.',
  },
  {
    id: '3.4.1.b',
    codigo: 'EFI.3.4.1.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.4',
    descripcion:
      'Participar activamente en deportes tradicionales y manifestaciones de la cultura motriz andaluza, reconociendo el deporte como patrimonio e historia.',
  },
  {
    id: '3.4.3.b',
    codigo: 'EFI.3.4.3.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.4',
    descripcion:
      'Crear y ejecutar composiciones o montajes coreográficos (ej. acrosport, danza, mimo) comunicando ideas y emociones de forma estética.',
  },
  {
    id: '3.5.1.b',
    codigo: 'EFI.3.5.1.b',
    ciclo: 'Tercer Ciclo',
    competenciaId: 'CE.EF.5',
    descripcion:
      'Adaptar las acciones motrices a la incertidumbre del medio natural y urbano (senderismo, orientación, movilidad en bici/patines) cuidando el entorno de Andalucía.',
  },
];

export const SABERES_BASICOS_EF: SaberBasico[] = [
  // --- PRIMER CICLO ---
  {
    codigo: 'EFI.1.A.1',
    bloque: 'A',
    bloqueNombre: 'Vida activa y saludable',
    ciclo: 'Primer Ciclo',
    descripcion:
      'Salud física: efectos beneficiosos elementales de la práctica. Cuidado del cuerpo e higiene personal básica (lavado de manos, cambio de camiseta). Alimentación saludable básica.',
  },
  {
    codigo: 'EFI.1.B.3',
    bloque: 'B',
    bloqueNombre: 'Organización y gestión de la actividad física',
    ciclo: 'Primer Ciclo',
    descripcion:
      'Elección de la vestimenta deportiva adecuada. Cuidado y recogida del material. Preparación básica para la práctica motriz.',
  },
  {
    codigo: 'EFI.1.C.2',
    bloque: 'C',
    bloqueNombre: 'Resolución de problemas en situaciones motrices',
    ciclo: 'Primer Ciclo',
    descripcion:
      'Capacidades perceptivo-motrices básicas (esquema corporal, lateralidad, espacialidad, estructuración temporal). Habilidades motrices básicas (desplazamientos, saltos, giros, lanzamientos).',
  },
  {
    codigo: 'EFI.1.D.1',
    bloque: 'D',
    bloqueNombre: 'Autorregulación emocional e interacción social',
    ciclo: 'Primer Ciclo',
    descripcion:
      'Identificación de emociones básicas en el juego. Respeto a las reglas y normas de convivencia. Tolerancia a la frustración lúdica.',
  },
  {
    codigo: 'EFI.1.E.1',
    bloque: 'E',
    bloqueNombre: 'Manifestaciones de la cultura motriz',
    ciclo: 'Primer Ciclo',
    descripcion:
      'Juegos tradicionales y populares andaluces elementales (el teje, la comba, el pañuelo). Expresión corporal y ritmo básico.',
  },
  {
    codigo: 'EFI.1.F.1',
    bloque: 'F',
    bloqueNombre: 'Interacción eficiente y sostenible con el entorno',
    ciclo: 'Primer Ciclo',
    descripcion:
      'Uso seguro de los espacios de juego en el patio y parque cercano. Educación vial básica del peatón. Cuidado del entorno próximo.',
  },

  // --- SEGUNDO CICLO ---
  {
    codigo: 'EFI.2.A.1',
    bloque: 'A',
    bloqueNombre: 'Vida activa y saludable',
    ciclo: 'Segundo Ciclo',
    descripcion:
      'Efectos físicos y psicológicos del ejercicio. Calentamiento lúdico, rutina de higiene personal completa (bolsa de aseo) y hábitos de hidratación.',
  },
  {
    codigo: 'EFI.2.B.2',
    bloque: 'B',
    bloqueNombre: 'Organización y gestión de la actividad física',
    ciclo: 'Segundo Ciclo',
    descripcion:
      'Gestión del esfuerzo y de la intensidad física. Normas de seguridad en la manipulación de materiales. Prevención de riesgos en el patio.',
  },
  {
    codigo: 'EFI.2.C.1',
    bloque: 'C',
    bloqueNombre: 'Resolución de problemas en situaciones motrices',
    ciclo: 'Segundo Ciclo',
    descripcion:
      'Habilidades motrices genéricas y combinadas. Nociones tácticas básicas de ataque y defensa en juegos predeportivos (desmarque, pase al libre).',
  },
  {
    codigo: 'EFI.2.D.2',
    bloque: 'D',
    bloqueNombre: 'Autorregulación emocional e interacción social',
    ciclo: 'Segundo Ciclo',
    descripcion:
      'Gestión de la victoria y la derrota. Estrategias de cooperación y juego limpio. Rechazo activo de estereotipos o discriminación por competencia motriz.',
  },
  {
    codigo: 'EFI.2.E.1',
    bloque: 'E',
    bloqueNombre: 'Manifestaciones de la cultura motriz',
    ciclo: 'Segundo Ciclo',
    descripcion:
      'Juegos populares y deportes autóctonos de Andalucía. Bailes y danzas tradicionales andaluzas. Lenguaje corporal no verbal.',
  },
  {
    codigo: 'EFI.2.F.1',
    bloque: 'F',
    bloqueNombre: 'Interacción eficiente y sostenible con el entorno',
    ciclo: 'Segundo Ciclo',
    descripcion:
      'Orientación espacial en la naturaleza o entorno urbano. Práctica motriz en parques naturales andaluces con concienciación ambiental.',
  },

  // --- TERCER CICLO ---
  {
    codigo: 'EFI.3.A.1',
    bloque: 'A',
    bloqueNombre: 'Vida activa y saludable',
    ciclo: 'Tercer Ciclo',
    descripcion:
      'Diseño de calentamientos específicos y rutinas de vuelta a la calma. Análisis crítico de la alimentación e imagen corporal. Prevención de lesiones.',
  },
  {
    codigo: 'EFI.3.B.4',
    bloque: 'B',
    bloqueNombre: 'Organización y gestión de la actividad física',
    ciclo: 'Tercer Ciclo',
    descripcion:
      'Planificación autónoma de proyectos motores. Uso de tecnología (apps de podómetro o pulsómetro). Primeros auxilios básicos (Conducta PAS y posición lateral de seguridad).',
  },
  {
    codigo: 'EFI.3.C.4',
    bloque: 'C',
    bloqueNombre: 'Resolución de problemas en situaciones motrices',
    ciclo: 'Tercer Ciclo',
    descripcion:
      'Habilidades motrices específicas asociadas a la técnica en deportes modificados. Toma de decisiones tácticas en tiempo real. Desarrollo de capacidades físicas básicas.',
  },
  {
    codigo: 'EFI.3.D.3',
    bloque: 'D',
    bloqueNombre: 'Autorregulación emocional e interacción social',
    ciclo: 'Tercer Ciclo',
    descripcion:
      'Concepto de Fair Play. Asunción de roles rotativos (jugador, árbitro, entrenador, periodista). Coeducación, torneos mixtos e igualdad en el deporte.',
  },
  {
    codigo: 'EFI.3.E.5',
    bloque: 'E',
    bloqueNombre: 'Manifestaciones de la cultura motriz',
    ciclo: 'Tercer Ciclo',
    descripcion:
      'Montajes acrobáticos (Acrosport), expresión corporal estética y danza contemporánea/flamenca. Historia de los Juegos Olímpicos y Paralímpicos.',
  },
  {
    codigo: 'EFI.3.F.2',
    bloque: 'F',
    bloqueNombre: 'Interacción eficiente y sostenible con el entorno',
    ciclo: 'Tercer Ciclo',
    descripcion:
      'Deportes de orientación en el medio natural/urbano. Movilidad activa y sostenible (bicicleta, patines). Plogging y cuidado ambiental.',
  },
];

export const DESCRIPTORES_OPERATIVOS_MAP = [
  { codigo: 'CPSAA1', nombre: 'Autoconocimiento y optimismo' },
  { codigo: 'CPSAA2', nombre: 'Hábitos de vida saludable' },
  { codigo: 'CPSAA3', nombre: 'Trabajo en equipo y empatía' },
  { codigo: 'CC1', nombre: 'Resolución pacífica de conflictos' },
  { codigo: 'CC2', nombre: 'Respeto a las normas establecidas' },
  { codigo: 'CC3', nombre: 'Respeto a la diversidad e inclusión' },
  { codigo: 'CE1', nombre: 'Iniciativa en resolución de situaciones motrices' },
  { codigo: 'CE3', nombre: 'Transformación de ideas en acciones conjuntas' },
  { codigo: 'STEM2', nombre: 'Resolución de problemas con lógica y orientación' },
  { codigo: 'STEM5', nombre: 'Cuidado y protección del medio natural' },
  { codigo: 'CCL1', nombre: 'Expresión oral y diálogo respetuoso' },
  { codigo: 'CD2', nombre: 'Creación y uso responsable de contenido digital' },
];

export const ODS_LIST = [
  {
    id: 'ODS 3',
    nombre: 'ODS 3: Salud y Bienestar',
    descripcion: 'Higiene postural, nutrición sana, condición física y estilo de vida activo.',
  },
  {
    id: 'ODS 4',
    nombre: 'ODS 4: Educación de Calidad',
    descripcion: 'Aprendizaje motriz inclusivo, accesibilidad DUA y superación personal.',
  },
  {
    id: 'ODS 5',
    nombre: 'ODS 5: Igualdad de Género',
    descripcion: 'Deportes coeducativos, torneos mixtos, análisis de estereotipos en el deporte.',
  },
  {
    id: 'ODS 13',
    nombre: 'ODS 13: Acción por el Clima',
    descripcion: 'Senderismo, plogging, reciclaje de materiales para juegos en la naturaleza.',
  },
];
