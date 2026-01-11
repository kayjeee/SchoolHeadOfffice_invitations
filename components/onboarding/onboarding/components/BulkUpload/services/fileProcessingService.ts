import * as XLSX from 'xlsx';
import {
  FIRST_NAME_HEADERS,
  LAST_NAME_HEADERS,
  GENDER_HEADERS,
  CELL_PHONE_HEADERS,
  TEL_HOME_HEADERS,
  TEL_EMERGENCY_HEADERS,
  WHATSAPP_HEADERS,
  TELEGRAM_HEADERS,
  ACCESSION_NUMBER_HEADERS
} from '../utils/constants';
import * as helpers from '../utils/helpers';
import { validateLearnerData } from './validationService';

/* ======================================================
   TYPES
====================================================== */
export interface ProcessedFileResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  errors: Array<{ row: number; messages: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
  preview: any[];
  dataToUpload: any[];
}

/* ======================================================
   RAW PHONE NORMALIZATION
   - Handles Excel scientific notation
====================================================== */
const normalizeRawPhone = (raw: any): string => {
  if (raw === null || raw === undefined) return '';

  const str = String(raw).trim();

  // Excel scientific notation (e.g. 2.781234567E10)
  if (!isNaN(raw) && /e/i.test(str)) {
    try {
      const converted = BigInt(Math.round(raw)).toString();
      console.log('[PHONE] Scientific notation:', raw, '→', converted);
      return converted;
    } catch {
      console.warn('[PHONE] Failed scientific conversion:', raw);
      return str;
    }
  }

  return str;
};

/* ======================================================
   DIGIT SANITIZER
====================================================== */
const sanitizeDigits = (value: string): string => {
  return value ? value.replace(/\D/g, '') : '';
};

/* ======================================================
   EXTRACT + NORMALIZE SA PHONE NUMBERS
   - Accepts 10 or 11 digits
   - Converts 27xxxxxxxxx → 0xxxxxxxxx
====================================================== */
const extractValidPhoneNumbers = (value: string): string[] => {
  if (!value) return [];

  const digits = sanitizeDigits(value);
  const results: string[] = [];

  // SA numbers with country code (27xxxxxxxxx)
  const countryMatches = digits.match(/27\d{9}/g) || [];
  countryMatches.forEach(n => {
    results.push('0' + n.substring(2));
  });

  // Local format (0xxxxxxxxx)
  const localMatches = digits.match(/0\d{9}/g) || [];
  localMatches.forEach(n => results.push(n));

  if (results.length) {
    console.log('[PHONE] Normalized numbers:', results, 'from:', value);
  }

  return Array.from(new Set(results));
};

/* ======================================================
   PARSE TEL NUMBER (H)OME (E)MERGENCY FIELD
   - Extracts labeled phone numbers from combined field
   - Format: "(H) 0821234567 (E) 0829876543 WhatsApp 0827778888"
====================================================== */
const parseCombinedTelField = (raw: string): {
  home: string;
  emergency: string;
  whatsapp: string;
  allNumbers: string[];
} => {
  if (!raw) {
    return { home: '', emergency: '', whatsapp: '', allNumbers: [] };
  }

  console.log('[TEL PARSE] Raw input:', raw);

  const result = {
    home: '',
    emergency: '',
    whatsapp: '',
    allNumbers: [] as string[]
  };

  // Extract all valid phone numbers first
  const allNumbers = extractValidPhoneNumbers(raw);
  result.allNumbers = allNumbers;

  if (allNumbers.length === 0) {
    console.log('[TEL PARSE] No valid numbers found');
    return result;
  }

  // Check for WhatsApp keyword
  const hasWhatsApp = /whatsapp/i.test(raw);
  
  if (hasWhatsApp) {
    console.log('[TEL PARSE] WhatsApp keyword detected');
    
    // Try to find the number after "WhatsApp"
    const whatsappMatch = raw.match(/whatsapp[:\s]*([0-9\s\+\(\)\-]+)/i);
    if (whatsappMatch) {
      const whatsappNumbers = extractValidPhoneNumbers(whatsappMatch[1]);
      if (whatsappNumbers.length > 0) {
        result.whatsapp = whatsappNumbers[0];
        console.log('[TEL PARSE] WhatsApp number extracted:', result.whatsapp);
      }
    }
    
    // If still no WhatsApp number, take the last number in the field
    if (!result.whatsapp && allNumbers.length > 0) {
      result.whatsapp = allNumbers[allNumbers.length - 1];
      console.log('[TEL PARSE] WhatsApp fallback (last number):', result.whatsapp);
    }
  }

  // Extract Home number (marked with (H) or H: or Home)
  const homeMatch = raw.match(/\(h\)[:\s]*([0-9\s\+\(\)\-]+?)(?=\(e\)|whatsapp|$)/i) ||
                    raw.match(/h[:\s]+([0-9\s\+\(\)\-]+?)(?=\(e\)|whatsapp|e:|$)/i) ||
                    raw.match(/home[:\s]*([0-9\s\+\(\)\-]+?)(?=emergency|whatsapp|$)/i);
  
  if (homeMatch) {
    const homeNumbers = extractValidPhoneNumbers(homeMatch[1]);
    if (homeNumbers.length > 0) {
      result.home = homeNumbers[0];
      console.log('[TEL PARSE] Home number extracted:', result.home);
    }
  }

  // Extract Emergency number (marked with (E) or E: or Emergency)
  const emergencyMatch = raw.match(/\(e\)[:\s]*([0-9\s\+\(\)\-]+?)(?=whatsapp|$)/i) ||
                         raw.match(/e[:\s]+([0-9\s\+\(\)\-]+?)(?=whatsapp|$)/i) ||
                         raw.match(/emergency[:\s]*([0-9\s\+\(\)\-]+?)(?=whatsapp|$)/i);
  
  if (emergencyMatch) {
    const emergencyNumbers = extractValidPhoneNumbers(emergencyMatch[1]);
    if (emergencyNumbers.length > 0) {
      result.emergency = emergencyNumbers[0];
      console.log('[TEL PARSE] Emergency number extracted:', result.emergency);
    }
  }

  // Fallback: if no labeled numbers found, assign sequentially
  if (!result.home && !result.emergency && !result.whatsapp) {
    console.log('[TEL PARSE] No labels found, using sequential assignment');
    result.home = allNumbers[0] || '';
    result.emergency = allNumbers[1] || '';
  }

  console.log('[TEL PARSE] Final result:', result);
  return result;
};

/* ======================================================
   MAIN PROCESSOR
====================================================== */
export const processExcelFile = async (
  file: File,
  schoolInfo: any,
  selectedGrade: any
): Promise<ProcessedFileResult> => {
  console.group('📂 PROCESS EXCEL FILE');
  console.log('File:', file.name, file.type);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async e => {
      try {
        const data =
          file.type === 'text/csv'
            ? (e.target?.result as string)
            : new Uint8Array(e.target?.result as ArrayBuffer);

        const workbook = XLSX.read(data, {
          type: file.type === 'text/csv' ? 'string' : 'array'
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
          blankrows: false
        });

        /* ======================================================
           FIND HEADER ROW
        ====================================================== */
        let headerRowIndex = -1;

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i].map(c => (c ? String(c).trim() : ''));
          if (
            helpers.headerExists(row, FIRST_NAME_HEADERS) &&
            helpers.headerExists(row, LAST_NAME_HEADERS)
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Header row not found');
        }

        const headers = rawRows[headerRowIndex].map(h =>
          h ? String(h).trim() : ''
        );

        const rows = rawRows.slice(headerRowIndex + 1);

        /* ======================================================
           COLUMN MAPPING
        ====================================================== */
        
        // Find the combined Tel Number field (handles line breaks in header)
        const telNumberColIndex = headers.findIndex(h => {
          const normalized = h.replace(/[\r\n\s]+/g, ' ').toLowerCase();
          return /tel.*number.*\(h\).*\(e\)|tel.*number.*home.*emergency/i.test(normalized);
        });

        const col = {
          firstName: helpers.findHeaderIndex(headers, FIRST_NAME_HEADERS),
          lastName: helpers.findHeaderIndex(headers, LAST_NAME_HEADERS),
          gender: helpers.findHeaderIndex(headers, GENDER_HEADERS),
          telNumber: telNumberColIndex, // Combined field
          cell: helpers.findHeaderIndex(headers, CELL_PHONE_HEADERS),
          home: helpers.findHeaderIndex(headers, TEL_HOME_HEADERS),
          emergency: helpers.findHeaderIndex(headers, TEL_EMERGENCY_HEADERS),
          whatsapp: helpers.findHeaderIndex(headers, WHATSAPP_HEADERS),
          telegram: helpers.findHeaderIndex(headers, TELEGRAM_HEADERS),
          accession: helpers.findHeaderIndex(headers, ACCESSION_NUMBER_HEADERS)
        };

        console.group('📊 COLUMN INDEXES');
        console.table(col);
        console.groupEnd();

        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;

        const errors: any[] = [];
        const warnings: any[] = [];
        const processed: any[] = [];

        /* ======================================================
           ROW PROCESSING
        ====================================================== */
        rows.forEach((row, i) => {
          if (row.every(c => !c || String(c).trim() === '')) return;

          totalRows++;
          const rowNumber = headerRowIndex + i + 2;

          console.group(`👤 Row ${rowNumber}`);

          // Get the combined Tel Number field
          const telNumberRaw = col.telNumber !== -1 
            ? normalizeRawPhone(row[col.telNumber]) 
            : '';

          // Also check individual columns as fallback
          const cellRaw = col.cell !== -1 ? normalizeRawPhone(row[col.cell]) : '';
          const homeRaw = col.home !== -1 ? normalizeRawPhone(row[col.home]) : '';
          const emergencyRaw = col.emergency !== -1 ? normalizeRawPhone(row[col.emergency]) : '';
          const whatsappRaw = col.whatsapp !== -1 ? normalizeRawPhone(row[col.whatsapp]) : '';

          console.log('📞 Raw Input:', { telNumberRaw, cellRaw, homeRaw, emergencyRaw, whatsappRaw });

          let primaryPhone = '';
          let whatsappNumber = '';

          // Parse the combined Tel Number field
          if (telNumberRaw) {
            const parsed = parseCombinedTelField(telNumberRaw);
            
            // Priority: use labeled numbers
            primaryPhone = parsed.home || parsed.emergency || parsed.allNumbers[0] || '';
            whatsappNumber = parsed.whatsapp;
            
            // If no explicit WhatsApp found
            if (!whatsappNumber) {
              if (parsed.allNumbers.length === 1) {
                // Single number: use it for both phone and WhatsApp
                whatsappNumber = parsed.allNumbers[0];
                console.log('[ASSIGNMENT] Single number, using for both phone and WhatsApp');
              } else if (parsed.allNumbers.length > 1) {
                // Multiple numbers: use second number as WhatsApp (don't duplicate primary)
                whatsappNumber = parsed.allNumbers.find(n => n !== primaryPhone) || '';
                console.log('[ASSIGNMENT] Multiple numbers, using second for WhatsApp');
              }
            }
          }

          // Fallback to individual columns if combined field is empty
          if (!telNumberRaw) {
            const allNumbers = Array.from(new Set([
              ...extractValidPhoneNumbers(cellRaw),
              ...extractValidPhoneNumbers(homeRaw),
              ...extractValidPhoneNumbers(emergencyRaw)
            ]));

            primaryPhone = allNumbers[0] || '';
            
            // Check for explicit WhatsApp column
            if (whatsappRaw) {
              whatsappNumber = extractValidPhoneNumbers(whatsappRaw)[0] || '';
            }
            
            // Fallback to second number
            if (!whatsappNumber && allNumbers.length > 1) {
              whatsappNumber = allNumbers[1];
            }
          }

          const learner = {
            firstName:
              col.firstName !== -1
                ? String(row[col.firstName] || '').trim()
                : '',
            lastName:
              col.lastName !== -1
                ? String(row[col.lastName] || '').trim()
                : '',
            gender:
              col.gender !== -1
                ? String(row[col.gender] || '').trim()
                : '',
            accessionNumber:
              col.accession !== -1
                ? String(row[col.accession] || '').trim()
                : '',
            ...schoolInfo,
            gradeId: selectedGrade?.id || null,
            phone: primaryPhone,
            whatsapp: whatsappNumber
          };

          console.log('📞 Final Assignment:', {
            phone: learner.phone,
            whatsapp: learner.whatsapp
          });

          const validation = validateLearnerData(learner);

          if (validation.errors.length) {
            invalidRows++;
            errors.push({
              row: rowNumber,
              messages: validation.errors.join('; ')
            });
            console.error('❌ Validation failed:', validation.errors);
            console.groupEnd();
            return;
          }

          validRows++;
          processed.push(learner);
          console.log('✅ Row valid');
          console.groupEnd();
        });

        console.groupEnd();

        resolve({
          totalRows,
          validRows,
          invalidRows,
          duplicates: 0,
          errors,
          warnings,
          preview: processed.slice(0, 3),
          dataToUpload: processed
        });
      } catch (err) {
        console.error('🔥 Processing failed:', err);
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    file.type === 'text/csv'
      ? reader.readAsText(file)
      : reader.readAsArrayBuffer(file);
  });
};