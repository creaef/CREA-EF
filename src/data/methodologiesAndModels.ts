import { MetodologiaActiva, ModeloEstructuraSesion, AdaptacionNEAE, InstrumentoEvaluacion } from '../types';

export const METODOLOGIAS_ACTIVAS_EF: MetodologiaActiva[] = [
  {
    id: 'gamificacion',
    nombre: 'Gamificación y Ludificación Motriz',
    descripcion:
      'Uso de mecánicas de juego (puntos, niveles, insignias, narrativas y misiones) para incrementar la motivación intrínseca y la adherencia a la práctica física.',
    ejemploAplicacion:
      'Superar "Niveles de Agilidad" o misiones en grupos para desbloquear habilidades o salvar reinos dentro de la temática elegida.',
  },
  {
    id: 'cooperativo',
    nombre: 'Aprendizaje Cooperativo en EF',
    descripcion:
      'Estructuras de trabajo en grupos heterogéneos donde el éxito individual depende del éxito colectivo (Interdependencia positiva y responsabilidad individual).',
    ejemploAplicacion:
      'Técnica "Marcador Colectivo" o "1-2-4 Motriz" para resolver retos físicos donde todos los miembros deben participar activamente.',
  },
  {
    id: 'abp',
    nombre: 'Aprendizaje Basado en Proyectos (ABP) / Retos',
    descripcion:
      'Planteamiento de un reto motor o problema de la vida real que culmina en un Producto Final tangible o presentado a la comunidad educativa.',
    ejemploAplicacion:
      'Diseñar y organizar un "Circuito Saludable para el Recreo" o una "Flashmob Intercultural" para compartir en el colegio.',
  },
  {
    id: 'med',
    nombre: 'Modelo de Educación Deportiva (MED)',
    descripcion:
      'Vivencia auténtica del deporte escolar asignando roles del ámbito deportivo (entrenador, árbitro, preparador físico, periodista, anotador).',
    ejemploAplicacion:
      'Organización de una liga deportiva escolar gestionada íntegramente por los propios alumnos desempeñando roles rotativos.',
  },
  {
    id: 'fipped',
    nombre: 'Flipped Classroom (Aula Invertida)',
    descripcion:
      'El alumnado analiza vídeos explicativos o normas en casa antes de la sesión para maximizar el Tiempo de Compromiso Motor (TCM) en el patio.',
    ejemploAplicacion:
      'Ver un vídeo corto de 2 minutos sobre reglas básicas o pasos de baile antes de la clase para dedicar los 60 min enteros a la práctica.',
  },
];

export const METODOLOGIAS_ACTIVAS = METODOLOGIAS_ACTIVAS_EF;

export const MODELOS_ESTRUCTURA_SESION: {
  id: ModeloEstructuraSesion;
  nombre: string;
  enfoque: string;
  modelo: ModeloEstructuraSesion;
  fases: { nombre: string; duracionDefault: number; duracionDefecto: number; descripcion: string }[];
}[] = [
  {
    id: 'Modelo 1: Tradicional',
    nombre: 'Estructura Tradicional Progresiva',
    enfoque: 'Organización secuencial clásica con calentamiento gradual, núcleo de tareas y vuelta a la calma con higiene.',
    modelo: 'Modelo 1: Tradicional',
    fases: [
      {
        nombre: 'Fase Inicial / Calentamiento',
        duracionDefault: 10,
        duracionDefecto: 10,
        descripcion: 'Puesta en acción, movilidad articular, juego dinamizador y explicación de objetivos de la sesión.',
      },
      {
        nombre: 'Parte Principal',
        duracionDefault: 40,
        duracionDefecto: 40,
        descripcion: 'Bloque central de tareas, juegos progresivos y desarrollo de saberes y capacidades motoras.',
      },
      {
        nombre: 'Vuelta a la Calma / Estiramientos y Aseo',
        duracionDefault: 10,
        duracionDefecto: 10,
        descripcion: 'Juego de relajación o respiración, estiramientos suaves, reflexión sobre el aprendizaje y rutinas de higiene personal.',
      },
    ],
  },
  {
    id: 'Modelo 2: Competencial',
    nombre: 'Estructura Competencial Orientada a Desafíos',
    enfoque: 'Planteamiento inicial de un conflicto o reto motor para provocar metacognición y transferencia directa.',
    modelo: 'Modelo 2: Competencial',
    fases: [
      {
        nombre: 'Fase 1: Conexión y Desafío Inicial',
        duracionDefault: 10,
        duracionDefecto: 10,
        descripcion: 'Planteamiento de un reto o pregunta problematizadora que activa saberes previos e interesa al alumnado.',
      },
      {
        nombre: 'Fase 2: Exploración y Práctica Competencial',
        duracionDefault: 40,
        duracionDefecto: 40,
        descripcion: 'Experimentación guiada, resolución de problemas motores en situaciones reales de juego y feedback continuo.',
      },
      {
        nombre: 'Fase 3: Transferencia, Reflexión y Autoevaluación',
        duracionDefault: 10,
        duracionDefecto: 10,
        descripcion: 'Puesta en común, metacognición sobre lo aprendido, registro en diana/cuaderno y evaluación del esfuerzo.',
      },
    ],
  },
  {
    id: 'Modelo 3: Metodologías Activas',
    nombre: 'Estructura Gamificada / ABP por Estaciones',
    enfoque: 'Narrativa inmersiva con trabajo por estaciones autónomas, asignación de roles y coevaluación en equipo.',
    modelo: 'Modelo 3: Metodologías Activas',
    fases: [
      {
        nombre: 'Fase 1: Ensamblaje y Misión del Día',
        duracionDefault: 10,
        duracionDefecto: 10,
        descripcion: 'Narrativa gamificada, asignación de roles de equipo o activación cooperativa de calentamiento.',
      },
      {
        nombre: 'Fase 2: Estaciones / Retos en Equipo (ABP/MED)',
        duracionDefault: 40,
        duracionDefecto: 40,
        descripcion: 'Rotación por estaciones de trabajo autónomo o competición limpia por roles (árbitros, técnicos, deportistas).',
      },
      {
        nombre: 'Fase 3: Debriefing, Puntos de Equipo y Coevaluación',
        duracionDefault: 10,
        duracionDefecto: 10,
        descripcion: 'Recuento de logros cooperativos, coevaluación del Fair Play y feedback entre iguales.',
      },
    ],
  },
];

export const PAUTAS_DUA_GLOBALES: string[] = [
  'Proporcionar Múltiples Formas de Implicación: Elección libre de roles (jugador, árbitro, fotógrafo, estratega) y metas graduadas por niveles de dificultad.',
  'Proporcionar Múltiples Formas de Representación: Explicaciones combinando consignas verbales, demostraciones prácticas, pictogramas visuales y esquemas en pizarra.',
  'Proporcionar Múltiples Formas de Acción y Expresión: Posibilidad de demostrar el aprendizaje mediante práctica motriz, coevaluación oral o diana gráfica.',
  'Uso de Zonas de Descanso voluntarias y Semáforo Emocional (dianas visuales) al finalizar cada sesión.',
];

export const ADAPTACIONES_NEAE_BASE: AdaptacionNEAE[] = [
  {
    categoria: 'Motórica',
    materialesYEspacio: 'Sustituir balones pesados por pelotas de espuma o globos. Reducir campo de juego.',
    material: 'Sustituir balones pesados por pelotas de espuma, globos o balones con cascabeles. Usar raquetas con mangos adaptados o velcros.',
    espacio: 'Reducir las dimensiones del campo de juego para disminuir desplazamientos exigentes. Superficies lisas sin obstáculos.',
    reglasYMetodologia:
      'Permitir más botes antes de recepcionar, eximir de la regla de "pasos" u otorgar roles estratégicos (ej. capitán que dirige táctica).',
    pautasDocente: 'Fomentar la ayuda entre iguales y validar esfuerzos individuales.',
  },
  {
    categoria: 'Visual',
    materialesYEspacio: 'Balones sonoros, petos de altísimo contraste (amarillo/negro), conos grandes.',
    material: 'Balones sonoros (goalball), petos de colores de altísimo contraste (amarillo/negro), cuerdas guía.',
    espacio: 'Delimitar los campos con cuerdas texturizadas o conos grandes. Evitar móviles rápidos a la cabeza.',
    reglasYMetodologia:
      'Asignar un compañero guía (lazarillo). Sustituir el pitido del silbato por indicaciones verbales claras anteponiendo el nombre.',
    pautasDocente: 'Anticipar sonoramente las trayectorias de juego.',
  },
  {
    categoria: 'Auditiva',
    materialesYEspacio: 'Pizarras tácticas visuales, tarjetas de normas en estaciones, banderas de color.',
    material: 'Pizarras tácticas visuales, tarjetas de normas en estaciones, banderas de color.',
    espacio: 'Ubicación estratégica del alumno cerca del docente frente al sol para favorecer la lectura labial.',
    reglasYMetodologia:
      'El docente habla siempre de frente sin desplazarse. Sustituir el silbato por señales visuales (levantar bandera o apagar luces). Demostraciones prácticas fidedignas (modelaje).',
    pautasDocente: 'Asegurar siempre la comunicación visual antes de dar órdenes.',
  },
  {
    categoria: 'TEA/TDAH',
    materialesYEspacio: 'Pictogramas con paneles visuales de anticipación de las tareas del día. Cintas diferenciadas.',
    material: 'Pictogramas con paneles visuales de anticipación de las tareas del día. Cintas diferenciadas.',
    espacio: 'Reducir la sobreestimulación (ecos en pabellones). Establecer una "zona refugio" o "tiempo fuera" voluntario.',
    reglasYMetodologia:
      'Mantener rutinas predecibles (mismo círculo de inicio/final). Instrucciones cortas de una sola orden a la vez.',
    pautasDocente: 'Dar consignas secuenciadas de una en una de manera tranquila.',
  },
];

export const INSTRUMENTOS_EVALUACION_DEFAULT: InstrumentoEvaluacion[] = [
  {
    tipo: 'Rúbrica de Observación',
    nombre: 'Rúbrica de Logro Criterial',
    descripcion: 'Matriz que evalúa el nivel de logro de cada Criterio de Evaluación en 4 niveles (Iniciado, En proceso, Conseguido, Excelente).',
    aplicacion: 'Docente durante las sesiones principales y retos finales.',
    itemsOIndicadores: ['Demuestra control motor', 'Respeta normas de seguridad', 'Muestra actitud cooperativa'],
  },
  {
    tipo: 'Diana de Autoevaluación',
    nombre: 'Diana de Reflexión Individual',
    descripcion: 'Gráfico circular visual donde el alumno colorea su nivel de esfuerzo, respeto a las normas y diversión.',
    aplicacion: 'Alumnado al finalizar las sesiones en la fase de vuelta a la calma.',
    itemsOIndicadores: ['Nivel de Esfuerzo', 'Trabajo en Equipo', 'Respeto a Normas', 'Disfrute'],
  },
  {
    tipo: 'Lista de Cotejo',
    nombre: 'Checklist de Coevaluación',
    descripcion: 'Checklist sencillo (Sí / No / A veces) que un alumno utiliza para observar a su compañero durante la práctica.',
    aplicacion: 'Coevaluación entre iguales en minijuegos o tareas por parejas.',
    itemsOIndicadores: ['Realiza la técnica adecuadamente', 'Anima a su compañero/a', 'Cumple el reglamento'],
  },
  {
    tipo: 'Cuaderno de Equipo',
    nombre: 'Registro de Decisiones Tácticas',
    descripcion: 'Registro donde el grupo anota sus decisiones tácticas, resultados de retos cooperativos y reflexiones de Fair Play.',
    aplicacion: 'Grupos de trabajo en metodologías activas y MED.',
    itemsOIndicadores: ['Estrategia elegida', 'Reparto de funciones', 'Acuerdos alcanzados'],
  },
  {
    tipo: 'Registro Anecdótico',
    nombre: 'Observaciones Directas',
    descripcion: 'Toma de notas rápida por el docente sobre comportamientos destacados, liderazgo positivo o resolución pacífica de conflictos.',
    aplicacion: 'Observación directa continuada durante la sesión.',
    itemsOIndicadores: ['Resolución de conflictos', 'Iniciativa y liderazgo', 'Ayuda prestada'],
  },
];
