import { JuegoActividadDB } from '../types';

export const BASE_DATOS_ACTIVIDADES: JuegoActividadDB[] = [
  // ==========================================
  // TEMÁTICA: EXPRESIÓN CORPORAL Y DANZA ANDALUZA
  // ==========================================
  {
    id: 'exp-01',
    nombre: 'El Espejo Flamenco',
    tematica: 'Expresión Corporal y Danza Andaluza',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.4.1.b', 'EFI.4.3.b'],
    faseIdeal: 'Inicial',
    descripcion:
      'Por parejas, uno imita las posturas, palmas, remates y gestos expresivos del compañero a modo de espejo al ritmo de compases flamencos o palmitas simples.',
    atencionDiversidad:
      'DUA: El alumno puede elegir imitar solo parte superior o inferior. Usar apoyo visual mediante tarjetas de posturas.',
    materiales: ['Altavoz', 'Música de compás andaluz / rumba suave', 'Tarjetas de posturas'],
  },
  {
    id: 'exp-02',
    nombre: 'Estatuas de la Alhambra y la Giralda',
    tematica: 'Expresión Corporal y Danza Andaluza',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.4.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Los niños se desplazan bailando suavemente por el espacio. Cuando la música se detiene, deben congelarse recreando monumentos andaluces o emociones expresivas.',
    atencionDiversidad:
      'Para alumnado TEA: Señal de parada con banderín visual amarillo además del silencio musical.',
    materiales: ['Pista de audio', 'Banderines visuales'],
  },
  {
    id: 'exp-03',
    nombre: 'La Sevillana de los Cuatro Pasos Adaptados',
    tematica: 'Expresión Corporal y Danza Andaluza',
    ciclo: 'Segundo Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.2.4.1.b', 'EFI.2.4.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Aprender la estructura de la 1ª sevillana simplificando los desplazamientos: paseo, pasada, careo y cierre, integrando percusión corporal (palmas y pisotones).',
    atencionDiversidad:
      'Asignar compañeros tutores. Marcaje de huellas en el suelo con colores para guiar los giros.',
    materiales: ['Huellas adhesivas de colores en el suelo', 'Altavoz Bluetooth', 'Castañuelas o pañuelos'],
  },
  {
    id: 'exp-04',
    nombre: 'Teatro Mimo: Historias de la Cultura Andaluza',
    tematica: 'Expresión Corporal y Danza Andaluza',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.3.4.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'En grupos de 4, representan mediante dramatización y sin hablar una escena tradicional (ej: recogida de la oliva, faena marinera en Cádiz, romería) para que los demás adivinen.',
    atencionDiversidad:
      'Permitir apoyo con vestuario o utilería ligera. Para discapacidad auditiva, instrucciones en pizarra de tareas.',
    materiales: ['Tarjetas con temas de representación', 'Pizarra portátil de petos/útiles'],
  },

  // ==========================================
  // TEMÁTICA: JUEGOS POPULARES Y TRADICIONALES ANDALUCES
  // ==========================================
  {
    id: 'jue-01',
    nombre: 'El Pañuelo Mixto Andaluz',
    tematica: 'Juegos Populares y Tradicionales Andaluces',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.4.1.b', 'EFI.2.4.1.b', 'EFI.3.4.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Dos equipos enfrentados alineados en extremos del campo. El docente dice un número (o resolver una suma/operación). Los asignados corren al centro a coger el pañuelo sin cruzar la línea si el rival se lo lleva.',
    atencionDiversidad:
      'Si hay alumnado con movilidad reducida, asignar números dobles o que el estímulo sea dar una palmada o completar un reto coordinativo antes de correr.',
    materiales: ['Pañuelo de tela', 'Conos para delimitar líneas'],
  },
  {
    id: 'jue-02',
    nombre: 'El Teje / La Rayuela Cooperativa',
    tematica: 'Juegos Populares y Tradicionales Andaluces',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.2.2.b', 'EFI.4.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Juego tradicional dibujado en el suelo con tiza. Lanzan una piedra/ficha en orden numérico y avanzan a la pata coja evitando la casilla ocupada por la piedra.',
    atencionDiversidad:
      'Permitir saltos a dos pies o aumentar el tamaño de las casillas dibujadas para alumnado con baja coordinación o visión reducida.',
    materiales: ['Tizas de colores', 'Fichas de plástico o tejos de madera'],
  },
  {
    id: 'jue-03',
    nombre: 'La Comba en Cadena con Cancionero Andaluz',
    tematica: 'Juegos Populares y Tradicionales Andaluces',
    ciclo: 'Segundo Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.2.4.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Dos alumnos dan a una comba larga mientras cantan coplillas tradicionales andaluzas. Los compañeros entran de uno en uno, dan 3 saltos y salen sin parar el ritmo.',
    atencionDiversidad:
      'Ajustar la velocidad del ritmo de batido. Uso de combalarga fluorescente para visibilidad.',
    materiales: ['Combas largas de 6 a 8 metros', 'Cancionero popular visual'],
  },
  {
    id: 'jue-04',
    nombre: 'Carrera de Chapas y Circuitos de las Provincias',
    tematica: 'Juegos Populares y Tradicionales Andaluces',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.3.4.1.b', 'EFI.3.2.1.b'],
    faseIdeal: 'Vuelta a la Calma',
    descripcion:
      'Impulsar la chapa con los dedos dentro de un circuito trazado con tiza que conecta las 8 provincias andaluzas, respetando las normas de no salirse de la pista.',
    atencionDiversidad:
      'Usar chapas más grandes o adaptadores de pulgar si existen problemas de motricidad fina.',
    materiales: ['Chapas decoradas con banderas/iconos', 'Tizas de colores'],
  },

  // ==========================================
  // TEMÁTICA: INICIACIÓN DEPORTIVA Y JUEGOS DE INVASIÓN
  // ==========================================
  {
    id: 'dep-01',
    nombre: 'Los 10 Pases Inclusivos',
    tematica: 'Iniciación Deportiva y Juegos de Invasión',
    ciclo: 'Segundo Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.2.2.2.b', 'EFI.2.3.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Dos equipos de 5-6 participantes en media pista. El objetivo es conseguir dar 10 pases consecutivos sin que el equipo rival intercepte el balón ni se pueda botar más de 2 veces.',
    atencionDiversidad:
      'Regla obligatoria de pase a todos los miembros antes del pase 10. Uso de pelota de espuma grande o rugosa.',
    materiales: ['Balones de foam blandos', 'Petos de 2 colores diferenciados'],
  },
  {
    id: 'dep-02',
    nombre: 'Goubak / Ultimate Adaptado con Juego Limpio',
    tematica: 'Iniciación Deportiva y Juegos de Invasión',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.3 - Autorregulación emocional e interacción social',
    criteriosEvaluacion: ['EFI.3.2.2.b', 'EFI.3.3.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Juego de equipo con un poste central o zona de recepción. Se avanza mediante pases de frisbee/móvil blando. No hay contacto físico ni árbitro (auto-arbitraje con tarjetas verde/blanca).',
    atencionDiversidad:
      'Permitir que el defensor mantenga una distancia mínima de 1.5 metros del lanzador (zona de protección).',
    materiales: ['Frisbees blandos de caucho/foam', 'Conos', 'Pizarra táctica'],
  },
  {
    id: 'dep-03',
    nombre: 'Rugby-Tag y Caza de Cintas Coeducativo',
    tematica: 'Iniciación Deportiva y Juegos de Invasión',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.3.2.2.b', 'EFI.3.3.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Avance hacia la línea de marca contraria portando el balón de rugby. El placaje se sustituye por quitar una cinta o velcro del cinturón del atacante.',
    atencionDiversidad:
      'Cinturones de fácil desenganche. Equipos mixtos con puntuaciones especiales por pases coordinados entre niños y niñas.',
    materiales: ['Balones de rugby blandos', 'Cinturones de Tag con cintas velcro', 'Petos'],
  },
  {
    id: 'dep-04',
    nombre: 'El Rescate del Balón Prisionero en Zonas',
    tematica: 'Iniciación Deportiva y Juegos de Invasión',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.1.2.b', 'EFI.1.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Juego de lanzamientos y recepciones en dos campos. Si te toca el balón sin botar vas a la zona de "cementerio" y te salvas si recepcionas un pase de tu equipo.',
    atencionDiversidad:
      'Lanzar desde zonas más cercanas si es necesario. Balones de espuma extra blanda antimpactos.',
    materiales: ['Balones de gomaespuma de 20cm', 'Conos'],
  },

  // ==========================================
  // TEMÁTICA: SENDERISMO, ORIENTACIÓN Y MEDIO NATURAL
  // ==========================================
  {
    id: 'nat-01',
    nombre: 'Caza del Tesoro con Mapa del Patio',
    tematica: 'Senderismo, Orientación y Medio Natural',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.5 - Interacción eficiente y sostenible con el entorno',
    criteriosEvaluacion: ['EFI.5.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Por parejas, leen un mapa sencillo del centro escolar con pictogramas para encontrar 5 balizas ocultas en árboles o elementos del jardín y estampar un sello en sus fichas.',
    atencionDiversidad:
      'Pistas con texturas o contrastes de color alto. Mapas en tamaño A3 con simbología grande.',
    materiales: ['Mapas impresos A3', 'Balizas numeradas', 'Troqueladoras/sellos'],
  },
  {
    id: 'nat-02',
    nombre: 'Ruta de Senderismo Virtual y Plogging Verde',
    tematica: 'Senderismo, Orientación y Medio Natural',
    ciclo: 'Segundo Ciclo',
    conexionCurricular: 'CE.EF.5 - Interacción eficiente y sostenible con el entorno',
    criteriosEvaluacion: ['EFI.2.5.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Circuito por el entorno escolar o parque simulando una ruta por Doñana o Cazorla. Durante la marcha, deben superar pruebas físicas y simular recogida de residuos clasificados (Plogging).',
    atencionDiversidad:
      'Asignar bolsas de peso adaptable. Terreno accesible sin barreras arquitectónicas.',
    materiales: ['Guía de senderismo impresa', 'Contenedores de clasificación de residuos ficticios'],
  },
  {
    id: 'nat-03',
    nombre: 'Carrera de Orientación Deportiva con Código QR',
    tematica: 'Senderismo, Orientación y Medio Natural',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.5 - Interacción eficiente y sostenible con el entorno',
    criteriosEvaluacion: ['EFI.3.5.1.b', 'EFI.3.1.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Búsqueda en el parque municipal utilizando mapa topográfico simplificado y brújula o tablet/móvil para escanear balizas QR que plantean preguntas sobre la biodiversidad andaluza.',
    atencionDiversidad:
      'Parejas heterogéneas. Brújulas adaptadas con relieves visuales y lectura por voz si hay dispositivo.',
    materiales: ['Mapas de orientación', 'Brújulas de aprendizaje', 'Códigos QR impresos y plastificados'],
  },

  // ==========================================
  // TEMÁTICA: HÁBITOS SALUDABLES Y CONDICIÓN FÍSICA LÚDICA
  // ==========================================
  {
    id: 'sal-01',
    nombre: 'El Semáforo de la Nutrición Activa',
    tematica: 'Hábitos Saludables y Condición Física Lúdica',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.1 - Estilo de vida activo y saludable',
    criteriosEvaluacion: ['EFI.1.1.a', 'EFI.1.2.b'],
    faseIdeal: 'Inicial',
    descripcion:
      'Los niños corren libremente. El profesor muestra tarjetas verdes (frutas/verduras = correr a ritmo), amarillas (pan/arroz = trote suave o sentadillas) o rojas (ultraprocesados = congelarse en equilibrio).',
    atencionDiversidad:
      'Acompañar las tarjetas de color con gestos sonoros y corporales bien definidos.',
    materiales: ['Tarjetas grandes con imágenes de alimentos y colores del semáforo'],
  },
  {
    id: 'sal-02',
    nombre: 'Circuito FITT de Resistencia y Fuerza en Postas',
    tematica: 'Hábitos Saludables y Condición Física Lúdica',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.1 - Estilo de vida activo y saludable',
    criteriosEvaluacion: ['EFI.3.1.1.b', 'EFI.3.1.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Postas de 1 minuto de trabajo por 30s de descanso: 1) Salto a la comba, 2) Plancha abdominal en colchoneta, 3) Escaleras de agilidad, 4) Pases con balón medicinal liviano, 5) Autotoma de pulsaciones.',
    atencionDiversidad:
      'Grados de dificultad en cada posta (ej: plancha con rodillas apoyadas o normales). Carteles explicativos con pictogramas en cada estación.',
    materiales: ['Colchonetas', 'Combas', 'Escaleras de agilidad', 'Reloj con cronómetro/pizarra de pulso'],
  },
  {
    id: 'sal-03',
    nombre: 'El Relevo de la Pirámide Nutricional',
    tematica: 'Hábitos Saludables y Condición Física Lúdica',
    ciclo: 'Segundo Ciclo',
    conexionCurricular: 'CE.EF.1 - Estilo de vida activo y saludable',
    criteriosEvaluacion: ['EFI.2.1.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Carrera de relevos por equipos. Cada corredor coge una tarjeta de alimento de su cajón y debe colocarla en el escalón correspondiente de una pirámide dibujada en la pared.',
    atencionDiversidad:
      'Variar distancias de carrera. Permitir consultar el panel orientativo en equipo.',
    materiales: ['Tarjetas de alimentos plastificadas', 'Mural con la Pirámide Nutricional en pared'],
  },

  // ==========================================
  // TEMÁTICA: ACROSPORT Y HABILIDADES GIMNÁSTICAS
  // ==========================================
  {
    id: 'acr-01',
    nombre: 'Los Transportistas de la Jungla y Rodamientos',
    tematica: 'Acrosport y Habilidades Gimnásticas',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.2.2.b', 'EFI.2.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Circuitos de volteos seguros (voltereta adelante en plano inclinado), cuadrupedias, reptiles y pasos en banco sueco manteniendo el equilibrio con sacos de arena en la cabeza.',
    atencionDiversidad:
      'Ayudas manuales del profesor/compañero en volteos. Ajuste de altura en los bancos.',
    materiales: ['Quitamiedos y colchonetas', 'Planos inclinados de gomaespuma', 'Bancos suecos'],
  },
  {
    id: 'acr-02',
    nombre: 'Figuras de Acrosport Cooperativo en Tríos y Cuartetos',
    tematica: 'Acrosport y Habilidades Gimnásticas',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.3.4.3.b', 'EFI.3.3.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Construcción de pirámides humanas básicas (de 3 a 5 personas) respetando roles estrictos: Ágil, Portador y Ayudante/Observador de seguridad, manteniendo 5 segundos.',
    atencionDiversidad:
      'Asignar roles según preferencia y biotipo del alumnado. Hoja de seguridad impresos con apoyo de zonas prohibidas de apriete (lumbares vs pelvis).',
    materiales: ['Fichas de figuras Acrosport A4', 'Colchonetas de densidad alta'],
  },
  {
    id: 'acr-03',
    nombre: 'Montaje de Circo y Malabares con Telas',
    tematica: 'Acrosport y Habilidades Gimnásticas',
    ciclo: 'Segundo Ciclo',
    conexionCurricular: 'CE.EF.4 - Manifestaciones de la cultura motriz',
    criteriosEvaluacion: ['EFI.2.4.3.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Evolución de malabares con pañuelos de seda/telas y pelotas de foam (lanzamientos de 1 y 2 elementos en cruz) para crear una pequeña rutina circense musical.',
    atencionDiversidad:
      'Las telas caen lentamente facilitando la anticipación visual y motriz.',
    materiales: ['Pañuelos de seda de colores', 'Pelotas de malabares suaves', 'Altavoz'],
  },

  // ==========================================
  // TEMÁTICA: JUEGOS DE RED Y MURO
  // ==========================================
  {
    id: 'red-01',
    nombre: 'Mini-Bádminton con Globos y Palas de Plástico',
    tematica: 'Juegos de Red y Muro (Bádminton / Padel / Pickleball)',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.2.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Intercambiar un globo de helio o de aire golpeándolo con una pala de plástico por encima de una cinta elástica colocada a 1 metro de altura.',
    atencionDiversidad:
      'Aumentar o reducir el peso del globo llenándolo con un poco de agua o aire. Usar palas con cinta de muñeca de seguridad.',
    materiales: ['Globos de colores', 'Palas de playa/plástico', 'Cinta elástica o red baja'],
  },
  {
    id: 'red-02',
    nombre: 'Pickleball / Paladós Modificado en Duplas',
    tematica: 'Juegos de Red y Muro (Bádminton / Padel / Pickleball)',
    ciclo: 'Tercer Ciclo',
    conexionCurricular: 'CE.EF.2 - Resolución de problemas en situaciones motrices',
    criteriosEvaluacion: ['EFI.3.2.2.b', 'EFI.3.3.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Partido 2 contra 2 en minicanchas con palas rígidas y pelota perforada o de espuma. Regla de "no volea" en la zona cercana a la red para favorecer los peloteos largos.',
    atencionDiversidad:
      'Permitir un bote extra antes del golpeo si fuera necesario. Redes regulables en altura.',
    materiales: ['Palas de Pickleball / paladós', 'Pelotas perforadas', 'Redes portátiles'],
  },

  // ==========================================
  // TEMÁTICA: DESAFÍOS COOPERATIVOS Y RETOS MOTORES
  // ==========================================
  {
    id: 'cop-01',
    nombre: 'Cruzar el Río de Ácido en Equipo',
    tematica: 'Desafíos Cooperativos y Retos Motores',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.3 - Autorregulación emocional e interacción social',
    criteriosEvaluacion: ['EFI.3.2.b', 'EFI.2.3.1.b', 'EFI.3.3.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Todo el grupo debe cruzar una franja de 15 metros sin tocar el suelo, apoyándose únicamente en 4 picas y 3 aros que deben ir transportando en equipo.',
    atencionDiversidad:
      'Opciones de material extra según la complejidad requerida. Roles de diseñador táctico en la asamblea previa.',
    materiales: ['Aros de colores', 'Ladrillos o pivotes de plástico', 'Bancos o picas'],
  },
  {
    id: 'cop-02',
    nombre: 'El Paracaídas Gigante y la Ola Andaluza',
    tematica: 'Desafíos Cooperativos y Retos Motores',
    ciclo: 'Primer Ciclo',
    conexionCurricular: 'CE.EF.3 - Autorregulación emocional e interacción social',
    criteriosEvaluacion: ['EFI.3.1.b', 'EFI.3.2.b'],
    faseIdeal: 'Inicial',
    descripcion:
      'Agarrando el paracaídas por el borde, todos coordinan movimientos verticales para elevarlo, hacer pasar a compañeros por debajo o hacer botar balones sin que caigan.',
    atencionDiversidad:
      'Agarres adaptados con ganchos o nudos para mejor sujeción.',
    materiales: ['Paracaídas de tela de 6 metros', 'Pelotas de espuma picadas'],
  },

  // ==========================================
  // ACTIVIDADES DE VUELTA A LA CALMA Y EVALUACIÓN
  // ==========================================
  {
    id: 'cal-01',
    nombre: 'El Masaje del Viento en la Sierra',
    tematica: 'Hábitos Saludables y Condición Física Lúdica',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.1 - Estilo de vida activo y saludable',
    criteriosEvaluacion: ['EFI.1.3.b', 'EFI.2.1.2.b', 'EFI.3.1.2.b'],
    faseIdeal: 'Vuelta a la Calma',
    descripcion:
      'Sentados en hilera o por parejas con música relajante, realizan masajes suaves en la espalda con pelotas de tenis o picos de foam mientras respiran pausadamente.',
    atencionDiversidad:
      'Controlar la intensidad del contacto. Entorno de baja iluminación o libre de ruido excesivo.',
    materiales: ['Pelotas de tenis o sensoriales', 'Música ambiental suave'],
  },
  // ==========================================
  // TEMÁTICAS UNIVERSALES Y DEPORTES GENERALES (NEUTROS)
  // ==========================================
  {
    id: 'dep-01',
    nombre: 'Relevos de Precisión y Desplazamientos Rápidos',
    tematica: 'Deportes de Equipo e Iniciación Deportiva',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.2 - Resolución de situaciones motrices',
    criteriosEvaluacion: ['EFI.2.1.b', 'EFI.2.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'En 4 equipos, los alumnos realizan desplazamientos variados (sprint, bote de balón, pase) hasta la zona de meta para anotar un objetivo de precisión en equipo.',
    atencionDiversidad:
      'DUA: Adaptación de distancias de tiro y tamaño de pelotas para garantizar el éxito.',
    materiales: ['Conos', 'Balones de baloncesto/balonmano', 'Aros'],
  },
  {
    id: 'par-01',
    nombre: 'Circuito de Parkour Urbano y Saltos Seguros',
    tematica: 'Parkour, Acrosport y Retos Gimnásticos',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.2 - Control corporal y resolución de problemas motores',
    criteriosEvaluacion: ['EFI.2.1.b', 'EFI.3.2.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Circuito continuo con recepción sobre colchonetas, apoyos en plinto, pasavallas suaves y equilibrios sobre bancos suecos.',
    atencionDiversidad:
      'DUA: Recorridos alternativos con diferente altura y apoyos de sujeción docente.',
    materiales: ['Colchonetas', 'Bancos suecos', 'Quitamiedos', 'Picas'],
  },
  {
    id: 'exp-neu-01',
    nombre: 'Esculturas en Acción y Mímica en Grupo',
    tematica: 'Expresión Corporal y Danza',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.4 - Expresión y comunicación corporal',
    criteriosEvaluacion: ['EFI.4.1.b', 'EFI.4.2.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Por pequeños grupos, los estudiantes representan situaciones de la vida diaria, deportes o animales usando el cuerpo sin hablar para que los demás lo adivinen.',
    atencionDiversidad:
      'DUA: Tarjetas con pictogramas e ideas de apoyo para la representación.',
    materiales: ['Altavoz', 'Tarjetas con retos expresivos'],
  },
  {
    id: 'atl-01',
    nombre: 'Desafío de Saltos, Lanzamientos y Velocidad',
    tematica: 'Habilidades Motrices Básicas y Genéricas',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.2 - Habilidades motrices básicas',
    criteriosEvaluacion: ['EFI.2.1.b'],
    faseIdeal: 'Principal',
    descripcion:
      'Estaciones rotativas de salto de longitud con pies juntos, lanzamiento de jabalina de gomaespuma y carrera de agilidad en zigzag.',
    atencionDiversidad:
      'DUA: Zonas de lanzamiento adaptadas y marcas visuales en el suelo.',
    materiales: ['Jabalinas de espuma', 'Cintas métricas', 'Conos', 'Huellas'],
  },
  {
    id: 'cal-02',
    nombre: 'La Diana de Autoevaluación y Semáforo Emocional',
    tematica: 'Desafíos Cooperativos y Retos Motores',
    ciclo: 'Todos',
    conexionCurricular: 'CE.EF.3 - Autorregulación emocional e interacción social',
    criteriosEvaluacion: ['EFI.3.1.b', 'EFI.2.3.1.b', 'EFI.3.3.2.b'],
    faseIdeal: 'Vuelta a la Calma',
    descripcion:
      'En asamblea, cada alumno coloca un gomet o ficha en la diana según su nivel de esfuerzo, cumplimiento del juego limpio y cómo se ha sentido en la sesión.',
    atencionDiversidad:
      'Iconos de caritas para facilitar la expresión emocional a alumnado no verbal o TEA.',
    materiales: ['Mural de Diana de Evaluación impreso', 'Gomets de colores', 'Rotuladores'],
  },
];
