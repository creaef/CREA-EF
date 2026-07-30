import React, { useState } from 'react';
import { Layout, Users, Sparkles, MapPin, Edit3, Check, Image as ImageIcon, Link as LinkIcon, Search, EyeOff, FileText, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { renderOfficialDocumentHeaderHtml } from '../utils/documentHeader';

interface ActivityGraphicDiagramProps {
  nombreJuego: string;
  esquemaGrafico?: string;
  materiales?: string[];
  imageUrl?: string;
  onUpdateEsquema?: (nuevoEsquema: string) => void;
  onUpdateImageUrl?: (url: string) => void;
}

// Stick figure SVG component (Muñeco de Educación Física)
const StickPuppet: React.FC<{
  colorShirt: string;
  headColor: string;
  hasStick?: boolean;
  hasBall?: boolean;
  label?: string;
  facingLeft?: boolean;
}> = ({ colorShirt, headColor, hasStick = false, hasBall = false, label, facingLeft = false }) => (
  <div className="flex flex-col items-center select-none group cursor-pointer transform hover:scale-110 transition">
    <svg className="w-9 h-11 drop-shadow-sm" viewBox="0 0 40 50">
      {/* Head */}
      <circle cx="20" cy="10" r="6" fill={headColor} stroke="#0f172a" strokeWidth="1.5" />
      {/* Eye & beak direction */}
      <circle cx={facingLeft ? "17" : "23"} cy="9" r="1.2" fill="#0f172a" />
      <polygon points={facingLeft ? "14,10 10,9 14,11" : "26,10 30,9 26,11"} fill="#f59e0b" />

      {/* Body / Shirt */}
      <rect x="15" y="17" width="10" height="15" rx="1.5" fill={colorShirt} stroke="#0f172a" strokeWidth="1.5" />

      {/* Stick arms / legs */}
      <path d="M 15 21 L 8 28 M 25 21 L 32 28" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 18 32 L 14 44 M 22 32 L 26 44" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />

      {/* Hockey/Racket Stick */}
      {hasStick && (
        <path d={facingLeft ? "M 10 28 L 6 42 L 2 40" : "M 30 28 L 34 42 L 38 40"} stroke="#854d0e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      )}

      {/* Ball near puppet */}
      {hasBall && (
        <circle cx={facingLeft ? "6" : "34"} cy="42" r="3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
      )}
    </svg>
    {label && (
      <span className="text-[9px] font-black px-1 py-0.2 bg-white/90 text-slate-800 rounded border border-slate-300 shadow-2xs mt-0.5">
        {label}
      </span>
    )}
  </div>
);

export const ActivityGraphicDiagram: React.FC<ActivityGraphicDiagramProps> = ({
  nombreJuego,
  esquemaGrafico,
  materiales = [],
  imageUrl: initialImageUrl = '',
  onUpdateEsquema,
  onUpdateImageUrl,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'image' | 'none'>('canvas');
  const [customImageUrl, setCustomImageUrl] = useState(initialImageUrl);
  const [esquemaText, setEsquemaText] = useState(
    esquemaGrafico || 'Pista delimitada con conos en las esquinas, 2 filas de alumnos con petos diferenciados enfrentados y zona central de paso.'
  );
  const [fieldType, setFieldType] = useState<'pabellon' | 'circuito' | 'paredon' | 'porteria' | 'rondo'>('pabellon');

  const handleSaveText = () => {
    setIsEditing(false);
    if (onUpdateEsquema) {
      onUpdateEsquema(esquemaText);
    }
  };

  const handleApplyImageUrl = (url: string) => {
    setCustomImageUrl(url);
    if (onUpdateImageUrl) {
      onUpdateImageUrl(url);
    }
  };

  const handleDownloadGameCard = () => {
    const container = document.createElement('div');
    container.style.padding = '30px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = '#0f172a';
    container.style.lineHeight = '1.6';

    container.innerHTML = `
      ${renderOfficialDocumentHeaderHtml('FICHA TÉCNICA Y CARNET DE JUEGO EF', 'JUEGO-EF-2026')}
      <div style="border: 3px solid #312e81; border-radius: 12px; padding: 24px; background: #ffffff;">
        <div style="background: #1e1b4b; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
          <span style="background: #f59e0b; color: #0f172a; padding: 3px 10px; border-radius: 4px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">FICHA TÉCNICA DEL JUEGO / CARNET DE ACTIVIDAD EF</span>
          <h1 style="margin: 8px 0 0 0; font-size: 18px; font-weight: 800; color: #ffffff; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.35; display: block; clear: both;">${nombreJuego || 'Actividad de Educación Física'}</h1>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <strong style="color: #312e81; font-size: 12px; display: block; margin-bottom: 4px;">📦 MATERIALES REQUERIDOS:</strong>
            <p style="margin: 0; font-size: 13px; color: #334155;">${materiales.length > 0 ? materiales.join(', ') : 'Materiales habituales de EF (picas, conos, petos, balones)'}</p>
          </div>
          <div style="flex: 1; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <strong style="color: #312e81; font-size: 12px; display: block; margin-bottom: 4px;">📍 ORGANIZACIÓN ESPACIAL Y CONSIGNAS:</strong>
            <p style="margin: 0; font-size: 13px; color: #334155;">${esquemaText}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px; background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #312e81;">
          <strong style="color: #1e1b4b; font-size: 13px; display: block; margin-bottom: 6px;">🏃 DESARROLLO Y REGLAS DEL JUEGO:</strong>
          <p style="margin: 0; font-size: 13px; color: #334155; leading-height: 1.6;">
            Propuesta motriz activa e inclusiva. El alumnado participa en equipos/grupos cooperativos promoviendo la toma de decisiones, la estrategia colectiva, el respeto a las normas y la autonomía motriz.
          </p>
        </div>

        <div style="border-top: 2px dashed #cbd5e1; margin-top: 20px; padding-top: 18px;">
          <strong style="color: #312e81; font-size: 12px; display: block; margin-bottom: 10px;">📋 REGISTRO DE DESEMPEÑO Y AUTOEVALUACIÓN DEL ALUMNADO:</strong>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #e2e8f0; color: #1e1b4b;">
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Criterio / Indicador de Juego</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 80px; font-weight: bold;">Consigue</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 80px; font-weight: bold;">En Proceso</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px; color: #334155;">Comprende las normas y participa activamente con fair play</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 14px; color: #94a3b8;">[  ]</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 14px; color: #94a3b8;">[  ]</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px; color: #334155;">Resuelve eficazmente las situaciones motrices y colabora en grupo</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 14px; color: #94a3b8;">[  ]</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 14px; color: #94a3b8;">[  ]</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Ficha_Juego_${(nombreJuego || 'Actividad').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(container).save();
  };

  return (
    <div className="mt-3.5 p-4 bg-white text-slate-900 rounded-2xl border-2 border-indigo-200 shadow-xs space-y-3 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Layout className="w-4 h-4 text-indigo-700" />
          <span className="font-extrabold text-xs text-indigo-950 tracking-wide uppercase">
            🎨 Esquema Visual y Organización Espacial
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
              activeTab === 'canvas'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3 h-3 text-amber-400" />
            <span>Diagrama Muñecos EF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
              activeTab === 'image'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-amber-400" />
            <span>Captura / Imagen Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('none')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
              activeTab === 'none'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <EyeOff className="w-3 h-3 text-amber-400" />
            <span>Sin Esquema (Descripción Ampliada)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VECTOR DIAGRAM CANVAS WITH MUÑECOS (LIGHT BACKGROUND) */}
      {activeTab === 'canvas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-extrabold text-slate-700">Diseño Táctico de Pista:</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as any)}
              className="bg-slate-50 text-indigo-950 font-extrabold border border-indigo-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-600 outline-none"
            >
              <option value="pabellon">🏟️ 2 Equipos Enfrentados (Pabellón)</option>
              <option value="circuito">🏃 Circuito / Estaciones Motrices</option>
              <option value="paredon">🎾 Paredón / Pista Dividida</option>
              <option value="porteria">🥅 Ataque-Defensa en Portería</option>
              <option value="rondo">🟢 Rondo / Círculo Colectivo</option>
            </select>
          </div>

          {/* CANVAS BOARD - LIGHT BACKGROUND */}
          <div className="relative w-full h-44 rounded-xl border-2 border-slate-300 bg-amber-50/20 overflow-hidden p-3 select-none shadow-inner flex flex-col justify-between">
            {/* Court Line Markings */}
            <div className="absolute inset-2 border-2 border-slate-400/50 rounded-lg pointer-events-none">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-400/50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-slate-400/50" />
            </div>

            {/* TOP BAR LEGEND */}
            <div className="relative z-10 flex items-center justify-between text-[11px] font-extrabold">
              <div className="flex items-center space-x-2 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                <span className="text-sky-950">Equipo Azul</span>
              </div>

              <div className="bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs flex items-center space-x-1">
                <span className="text-xs">🔺</span>
                <span>Conos / Delimitadores</span>
              </div>

              <div className="flex items-center space-x-2 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-rose-950">Equipo Rojo</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              </div>
            </div>

            {/* CENTER GRAPHIC LAYOUT WITH MUÑECOS */}
            <div className="relative z-10 my-auto w-full">
              {fieldType === 'pabellon' && (
                <div className="flex items-center justify-between px-4 sm:px-10">
                  {/* Left Cones + Team A Puppets */}
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs">🔺</span>
                      <span className="text-xs">🔺</span>
                    </div>
                    <div className="flex space-x-1">
                      <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" label="A1" />
                      <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" hasStick label="A2" />
                    </div>
                  </div>

                  {/* Pass trajectory arrow & Game Title Badge */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      ⚽ Ball Pass / Trayectoria ➔
                    </span>
                    <span className="text-[11px] font-black text-indigo-950 mt-1 max-w-[160px] truncate text-center bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                      {nombreJuego || 'Zona de Juego'}
                    </span>
                  </div>

                  {/* Right Cones + Team B Puppets */}
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <StickPuppet colorShirt="#e11d48" headColor="#fecdd3" hasStick facingLeft label="B1" />
                      <StickPuppet colorShirt="#e11d48" headColor="#fecdd3" facingLeft label="B2" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs">🔺</span>
                      <span className="text-xs">🔺</span>
                    </div>
                  </div>
                </div>
              )}

              {fieldType === 'circuito' && (
                <div className="flex items-center justify-around px-2 text-[10px] font-bold">
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                    <span className="text-indigo-900 font-extrabold mb-0.5">Estación 1: Saltos</span>
                    <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" hasStick />
                    <span className="text-[9px] text-slate-500">🧱 Bancos suecos</span>
                  </div>

                  <span className="text-amber-600 font-black text-base">➔</span>

                  <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                    <span className="text-indigo-900 font-extrabold mb-0.5">Estación 2: Giro</span>
                    <StickPuppet colorShirt="#16a34a" headColor="#bbf7d0" />
                    <span className="text-[9px] text-slate-500">🧘 Colchonetas</span>
                  </div>

                  <span className="text-amber-600 font-black text-base">➔</span>

                  <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                    <span className="text-indigo-900 font-extrabold mb-0.5">Estación 3: Sprint</span>
                    <StickPuppet colorShirt="#e11d48" headColor="#fecdd3" facingLeft />
                    <span className="text-[9px] text-slate-500">🔺 Conos Zigzag</span>
                  </div>
                </div>
              )}

              {fieldType === 'paredon' && (
                <div className="flex items-center justify-between px-8">
                  {/* Left Player */}
                  <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" hasStick label="Jugador A" />

                  {/* Net / Wall in middle */}
                  <div className="flex flex-col items-center border-x-2 border-indigo-900 px-4 py-1 bg-indigo-50/80 rounded">
                    <span className="text-xs font-black text-indigo-950">🧱 RED / PAREDÓN</span>
                    <span className="text-[10px] font-bold text-amber-700">🎾 Golpeo sin bote</span>
                  </div>

                  {/* Right Player */}
                  <StickPuppet colorShirt="#e11d48" headColor="#fecdd3" hasStick facingLeft label="Jugador B" />
                </div>
              )}

              {fieldType === 'porteria' && (
                <div className="flex items-center justify-around px-6">
                  {/* Attacker */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-extrabold text-sky-800">Atacante</span>
                    <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" hasBall label="Chutador" />
                  </div>

                  <span className="text-amber-600 font-black text-lg">🏹 ➔ ⚽</span>

                  {/* Goalkeeper + Goal */}
                  <div className="flex items-center space-x-2 bg-white/90 p-2 rounded-xl border-2 border-slate-400">
                    <span className="text-lg">🥅</span>
                    <StickPuppet colorShirt="#eab308" headColor="#fef08a" facingLeft label="Portero" />
                  </div>
                </div>
              )}

              {fieldType === 'rondo' && (
                <div className="flex items-center justify-center space-x-4">
                  <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" />
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-400 flex items-center justify-center bg-white/80">
                    <StickPuppet colorShirt="#e11d48" headColor="#fecdd3" label="Centro" />
                  </div>
                  <StickPuppet colorShirt="#0284c7" headColor="#bae6fd" facingLeft />
                </div>
              )}
            </div>

            {/* BOTTOM FOOTER */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-300 pt-1 font-semibold">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-indigo-600" />
                <span>Pizarra Táctica EF de Disposición Espacial</span>
              </span>
              <span className="text-indigo-900 font-bold italic">
                {materiales.length > 0 ? `Material: ${materiales.slice(0, 3).join(', ')}` : 'Materiales de EF'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE IMAGES / CUSTOM IMAGE CAPTURE URL */}
      {activeTab === 'image' && (
        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pegar URL de Imagen / Esquema Gráfico (Google Imágenes o Drive):</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Ej: https://.../imagen_esquema_juego.png"
                className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-indigo-600 font-medium"
              />
              <button
                type="button"
                onClick={() => handleApplyImageUrl(customImageUrl)}
                className="px-3 py-1.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Sample Preset Image Schematics */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-600">
              O selecciona un modelo gráfico precargado con muñecos:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '🏑 Hockey / Palas', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=60' },
                { label: '🏀 Circuito / Baloncesto', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60' },
                { label: '⚽ Portería / Tiro', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60' },
                { label: '🏃 Carreras / Relevos', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60' },
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyImageUrl(sample.url)}
                  className="p-1.5 bg-white border border-slate-300 hover:border-indigo-600 rounded-lg text-[10px] font-bold text-slate-800 text-center hover:bg-indigo-50 transition shadow-2xs"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Display Rendered Image */}
          {customImageUrl && (
            <div className="mt-2 relative rounded-xl border border-slate-300 overflow-hidden bg-black/5 flex justify-center max-h-48">
              <img
                src={customImageUrl}
                alt="Captura gráfica del juego"
                className="object-contain max-h-48 w-full"
                onError={() => alert('No se pudo cargar la imagen desde la URL facilitada.')}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NO GRAPHIC SCHEME NEEDED - EXTENDED DESCRIPTION */}
      {activeTab === 'none' && (
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold">
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sin esquema gráfico obligatorio (Juego con dinámica conceptual / espacio flexible)</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Este juego no requiere representación táctica en pista. La descripción textual explicativa del desarrollo, consignas y variantes se detalla de forma extensa en la sesión.
          </p>
        </div>
      )}

      {/* TEXT DESCRIPTION & EDITING */}
      <div className="pt-1 space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-indigo-900">
              Modificar organización espacial y reglas de disposición:
            </label>
            <textarea
              rows={2}
              value={esquemaText}
              onChange={(e) => setEsquemaText(e.target.value)}
              className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-indigo-300 focus:border-indigo-600 font-medium bg-slate-50"
            />
            <button
              type="button"
              onClick={handleSaveText}
              className="px-3.5 py-1.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition"
            >
              Guardar Organización
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200">
            <p className="text-xs text-slate-800 leading-relaxed font-medium flex-1">
              <strong className="text-indigo-950 font-bold">Organización Espacial: </strong>
              {esquemaText}
            </p>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-indigo-700 transition"
                title="Editar organización"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDownloadGameCard}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs transition shadow-2xs flex items-center space-x-1"
                title="Descargar Ficha / Carnet del Juego en PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Descargar Ficha/Carnet Juego</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
