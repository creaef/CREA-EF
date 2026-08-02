import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ParsedLocalFile {
  name: string;
  size: number;
  text: string;
  charCount: number;
}

// Convert ArrayBuffer to Base64 efficiently for server endpoint
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function parseLocalFileClient(file: File): Promise<ParsedLocalFile> {
  const fileName = file.name;
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  let text = '';

  try {
    if (ext === 'pdf') {
      // 1. Intentar extracción de alta calidad por servidor (pdf-parse)
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = arrayBufferToBase64(arrayBuffer);
        const res = await fetch('/api/parse-local-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, base64Data }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.extractedText && data.extractedText.trim().length > 0) {
            text = data.extractedText;
          }
        }
      } catch (pdfServerErr) {
        console.warn('Extracción PDF servidor no disponible, usando fallback cliente...', pdfServerErr);
      }

      // Fallback local en cliente para PDF si servidor no responde
      if (!text) {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const raw = decoder.decode(arrayBuffer);
        const clean = raw.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ').replace(/\s+/g, ' ');
        text = clean.slice(0, 15000);
      }
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      // 2. Extracción ultra-rápida de Excel desactivando cálculo de fórmulas y estilos
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellFormula: false,
        cellHTML: false,
        cellStyles: false,
        sheetStubs: false,
      });

      const sheetTexts: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (sheet) {
          const csvText = XLSX.utils.sheet_to_csv(sheet);
          if (csvText && csvText.trim()) {
            sheetTexts.push(`--- HOJA: ${sheetName} ---\n${csvText.trim()}`);
          }
        }
      }
      text = sheetTexts.join('\n\n');
    } else if (ext === 'docx' || ext === 'doc') {
      // 3. Extracción de Word con Mammoth
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value || '';
    } else {
      // 4. Archivo de texto plano / Markdown / JSON
      text = await file.text();
    }
  } catch (e: any) {
    console.warn(`Error leyendo localmente ${fileName}:`, e);
    text = `Documento ${fileName} adjuntado para la SdA.`;
  }

  const cleanText = text.trim() || `Contenido de ${fileName} listo para el generador.`;
  return {
    name: fileName,
    size: file.size,
    text: cleanText,
    charCount: cleanText.length,
  };
}
