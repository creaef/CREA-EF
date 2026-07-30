import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ParsedLocalFile {
  name: string;
  size: number;
  text: string;
  charCount: number;
}

export async function parseLocalFileClient(file: File): Promise<ParsedLocalFile> {
  const fileName = file.name;
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  let text = '';

  try {
    if (ext === 'docx' || ext === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value || '';
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (sheet) {
          text += XLSX.utils.sheet_to_txt(sheet) + '\n';
        }
      }
    } else if (ext === 'txt' || ext === 'md' || ext === 'json') {
      text = await file.text();
    } else {
      // PDF or binary stream text extraction
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const raw = decoder.decode(arrayBuffer);
      // Clean readable text streams from PDF
      const clean = raw.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ').replace(/\s+/g, ' ');
      text = clean.slice(0, 8000);
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
