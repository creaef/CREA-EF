import React, { useState } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
  ClipboardCheck,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { InstrumentoEvaluacion, ElementoRubrica } from '../types';
import { CRITERIOS_EVALUACION_EF } from '../data/curriculumData';
import { renderOfficialDocumentHeaderHtml } from '../utils/documentHeader';

interface Step8Props {
  evaluacionInicial: string;
  setEvaluacionInicial: (v: string) => void;
  instrumentosSeleccionados?: string[];
  setInstrumentosSeleccionados?: (v: string[]) => void;
  instrumentosEvaluacion: InstrumentoEvaluacion[];
  setInstrumentosEvaluacion: (v: InstrumentoEvaluacion[]) => void;
  criteriosSeleccionados: string[];
  tematica?: string;
  curso?: string;
  rubrica: ElementoRubrica[];
  setRubrica: (v: ElementoRubrica[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

const OPCIONES_INSTRUMENTOS = [
  'Rúbrica de Evaluación Criterial (4 Niveles)',
  'Lista de Cotejo / Checklist de Desempeño Motriz',
  'Escala de Observación Directa en Clase',
  'Diana de Autoevaluación del Alumnado',
  'Cuaderno de Campo / Registro Anecdótico Docente',
  'Ficha de Coevaluación entre Iguales',
];

export const Step8Evaluation: React.FC<Step8Props> = ({
  evaluacionInicial,
  setEvaluacionInicial,
  instrumentosSeleccionados = [],
  setInstrumentosSeleccionados,
  instrumentosEvaluacion,
  setInstrumentosEvaluacion,
  criteriosSeleccionados,
  tematica = 'General',
  curso = 'Primaria',
  rubrica,
  setRubrica,
  onPrev,
  onNext,
}) => {
  const [selectedTools, setSelectedTools] = useState<string[]>(
    instrumentosSeleccionados.length > 0 ? instrumentosSeleccionados : [OPCIONES_INSTRUMENTOS[0], OPCIONES_INSTRUMENTOS[1]]
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingInitialAi, setLoadingInitialAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  const toggleTool = (toolName: string) => {
    let next: string[];
    if (selectedTools.includes(toolName)) {
      next = selectedTools.filter((t) => t !== toolName);
    } else {
      next = [...selectedTools, toolName];
    }
    setSelectedTools(next);
    if (setInstrumentosSeleccionados) setInstrumentosSeleccionados(next);
  };

  const handleGenerateEvaluationAI = async () => {
    setErrorAi(null);
    setLoadingAi(true);

    try {
      // 1. Generate Evaluation Tools based on tematica and criterios
      const resTools = await fetch('/api/ai/generate-evaluation-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedInstrumentTypes: selectedTools,
          tematica,
          criteriosSeleccionados,
          curso,
        }),
      });

      const dataTools = await resTools.json();
      if (!resTools.ok) throw new Error(dataTools.error || 'Error al generar los instrumentos de evaluación.');

      if (dataTools.instrumentos && Array.isArray(dataTools.instrumentos)) {
        setInstrumentosEvaluacion(dataTools.instrumentos);
      }

      // 2. Generate Rubric if requested
      if (selectedTools.includes('Rúbrica de Evaluación Criterial (4 Niveles)') && criteriosSeleccionados.length > 0) {
        const payloadCriterios = criteriosSeleccionados.map((cod) => {
          const obj = CRITERIOS_EVALUACION_EF.find((c) => c.codigo === cod || c.id === cod);
          return {
            codigo: cod,
            descripcion: obj ? obj.descripcion : 'Criterio de evaluación de EF',
          };
        });

        const resRubric = await fetch('/api/ai/generate-rubric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ criterios: payloadCriterios }),
        });

        const dataRubric = await resRubric.json();
        if (dataRubric.rubrica && Array.isArray(dataRubric.rubrica)) {
          setRubrica(dataRubric.rubrica);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorAi(err.message || 'Error al generar la evaluación con IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDownloadEvaluationWord = () => {
    let rubricHtml = '';
    if (rubrica && rubrica.length > 0) {
      rubricHtml = `
        <h2 style="color: #1e1b4b; border-bottom: 2px solid #312e81; padding-bottom: 5px; margin-top: 25px;">
          Rúbrica de Evaluación Criterial (4 Niveles)
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;" border="1">
          <thead>
            <tr style="background-color: #e0e7ff; color: #1e1b4b; font-weight: bold;">
              <th style="padding: 10px; font-size: 11pt; color: #1e1b4b;">Criterio / Descriptor</th>
              <th style="padding: 10px; font-size: 11pt; color: #1e1b4b;">Nivel 1 (Insuficiente)</th>
              <th style="padding: 10px; font-size: 11pt; color: #1e1b4b;">Nivel 2 (Suficiente)</th>
              <th style="padding: 10px; font-size: 11pt; color: #1e1b4b;">Nivel 3 (Notable)</th>
              <th style="padding: 10px; font-size: 11pt; color: #1e1b4b;">Nivel 4 (Sobresaliente)</th>
            </tr>
          </thead>
          <tbody>
            ${rubrica
              .map(
                (r) => `
              <tr>
                <td style="padding: 10px; font-weight: bold; font-size: 10pt; background-color: #f1f5f9;">
                  ${r.criterioCodigo}<br>${r.criterioTexto}
                </td>
                ${r.niveles
                  .map(
                    (n) => `
                  <td style="padding: 8px; font-size: 9.5pt; vertical-align: top;">
                    <strong style="color: #4338ca;">${n.nivel}</strong><br>${n.descriptor}
                  </td>
                `
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    let toolsHtml = '';
    if (instrumentosEvaluacion && instrumentosEvaluacion.length > 0) {
      toolsHtml = `
        <h2 style="color: #1e1b4b; border-bottom: 2px solid #312e81; padding-bottom: 5px; margin-top: 25px;">
          Instrumentos y Herramientas Formativas
        </h2>
        ${instrumentosEvaluacion
          .map(
            (i) => `
          <div style="margin-bottom: 12px; border: 1px solid #cbd5e1; padding: 10px; background-color: #f8fafc;">
            <h3 style="color: #312e81; margin: 0 0 5px 0;">${i.tipo || i.nombre}</h3>
            <p><strong>Descripción:</strong> ${i.descripcion}</p>
            <p><strong>Aplicación:</strong> ${i.aplicacion}</p>
            ${
              i.itemsOIndicadores
                ? `<ul>${i.itemsOIndicadores.map((it) => `<li>${it}</li>`).join('')}</ul>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      `;
    }

    const fullContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Rúbrica y Evaluación - ${tematica}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
          h1 { color: #1e1b4b; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #94a3b8; }
        </style>
      </head>
      <body>
        ${renderOfficialDocumentHeaderHtml('CUADERNO Y HERRAMIENTAS DE EVALUACIÓN EF', 'EVAL-NOTEBOOK-2026')}
        <h1 style="color: #0a2240; font-size: 16pt; margin-top: 10px;">Rúbrica de Evaluación y Herramientas Formativas - Educación Física</h1>
        <p><strong>Curso:</strong> ${curso} | <strong>Temática:</strong> ${tematica}</p>
        
        <h2>Estrategia de Evaluación Inicial</h2>
        <p>${evaluacionInicial || 'No especificada.'}</p>

        ${rubricHtml}
        ${toolsHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + fullContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rubrica_Evaluacion_${tematica.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateInitialEvalAI = async () => {
    setLoadingInitialAi(true);
    setErrorAi(null);
    try {
      const res = await fetch('/api/ai/generate-initial-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tematica,
          curso,
          criteriosSeleccionados,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar la evaluación inicial.');
      if (data.evaluacionInicial) {
        setEvaluacionInicial(data.evaluacionInicial);
      }
    } catch (e: any) {
      console.error(e);
      setErrorAi(e.message || 'Error al generar la evaluación inicial.');
    } finally {
      setLoadingInitialAi(false);
    }
  };

  const handleDownloadEvaluationPDF = () => {
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = '#1e293b';
    container.style.lineHeight = '1.5';

    let toolsHtml = '';
    if (instrumentosEvaluacion && instrumentosEvaluacion.length > 0) {
      toolsHtml = instrumentosEvaluacion
        .map((i) => {
          const nameLower = ((i.tipo || i.nombre) + ' ' + (i.descripcion || '')).toLowerCase();
          let rendered = '';
          if (nameLower.includes('diana')) {
            rendered = renderDianaHtml(i);
          } else if (nameLower.includes('cotejo') || nameLower.includes('lista')) {
            rendered = renderListaCotejoHtml(i);
          } else if (nameLower.includes('rúbrica') || nameLower.includes('rubrica') || nameLower.includes('matriz')) {
            rendered = renderRubricaMatrizHtml(i);
          } else {
            const items = i.itemsOIndicadores && i.itemsOIndicadores.length > 0 ? i.itemsOIndicadores : [
              'Demuestra comprensión de los conceptos y normas de la actividad',
              'Aplica las habilidades motrices específicas en las situaciones propuestas',
              'Trabaja en equipo, colabora y respeta al grupo y adversarios'
            ];

            rendered = `
              <div style="font-family: Arial, sans-serif; padding: 15px; color: #0f172a; background: #ffffff;">
                <div style="border-bottom: 3px solid #1e1b4b; padding-bottom: 8px; margin-bottom: 12px;">
                  <span style="background: #312e81; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">HERRAMIENTA EVALUATIVA EF</span>
                  <h1 style="margin: 6px 0 0 0; font-size: 18px; font-weight: 800; color: #1e1b4b;">${i.tipo || i.nombre}</h1>
                </div>

                <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; padding: 10px 12px; margin-bottom: 15px; font-size: 11px; line-height: 1.6;">
                  <div><strong>CURSO / SECCIÓN:</strong> ${curso} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>TEMÁTICA:</strong> ${tematica} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FECHA:</strong> ____ / ____ / 2026</div>
                  <div><strong>NOMBRE ESTUDIANTE / GRUPO:</strong> ____________________________________________________</div>
                  <div style="margin-top: 4px; color: #4338ca;"><strong>Indicaciones de Aplicación:</strong> ${i.aplicacion || i.descripcion}</div>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px;">
                  <thead>
                    <tr style="background-color: #e0e7ff; color: #1e1b4b; font-weight: bold;">
                      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; color: #1e1b4b;">Criterio / Indicador de Evaluación Formativa</th>
                      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">Consigue</th>
                      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">En Proceso</th>
                      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">A Mejorar</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map((it: string) => `
                      <tr>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; color: #1e293b;">${it}</td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; color: #94a3b8;">[  ]</td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; color: #94a3b8;">[  ]</td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; color: #94a3b8;">[  ]</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }

          return `<div style="page-break-after: always; margin-bottom: 30px;">${rendered}</div>`;
        })
        .join('');
    }

    let rubricHtml = '';
    if (rubrica && rubrica.length > 0) {
      rubricHtml = `
        <div style="page-break-before: always; padding: 15px; background: #ffffff;">
          <h2 style="color: #1e1b4b; border-bottom: 3px solid #312e81; padding-bottom: 8px; margin-bottom: 15px; font-size: 20px;">
            📋 RÚBRICA DE EVALUACIÓN CRITERIAL (4 NIVELES)
          </h2>
          ${rubrica
            .map(
              (r) => `
            <div style="margin-bottom: 18px; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; page-break-inside: avoid; break-inside: avoid;">
              <div style="background: #1e1b4b; color: white; padding: 8px 12px; font-weight: bold; border-radius: 6px; font-size: 12px;">
                Criterio ${r.criterioCodigo}: ${r.criterioTexto}
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                ${r.niveles
                  .map(
                    (n, nIdx) => `
                  <div style="flex: 1; background: ${nIdx === 0 ? '#fee2e2' : nIdx === 1 ? '#fef9c3' : nIdx === 2 ? '#ffedd5' : '#dcfce7'}; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; font-size: 10.5px;">
                    <strong style="color: #0f172a; display: block; margin-bottom: 4px; font-size: 11px;">${n.nivel}</strong>
                    ${n.descriptor}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div style="background: #1e1b4b; color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff;">CUADERNO Y CARPETILLA DE INSTRUMENTOS DE EVALUACIÓN FORMADORA</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #fbbf24; font-weight: bold;">
          Educación Física Andaluz - LOMLOE | Curso: ${curso} | Temática: ${tematica}
        </p>
      </div>

      <div style="margin-bottom: 20px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px;">
        <strong style="color: #1e1b4b; font-size: 13px; display: block; margin-bottom: 4px;">🔍 ESTRATEGIA DE EVALUACIÓN INICIAL / DIAGNÓSTICA:</strong>
        <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5;">${evaluacionInicial || 'Estrategia de evaluación diagnóstica basada en la observación directa de hábitos motrices, capacidades básicas e interacciones de grupo en la primera sesión.'}</p>
      </div>

      ${toolsHtml}
      ${rubricHtml}
    `;

    const opt = {
      margin: 8,
      filename: `Cuaderno_Instrumentos_Evaluacion_${tematica.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(container).save();
  };

  const getDianaTargetPngDataUrl = (): string => {
    if (typeof document === 'undefined') return '';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      const cx = 150;
      const cy = 150;

      // Ring 4 (Outer)
      ctx.beginPath();
      ctx.arc(cx, cy, 125, 0, 2 * Math.PI);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1e1b4b';
      ctx.stroke();

      // Ring 3
      ctx.beginPath();
      ctx.arc(cx, cy, 93.75, 0, 2 * Math.PI);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#312e81';
      ctx.stroke();

      // Ring 2
      ctx.beginPath();
      ctx.arc(cx, cy, 62.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4338ca';
      ctx.stroke();

      // Ring 1
      ctx.beginPath();
      ctx.arc(cx, cy, 31.25, 0, 2 * Math.PI);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4f46e5';
      ctx.stroke();

      // Bullseye Center
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();

      // Main Axes Crosshair
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0f172a';

      ctx.beginPath();
      ctx.moveTo(15, cy);
      ctx.lineTo(285, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, 15);
      ctx.lineTo(cx, 285);
      ctx.stroke();

      // Diagonal dashed lines
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#64748b';
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(250, 250);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(250, 50);
      ctx.lineTo(50, 250);
      ctx.stroke();

      ctx.setLineDash([]);

      // Ring Numbers
      ctx.fillStyle = '#1e1b4b';
      ctx.font = '900 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top
      ctx.fillText('1', cx, cy - 18);
      ctx.fillText('2', cx, cy - 47);
      ctx.fillText('3', cx, cy - 78);
      ctx.fillText('4', cx, cy - 110);

      // Bottom
      ctx.fillText('1', cx, cy + 18);
      ctx.fillText('2', cx, cy + 47);
      ctx.fillText('3', cx, cy + 78);
      ctx.fillText('4', cx, cy + 110);

      // Left
      ctx.fillText('1', cx - 18, cy);
      ctx.fillText('2', cx - 47, cy);
      ctx.fillText('3', cx - 78, cy);
      ctx.fillText('4', cx - 110, cy);

      // Right
      ctx.fillText('1', cx + 18, cy);
      ctx.fillText('2', cx + 47, cy);
      ctx.fillText('3', cx + 78, cy);
      ctx.fillText('4', cx + 110, cy);

      return canvas.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  };

  const renderDianaHtml = (inst: any) => {
    const items = inst.itemsOIndicadores && inst.itemsOIndicadores.length > 0 
      ? inst.itemsOIndicadores 
      : [
          'Comprende y respeta las normas de la actividad y fair play',
          'Ejecuta con fluidez y coordinación las habilidades motrices',
          'Coopera activamente y apoya a sus compañeros/as de equipo',
          'Muestra autonomía, esfuerzo y resolución de retos motrices'
        ];

    const q1 = items[0] || 'Criterio A: Normas y Fair Play';
    const q2 = items[1] || 'Criterio B: Coordinación y Habilidades Motrices';
    const q3 = items[2] || 'Criterio C: Cooperación y Trabajo en Equipo';
    const q4 = items[3] || 'Criterio D: Autonomía y Retos Motrices';

    const pngTargetUrl = getDianaTargetPngDataUrl();

    return `
      <div style="font-family: Arial, sans-serif; padding: 12px 16px; color: #0f172a; max-width: 780px; margin: 0 auto; background: #ffffff;">
        ${renderOfficialDocumentHeaderHtml('DIANA DE AUTOEVALUACIÓN', 'EVAL-DIANA-2026')}
        <div style="text-align: center; border-bottom: 2px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 10px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #1e1b4b; text-transform: uppercase;">
            🎯 DIANA DE AUTOEVALUACIÓN
          </h1>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569; font-weight: bold;">
            Herramienta de autoevaluación formativa para cuatro criterios de Educación Física
          </p>
        </div>

        <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; font-size: 10.5px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px;">
          <div><strong>ÁREA:</strong> Educación Física</div>
          <div><strong>CURSO:</strong> ${curso}</div>
          <div><strong>TEMÁTICA:</strong> ${tematica}</div>
          <div style="width: 100%; border-top: 1px dashed #cbd5e1; margin-top: 2px; padding-top: 2px;">
            <strong>ESTUDIANTE:</strong> ___________________________________ &nbsp;&nbsp;&nbsp;&nbsp; <strong>FECHA:</strong> ____ / ____ / 2026
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
          <tr>
            <td style="width: 50%; padding-right: 4px; vertical-align: top;">
              <div style="border: 1.5px dashed #312e81; border-radius: 6px; padding: 6px; background: #f1f5f9; text-align: center;">
                <span style="font-size: 8.5px; font-weight: 800; color: #312e81; text-transform: uppercase; display: block;">Cuadrante 1 (Top-Left)</span>
                <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #1e293b;">${q1}</p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 4px; vertical-align: top;">
              <div style="border: 1.5px dashed #312e81; border-radius: 6px; padding: 6px; background: #f1f5f9; text-align: center;">
                <span style="font-size: 8.5px; font-weight: 800; color: #312e81; text-transform: uppercase; display: block;">Cuadrante 2 (Top-Right)</span>
                <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #1e293b;">${q2}</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Concentric Target Graphic PNG Base64 for PDF & VML for MS Word -->
        <table style="width: 100%; margin: 8px auto; border-collapse: collapse; text-align: center;">
          <tr>
            <td align="center" style="text-align: center; border: none; padding: 4px;">
              <!--[if gte mso 9]>
              <div align="center">
                <v:group style="width:240px;height:240px;position:relative;" coordsize="240,240">
                  <v:oval style="width:240px;height:240px;top:0;left:0;" fillcolor="#f8fafc" strokecolor="#1e1b4b" strokeweight="2pt"/>
                  <v:oval style="width:180px;height:180px;top:30px;left:30px;" fillcolor="#f1f5f9" strokecolor="#312e81" strokeweight="1.5pt"/>
                  <v:oval style="width:120px;height:120px;top:60px;left:60px;" fillcolor="#e2e8f0" strokecolor="#4338ca" strokeweight="1.5pt"/>
                  <v:oval style="width:60px;height:60px;top:90px;left:90px;" fillcolor="#cbd5e1" strokecolor="#4f46e5" strokeweight="1.5pt"/>
                  <v:oval style="width:16px;height:16px;top:112px;left:112px;" fillcolor="#1e1b4b" strokecolor="#000000" strokeweight="1pt"/>
                  <v:line from="10,120" to="230,120" strokecolor="#0f172a" strokeweight="2pt"/>
                  <v:line from="120,10" to="120,230" strokecolor="#0f172a" strokeweight="2pt"/>
                </v:group>
              </div>
              <![endif]-->
              <!--[if !mso]><!-->
              ${
                pngTargetUrl
                  ? `<img src="${pngTargetUrl}" width="240" height="240" style="display: block; margin: 0 auto; width: 240px; height: 240px;" alt="Diana de Autoevaluación" />`
                  : `<div style="width: 220px; height: 220px; border-radius: 50%; border: 3px solid #1e1b4b; margin: 0 auto; background-color: #f8fafc; text-align: center; line-height: 220px; font-weight: bold; color: #1e1b4b;">🎯 Diana de Autoevaluación</div>`
              }
              <!--<![endif]-->
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-top: 6px;">
          <tr>
            <td style="width: 50%; padding-right: 4px; vertical-align: top;">
              <div style="border: 1.5px dashed #312e81; border-radius: 6px; padding: 6px; background: #f1f5f9; text-align: center;">
                <span style="font-size: 8.5px; font-weight: 800; color: #312e81; text-transform: uppercase; display: block;">Cuadrante 3 (Bottom-Left)</span>
                <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #1e293b;">${q3}</p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 4px; vertical-align: top;">
              <div style="border: 1.5px dashed #312e81; border-radius: 6px; padding: 6px; background: #f1f5f9; text-align: center;">
                <span style="font-size: 8.5px; font-weight: 800; color: #312e81; text-transform: uppercase; display: block;">Cuadrante 4 (Bottom-Right)</span>
                <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: bold; color: #1e293b;">${q4}</p>
              </div>
            </td>
          </tr>
        </table>

        <div style="margin-top: 10px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background-color: #ffffff; font-size: 10px; color: #334155;">
          <strong style="color: #1e1b4b;">✍️ INSTRUCCIONES DE REGISTRO:</strong>
          <p style="margin: 2px 0 0 0;">Cada estudiante debe colorear o marcar de 1 a 4 en cada eje el nivel alcanzado. Al unir los 4 puntos con una línea contigua se obtiene la diana de autoevaluación personal.</p>
        </div>
      </div>
    `;
  };

  const renderListaCotejoHtml = (inst: any) => {
    const items = inst.itemsOIndicadores && inst.itemsOIndicadores.length > 0 
      ? inst.itemsOIndicadores 
      : [
          'Realiza los movimientos corporales de acuerdo con las consignas',
          'Muestra autonomía y colabora activamente en grupo',
          'Respeta las normas y fomenta el fair play en las sesiones'
        ];

    const col1 = items[0] || 'Indicador 1: Ejecución técnica y motriz';
    const col2 = items[1] || 'Indicador 2: Participación y actitud';
    const col3 = items[2] || 'Indicador 3: Trabajo colaborativo';

    // 25 students for evaluation
    const rows = Array.from({ length: 25 }, (_, i) => i + 1);

    return `
      <div style="font-family: Arial, sans-serif; padding: 12px; color: #0f172a; max-width: 920px; margin: 0 auto; background: #ffffff;">
        ${renderOfficialDocumentHeaderHtml('LISTA DE COTEJO DE OBSERVACIÓN DIRECTA', 'EVAL-LISTA-2026')}
        <div style="background-color: #2563eb; color: white; text-align: center; padding: 8px; font-weight: 900; font-size: 16px; border-radius: 6px 6px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">
          LISTA DE COTEJO DE OBSERVACIÓN DIRECTA (25 ALUMNOS)
        </div>

        <div style="border: 1px solid #93c5fd; background-color: #eff6ff; padding: 6px 10px; font-size: 10.5px; color: #1e3a8a; line-height: 1.5; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>ÁREA:</strong> Educación Física</span>
            <span><strong>FECHA:</strong> ____ / ____ / 2026</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>CURSO / GRUPO:</strong> ${curso}</span>
            <span><strong>TEMÁTICA:</strong> ${tematica}</span>
          </div>
          <div><strong>DOCENTE:</strong> ____________________________________________________</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1.5px solid #1e3a8a;">
          <thead>
            <tr style="background-color: #bfdbfe; color: #1e3a8a; text-align: center;">
              <th style="border: 1px solid #60a5fa; padding: 5px; width: 28px; text-align: center;" rowspan="2">Nº</th>
              <th style="border: 1px solid #60a5fa; padding: 5px; width: 170px; text-align: left;" rowspan="2">Apellidos y Nombre del Alumnado</th>
              <th style="border: 1px solid #60a5fa; padding: 5px; text-align: center;" colspan="2">${col1}</th>
              <th style="border: 1px solid #60a5fa; padding: 5px; text-align: center;" colspan="2">${col2}</th>
              <th style="border: 1px solid #60a5fa; padding: 5px; text-align: center;" colspan="2">${col3}</th>
              <th style="border: 1px solid #60a5fa; padding: 5px; width: 100px; text-align: center;" rowspan="2">Observaciones</th>
            </tr>
            <tr style="background-color: #dbeafe; color: #1e3a8a; text-align: center;">
              <th style="border: 1px solid #60a5fa; padding: 3px; width: 32px; text-align: center; font-weight: bold;">SÍ</th>
              <th style="border: 1px solid #60a5fa; padding: 3px; width: 32px; text-align: center; font-weight: bold;">NO</th>
              <th style="border: 1px solid #60a5fa; padding: 3px; width: 32px; text-align: center; font-weight: bold;">SÍ</th>
              <th style="border: 1px solid #60a5fa; padding: 3px; width: 32px; text-align: center; font-weight: bold;">NO</th>
              <th style="border: 1px solid #60a5fa; padding: 3px; width: 32px; text-align: center; font-weight: bold;">SÍ</th>
              <th style="border: 1px solid #60a5fa; padding: 3px; width: 32px; text-align: center; font-weight: bold;">NO</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(n => `
              <tr>
                <td style="border: 1px solid #93c5fd; padding: 2px 4px; text-align: center; font-weight: bold; background-color: #f8fafc;">${n}</td>
                <td style="border: 1px solid #93c5fd; padding: 2px 6px; text-align: left;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: center;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: center;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: center;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: center;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: center;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: center;"></td>
                <td style="border: 1px solid #93c5fd; padding: 2px; text-align: left;"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderRubricaMatrizHtml = (inst: any) => {
    // 25 students for evaluation matrix
    const students = Array.from({ length: 25 }, (_, i) => i + 1);

    let criteriaRows = '';
    if (rubrica && rubrica.length > 0) {
      criteriaRows = rubrica.map((r) => {
        const n4 = r.niveles?.find((n: any) => n.nivel?.includes('4') || n.nivel?.includes('Consolidado') || n.nivel?.includes('Excelente'))?.descriptor || r.niveles?.[3]?.descriptor || '';
        const n3 = r.niveles?.find((n: any) => n.nivel?.includes('3') || n.nivel?.includes('Avanzado') || n.nivel?.includes('Notable'))?.descriptor || r.niveles?.[2]?.descriptor || '';
        const n2 = r.niveles?.find((n: any) => n.nivel?.includes('2') || n.nivel?.includes('Proceso') || n.nivel?.includes('Aprobado'))?.descriptor || r.niveles?.[1]?.descriptor || '';
        const n1 = r.niveles?.find((n: any) => n.nivel?.includes('1') || n.nivel?.includes('Iniciación') || n.nivel?.includes('Insuficiente'))?.descriptor || r.niveles?.[0]?.descriptor || '';

        return `
          <tr style="background-color: #15803d; color: white;">
            <td style="border: 1px solid #cbd5e1; padding: 3px 5px; font-weight: bold; font-size: 9px;" colspan="2">Criterio ${r.criterioCodigo}: ${r.criterioTexto}</td>
            ${students.map(() => `<td style="border: 1px solid #cbd5e1; padding: 1px;"></td>`).join('')}
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-weight: bold; background-color: #dcfce7; color: #14532d; width: 60px; font-size: 8px;">Nivel 4 (Sobresaliente)</td>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-size: 7.5px; color: #1e293b; max-width: 120px;">${n4}</td>
            ${students.map(() => `<td style="border: 1px solid #cbd5e1; padding: 1px; text-align: center; color: #94a3b8; font-size: 7px; font-weight: bold;">[ ]</td>`).join('')}
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-weight: bold; background-color: #ffedd5; color: #7c2d12; width: 60px; font-size: 8px;">Nivel 3 (Notable)</td>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-size: 7.5px; color: #1e293b; max-width: 120px;">${n3}</td>
            ${students.map(() => `<td style="border: 1px solid #cbd5e1; padding: 1px; text-align: center; color: #94a3b8; font-size: 7px; font-weight: bold;">[ ]</td>`).join('')}
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-weight: bold; background-color: #fef9c3; color: #713f12; width: 60px; font-size: 8px;">Nivel 2 (En Proceso)</td>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-size: 7.5px; color: #1e293b; max-width: 120px;">${n2}</td>
            ${students.map(() => `<td style="border: 1px solid #cbd5e1; padding: 1px; text-align: center; color: #94a3b8; font-size: 7px; font-weight: bold;">[ ]</td>`).join('')}
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-weight: bold; background-color: #fee2e2; color: #7f1d1d; width: 60px; font-size: 8px;">Nivel 1 (Iniciación)</td>
            <td style="border: 1px solid #cbd5e1; padding: 2px 4px; font-size: 7.5px; color: #1e293b; max-width: 120px;">${n1}</td>
            ${students.map(() => `<td style="border: 1px solid #cbd5e1; padding: 1px; text-align: center; color: #94a3b8; font-size: 7px; font-weight: bold;">[ ]</td>`).join('')}
          </tr>
        `;
      }).join('');
    }

    return `
      <div style="font-family: Arial, sans-serif; padding: 8px; color: #0f172a; max-width: 100%; margin: 0 auto; background: #ffffff;">
        ${renderOfficialDocumentHeaderHtml('CUADRANTE Y RÚBRICA DE DESEMPEÑO', 'EVAL-RUBRICA-2026')}
        <div style="background-color: #15803d; color: white; padding: 6px 10px; font-weight: 800; font-size: 13px; border-radius: 6px 6px 0 0; text-transform: uppercase;">
          EDUCACIÓN FÍSICA - CUADRANTE DE NIVEL DE DESEMPEÑO Y REGISTRO DE EVALUACIÓN (25 ALUMNOS)
        </div>
        <div style="border: 1px solid #86efac; background-color: #f0fdf4; padding: 4px 8px; font-size: 9px; color: #14532d; margin-bottom: 6px;">
          <strong>CURSO:</strong> ${curso} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>TEMÁTICA:</strong> ${tematica} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FECHA:</strong> ____ / ____ / 2026
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 7.5px; border: 1px solid #cbd5e1; table-layout: auto;">
          <thead>
            <tr style="background-color: #e2e8f0; color: #0f172a;">
              <th style="border: 1px solid #cbd5e1; padding: 3px; width: 60px;">Nivel</th>
              <th style="border: 1px solid #cbd5e1; padding: 3px; width: 120px;">Criterios / Descriptores de Evaluación</th>
              ${students.map(s => `<th style="border: 1px solid #cbd5e1; padding: 1px; width: 16px; min-width: 14px; text-align: center; font-size: 6.5px;">A${s}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${criteriaRows}
          </tbody>
        </table>
      </div>
    `;
  };

  const handleDownloadSingleInstrumentPDF = (inst: any) => {
    const container = document.createElement('div');
    const nameLower = ((inst.tipo || inst.nombre) + ' ' + (inst.descripcion || '')).toLowerCase();

    let isLandscape = false;
    if (nameLower.includes('diana')) {
      container.innerHTML = renderDianaHtml(inst);
    } else if (nameLower.includes('cotejo') || nameLower.includes('lista')) {
      container.innerHTML = renderListaCotejoHtml(inst);
    } else if (nameLower.includes('rúbrica') || nameLower.includes('rubrica') || nameLower.includes('matriz') || nameLower.includes('desempeño')) {
      container.innerHTML = renderRubricaMatrizHtml(inst);
      isLandscape = true; // Use horizontal mode for 20-student matrix
    } else {
      const items = inst.itemsOIndicadores && inst.itemsOIndicadores.length > 0 
        ? inst.itemsOIndicadores 
        : [
            'Demuestra comprensión de los conceptos y normas de la actividad',
            'Aplica las habilidades motrices específicas en las situaciones propuestas',
            'Trabaja en equipo, colabora y respeta al grupo y adversarios'
          ];

      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #ffffff;">
          ${renderOfficialDocumentHeaderHtml(inst.nombre || inst.tipo || 'HERRAMIENTA DE EVALUACIÓN', 'EVAL-INST-2026')}
          <div style="border-bottom: 3px solid #1e1b4b; padding-bottom: 8px; margin-bottom: 12px;">
            <span style="background: #312e81; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">HERRAMIENTA EVALUATIVA EF</span>
            <h1 style="margin: 6px 0 0 0; font-size: 18px; font-weight: 800; color: #1e1b4b;">${inst.tipo || inst.nombre}</h1>
          </div>

          <div style="border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; padding: 10px 12px; margin-bottom: 15px; font-size: 11px; line-height: 1.6;">
            <div><strong>CURSO / SECCIÓN:</strong> ${curso} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>TEMÁTICA:</strong> ${tematica} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FECHA:</strong> ____ / ____ / 2026</div>
            <div><strong>NOMBRE ESTUDIANTE / GRUPO:</strong> ____________________________________________________</div>
            <div style="margin-top: 4px; color: #4338ca;"><strong>Indicaciones de Aplicación:</strong> ${inst.aplicacion || inst.descripcion}</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px;">
            <thead>
              <tr style="background-color: #e0e7ff; color: #1e1b4b; font-weight: bold;">
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; color: #1e1b4b;">Criterio / Indicador de Evaluación Formativa</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">Consigue</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">En Proceso</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">A Mejorar</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it: string) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #1e293b;">${it}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; color: #94a3b8;">[  ]</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; color: #94a3b8;">[  ]</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; color: #94a3b8;">[  ]</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 25px; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; min-height: 80px; font-size: 11px;">
            <strong style="color: #1e1b4b;">OBSERVACIONES Y RETROALIMENTACIÓN FORMADA DEL DOCENTE:</strong>
          </div>
        </div>
      `;
    }

    const opt = {
      margin: 6,
      filename: `Instrumento_${(inst.tipo || inst.nombre).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: isLandscape ? ('landscape' as const) : ('portrait' as const) }
    };

    html2pdf().set(opt).from(container).save();
  };

  const handleDownloadSingleInstrumentWord = (inst: any) => {
    let contentHtml = '';
    const nameLower = ((inst.tipo || inst.nombre) + ' ' + (inst.descripcion || '')).toLowerCase();

    if (nameLower.includes('diana')) {
      contentHtml = renderDianaHtml(inst);
    } else if (nameLower.includes('cotejo') || nameLower.includes('lista')) {
      contentHtml = renderListaCotejoHtml(inst);
    } else if (nameLower.includes('rúbrica') || nameLower.includes('rubrica') || nameLower.includes('matriz') || nameLower.includes('desempeño')) {
      contentHtml = renderRubricaMatrizHtml(inst);
    } else {
      const items = inst.itemsOIndicadores && inst.itemsOIndicadores.length > 0 
        ? inst.itemsOIndicadores 
        : [
            'Demuestra comprensión de los conceptos y normas de la actividad',
            'Aplica las habilidades motrices específicas en las situaciones propuestas',
            'Trabaja en equipo, colabora y respeta al grupo y adversarios'
          ];

      contentHtml = `
        <div style="font-family: Arial, sans-serif; padding: 15px; color: #0f172a;">
          <h1 style="color: #1e1b4b; font-size: 18px;">${inst.tipo || inst.nombre}</h1>
          <p><strong>Curso:</strong> ${curso} | <strong>Temática:</strong> ${tematica}</p>
          <p><strong>Indicaciones de Aplicación:</strong> ${inst.aplicacion || inst.descripcion}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #e0e7ff; color: #1e1b4b; font-weight: bold;">
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; color: #1e1b4b;">Criterio / Indicador</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">Consigue</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">En Proceso</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 75px; color: #1e1b4b;">A Mejorar</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it: string) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${it}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">[  ]</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">[  ]</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">[  ]</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const isMatrixRubric = nameLower.includes('rúbrica') || nameLower.includes('rubrica') || nameLower.includes('matriz') || nameLower.includes('desempeño');

    const fullContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${inst.tipo || inst.nombre}</title>
        <style>
          @page {
            size: ${isMatrixRubric ? 'A4 landscape' : 'A4 portrait'};
            margin: 1cm;
          }
          body { font-family: Calibri, Arial, sans-serif; line-height: 1.4; color: #0f172a; padding: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 4px 6px; }
          th { background-color: #f1f5f9; font-weight: bold; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + fullContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Herramienta_${(inst.tipo || inst.nombre || 'Evaluacion').replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpdateDescriptor = (elemIdx: number, nivelIdx: number, value: string) => {
    const copy = [...rubrica];
    copy[elemIdx].niveles[nivelIdx].descriptor = value;
    setRubrica(copy);
  };

  return (
    <div id="step8-container" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <ClipboardCheck className="w-7 h-7 text-amber-400" />
            <h2 className="text-xl font-bold">Paso 8: Evaluación Formativa e Instrumentos</h2>
          </div>
          <p className="text-indigo-100 text-sm max-w-2xl">
            Selecciona qué tipos de instrumentos de evaluación deseas generar. La IA los elaborará partiendo de la temática <strong>({tematica})</strong> y de los criterios de evaluación seleccionados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadEvaluationWord}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-950 font-extrabold text-xs transition shadow-md border border-indigo-200"
          >
            <span>📄 Descargar Rúbrica en Word (.doc)</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadEvaluationPDF}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition shadow-md border border-amber-300"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>📕 Descargar Rúbrica en PDF</span>
          </button>
        </div>
      </div>

      {/* 1. SELECCIÓN DE INSTRUMENTOS DE EVALUACIÓN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-indigo-700" />
              <span>1. Elección de Tipos de Instrumentos de Evaluación</span>
            </h3>
            <p className="text-xs text-slate-500">
              Marca las herramientas que deseas que la IA redacte para esta Situación de Aprendizaje.
            </p>
          </div>

          <button
            id="btn-generate-eval-ai"
            onClick={handleGenerateEvaluationAI}
            disabled={loadingAi}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md border border-amber-300 disabled:opacity-50"
          >
            {loadingAi ? (
              <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950" />
            )}
            <span>
              {instrumentosEvaluacion.length > 0
                ? 'Volver a generar Herramientas con IA'
                : 'Generar Herramientas de Evaluación con IA'}
            </span>
          </button>
        </div>

        {errorAi && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorAi}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {OPCIONES_INSTRUMENTOS.map((instName) => {
            const isChecked = selectedTools.includes(instName);
            return (
              <button
                key={instName}
                type="button"
                onClick={() => toggleTool(instName)}
                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition flex items-start space-x-2.5 ${
                  isChecked
                    ? 'bg-indigo-900 text-white border-indigo-950 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center ${
                    isChecked ? 'bg-amber-400 border-amber-400 text-slate-950' : 'bg-white border-slate-300'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>{instName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ESTRATEGIA DE EVALUACIÓN INICIAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="block text-sm font-bold text-slate-800">
            Estrategia de Evaluación Inicial / Diagnóstica
          </label>
          <button
            type="button"
            onClick={handleGenerateInitialEvalAI}
            disabled={loadingInitialAi}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
          >
            {loadingInitialAi ? (
              <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Generar Evaluación Inicial con IA</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={evaluacionInicial}
          onChange={(e) => setEvaluacionInicial(e.target.value)}
          placeholder="Describe la estrategia diagnóstica inicial para evaluar el punto de partida del alumnado..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-600"
        />
      </div>

      {/* 3. INSTRUMENTOS GENERADOS */}
      {instrumentosEvaluacion.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Instrumentos y Herramientas Formativas Elaboradas
              </h3>
              <p className="text-xs text-slate-500">
                Puedes descargar de forma independiente cada instrumento en PDF o imprimirlos directamente.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadEvaluationWord}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-extrabold text-xs transition border border-indigo-200 shadow-2xs"
                title="Descargar todos los instrumentos en formato Word editable"
              >
                <span>📄 Descargar Todos los Instrumentos (.doc)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadEvaluationPDF}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-sm border border-amber-300"
                title="Descargar todos los instrumentos en PDF"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>📕 Descargar Todos los Instrumentos (PDF)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instrumentosEvaluacion.map((inst, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold bg-indigo-900 text-white px-2.5 py-1 rounded-lg inline-block">
                      {inst.tipo || inst.nombre}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleInstrumentWord(inst)}
                        className="inline-flex items-center space-x-1 text-[11px] font-extrabold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 rounded-lg transition border border-indigo-200 shadow-2xs"
                        title="Descargar en formato Word editable"
                      >
                        <span>📄 Word (.doc)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleInstrumentPDF(inst)}
                        className="inline-flex items-center space-x-1 text-[11px] font-extrabold px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition border border-amber-300 shadow-2xs"
                        title="Descargar en PDF"
                      >
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        <span>📕 PDF</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold">{inst.descripcion}</p>
                  <p className="text-[11px] text-indigo-900 font-bold bg-indigo-50 p-2 rounded-lg mt-2">
                    Aplicación: {inst.aplicacion}
                  </p>

                  {inst.itemsOIndicadores && inst.itemsOIndicadores.length > 0 && (
                    <div className="space-y-1 pt-2 mt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600">Indicadores / Ítems:</span>
                      <ul className="space-y-1 pl-1">
                        {inst.itemsOIndicadores.map((it, iIdx) => (
                          <li key={iIdx} className="text-[11px] text-slate-700 flex items-start space-x-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RÚBRICA CRITERIAL */}
      {selectedTools.includes('Rúbrica de Evaluación Criterial (4 Niveles)') && rubrica.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rúbrica de Evaluación Criterial (4 Niveles)</h3>
              <p className="text-xs text-slate-500">
                Descriptores alineados con los criterios de evaluación seleccionados ({rubrica.length}).
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadEvaluationWord}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-extrabold text-xs transition border border-indigo-200 shadow-2xs"
              >
                <span>📄 Descargar Rúbrica (.doc)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadEvaluationPDF}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-sm border border-amber-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>📕 Descargar Rúbrica (PDF)</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {rubrica.map((elem, elemIdx) => (
              <div key={elemIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="bg-indigo-900 text-white p-2.5 rounded-lg flex items-center space-x-2">
                  <span className="font-extrabold text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    {elem.criterioCodigo}
                  </span>
                  <p className="text-xs font-semibold">{elem.criterioTexto}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {elem.niveles.map((niv, nivIdx) => (
                    <div key={nivIdx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded block w-fit ${
                          nivIdx === 0
                            ? 'bg-rose-100 text-rose-800'
                            : nivIdx === 1
                            ? 'bg-amber-100 text-amber-800'
                            : nivIdx === 2
                            ? 'bg-indigo-100 text-indigo-900 font-semibold'
                            : 'bg-emerald-100 text-emerald-900 font-bold'
                        }`}
                      >
                        {niv.nivel}
                      </span>
                      <textarea
                        rows={3}
                        value={niv.descriptor}
                        onChange={(e) => handleUpdateDescriptor(elemIdx, nivIdx, e.target.value)}
                        className="w-full text-[11px] text-slate-700 p-2 border border-slate-200 rounded-md focus:border-indigo-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-step8-prev"
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior: Diversidad</span>
        </button>

        <button
          id="btn-step8-next"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm shadow-md transition"
        >
          <span>Siguiente: Recursos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
