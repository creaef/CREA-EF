import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: number;
  iconLink?: string;
  thumbnailLink?: string;
  isFolder: boolean;
}

// 1. Obtener archivos y carpetas directamente desde Google Drive API (Cliente)
export async function fetchDriveItemsClient(
  accessToken: string,
  folderId: string = 'root',
  search: string = ''
): Promise<{ items: DriveItem[] }> {
  try {
    let q = `'${folderId || 'root'}' in parents and trashed = false`;
    if (search.trim()) {
      q = `name contains '${search.replace(/'/g, "\\'")}' and trashed = false`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id,name,mimeType,modifiedTime,size,iconLink,thumbnailLink)&pageSize=100&orderBy=folder,name`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Tu sesión de Google Drive ha expirado. Por favor, vuelve a conectar tu cuenta.');
      }
      throw new Error(`Error de Google Drive API (${res.status})`);
    }

    const data = await res.json();
    const files = data.files || [];

    const items: DriveItem[] = files.map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      modifiedTime: f.modifiedTime,
      size: f.size ? Number(f.size) : undefined,
      iconLink: f.iconLink,
      thumbnailLink: f.thumbnailLink,
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
    }));

    return { items };
  } catch (err: any) {
    console.error('Error obteniendo elementos de Drive en cliente:', err);
    throw err;
  }
}

// 2. Leer contenido de archivos/carpetas directamente desde Google Drive API (Cliente) con descompresión inteligente de Office
export async function readDriveFilesClient(
  accessToken: string,
  folderIds: string[],
  fileIds: string[],
  onProgress?: (msg: string, count: number) => void
): Promise<{ text: string; filesCount: number }> {
  let allText = '';
  let filesCount = 0;

  async function readFileContent(fileId: string, name: string, mimeType: string) {
    try {
      if (onProgress) {
        onProgress(`Procesando "${name}"...`, filesCount + 1);
      }
      const lowerName = name.toLowerCase();
      let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

      if (mimeType === 'application/vnd.google-apps.document') {
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
      }

      const res = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) return;

      let extractedText = '';

      if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || '';
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
        const arrayBuffer = await res.arrayBuffer();
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
        extractedText = sheetTexts.join('\n\n');
      } else {
        extractedText = await res.text();
      }

      const clean = extractedText.trim();
      if (clean) {
        allText += `\n--- Archivo: ${name} ---\n${clean}\n`;
        filesCount++;
      }
    } catch (e) {
      console.warn(`No se pudo leer el archivo de Drive ${name}:`, e);
    }
  }

  await Promise.all(
    fileIds.map(async (fId) => {
      try {
        const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fId}?fields=id,name,mimeType`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          await readFileContent(meta.id, meta.name, meta.mimeType);
        }
      } catch (e) {}
    })
  );

  await Promise.all(
    folderIds.map(async (folId) => {
      try {
        const listRes = await fetchDriveItemsClient(accessToken, folId, '');
        const nonFolderItems = listRes.items.filter((item) => !item.isFolder);
        await Promise.all(
          nonFolderItems.map((item) => readFileContent(item.id, item.name, item.mimeType))
        );
      } catch (e) {}
    })
  );

  return { text: allText, filesCount };
}
