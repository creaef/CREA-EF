import { useState, useEffect } from 'react';

export interface ColorTheme {
  id: string;
  optionLabel: string; // 'OPCIÓN 1', 'OPCIÓN 2', 'OPCIÓN 3'
  name: string; // 'The Balanced Academic-Athletic', etc.
  focusLabel: string; // 'Foco en Equilibrio', 'Foco en Alta Energía', etc.
  description: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  greenHex: string;
  motifs: string[]; // e.g. ['Cronómetro', 'Libros Apilados', 'Atleta Saltando', 'Laurel']
  typographyStyle: string; // e.g. 'Sans-Serif Limpia / Crea (amigable) + Ef (estructurado)'
  badgeBg: string;
  headerBgClass: string;
  bodyBgClass: string;
  heroTextGradient: string;
  buttonClass: string;
  cardBgClass: string;
  activeBorderClass: string;
  docHeaderBg: string;
  docHeaderColor: string;
  docAccentBorder: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'option_1_balanced',
    optionLabel: 'OPCIÓN 1',
    name: 'The Balanced Academic-Athletic',
    focusLabel: 'Foco en Equilibrio',
    description: 'Diseño limpio y equilibrado sobre fondo claro neutro. Utiliza Naranja Vibrante y Azul-Teal Marino como acentos principales. Tarjetas bien estructuradas para Situaciones de Aprendizaje y Tareas.',
    primaryHex: '#0D47A1', // Azul-Teal Marino
    secondaryHex: '#FF8A65', // Naranja Vibrante
    accentHex: '#0284C7', // Azul Cielo
    greenHex: '#2E7D32', // Verde Bosque
    motifs: ['Cronómetro Equilibrado', 'Tarjetas Claras', 'Iconografía Ágil'],
    typographyStyle: 'Inter / Plus Jakarta Sans (Crea: Amigable, -Ef: Estructurada)',
    badgeBg: 'bg-blue-900/10 text-blue-800 border-blue-300',
    headerBgClass: 'bg-white/95 border-slate-300 text-slate-900 shadow-sm',
    bodyBgClass: 'bg-slate-200 text-slate-900',
    heroTextGradient: 'from-blue-900 via-sky-600 to-orange-600',
    buttonClass: 'bg-blue-800 hover:bg-blue-900 text-white font-bold shadow-md shadow-blue-800/20',
    cardBgClass: 'bg-white border-slate-200 shadow-sm',
    activeBorderClass: 'border-blue-700 ring-2 ring-blue-700/20',
    docHeaderBg: '#0D47A1',
    docHeaderColor: '#FFFFFF',
    docAccentBorder: '#FF8A65',
  },
  {
    id: 'option_2_dynamic',
    optionLabel: 'OPCIÓN 2',
    name: 'The Dynamic Athletic High-Energy',
    focusLabel: 'Foco en Alta Energía',
    description: 'Diseño con fondo azul marino profundo (#0A2240). Utiliza Naranja vibrante para botones de acción principal y barras de progreso. Los motivos del atleta corriendo y el cronómetro son prominentes.',
    primaryHex: '#0A2240', // Azul Marino Profundo
    secondaryHex: '#E85D04', // Naranja Atlético
    accentHex: '#0284C7', // Turquesa / Azul Cielo
    greenHex: '#007A33', // Verde Andalucía
    motifs: ['Atleta Saltando', 'Cronómetro Deportivo', 'Antorcha Olímpica'],
    typographyStyle: 'Montserrat / Outfit (Estilo Atlético y Dinámico)',
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    headerBgClass: 'bg-slate-950/90 border-slate-800 text-white shadow-xl',
    bodyBgClass: 'bg-slate-900 text-slate-100',
    heroTextGradient: 'from-orange-500 via-amber-400 to-sky-400',
    buttonClass: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-lg shadow-orange-500/25',
    cardBgClass: 'bg-slate-800/80 border-slate-700 shadow-lg',
    activeBorderClass: 'border-orange-500 ring-2 ring-orange-500/20',
    docHeaderBg: '#0A2240',
    docHeaderColor: '#FFFFFF',
    docAccentBorder: '#E85D04',
  },
  {
    id: 'option_3_structured',
    optionLabel: 'OPCIÓN 3',
    name: 'The Structured Education-First',
    focusLabel: 'Foco en Estructura Educativa',
    description: 'Diseño estructurado en cuadrícula académica. Utiliza Verde Bosque (#2E7D32) como cabecera institucional de secciones, respaldado por libros apilados, laureles y birrete académico.',
    primaryHex: '#2E7D32', // Verde Bosque
    secondaryHex: '#0D47A1', // Azul Educativo
    accentHex: '#F59E0B', // Oro Laureles
    greenHex: '#007A33', // Verde Andalucía
    motifs: ['Libros Apilados', 'Rama de Laurel', 'Birrete Académico'],
    typographyStyle: 'Lexend / Source Sans Pro (Legibilidad Académica)',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    headerBgClass: 'bg-emerald-950/95 border-emerald-800 text-white shadow-md',
    bodyBgClass: 'bg-emerald-950/20 text-slate-100',
    heroTextGradient: 'from-emerald-400 via-teal-300 to-amber-400',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20',
    cardBgClass: 'bg-slate-900/90 border-emerald-900/50 shadow-md',
    activeBorderClass: 'border-emerald-500 ring-2 ring-emerald-500/20',
    docHeaderBg: '#2E7D32',
    docHeaderColor: '#FFFFFF',
    docAccentBorder: '#0D47A1',
  },
];

const THEME_STORAGE_KEY = 'creaef_selected_theme_id';

export function getStoredTheme(): ColorTheme {
  // Permanently use Option 2: The Dynamic Athletic High-Energy (#0A2240 navy, #E85D04 orange)
  return COLOR_THEMES[1];
}

export function saveTheme(themeId: string) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(new Event('creaef_theme_changed'));
  } catch (e) {}
}

export function useColorTheme() {
  const [theme, setTheme] = useState<ColorTheme>(getStoredTheme());

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(getStoredTheme());
    };
    window.addEventListener('creaef_theme_changed', handleThemeChange);
    return () => window.removeEventListener('creaef_theme_changed', handleThemeChange);
  }, []);

  const changeTheme = (themeId: string) => {
    saveTheme(themeId);
    setTheme(getStoredTheme());
  };

  return { theme, changeTheme, themes: COLOR_THEMES };
}
