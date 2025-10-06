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

// Process phone numbers - handle different data types
const getPhoneValue = (rawValue: any): string => {
  if (rawValue === null || rawValue === undefined) return '';

  const stringValue = String(rawValue).trim();

  // If it's a number in scientific notation or a very large number, handle it.
  if (!isNaN(rawValue) && stringValue.includes('e')) {
    try {
      // Convert scientific notation to full number string
      return BigInt(Math.round(rawValue)).toString();
    } catch (e) {
      console.warn(`BigInt conversion failed for rawValue: ${rawValue}. Falling back to string.`);
      return stringValue;
    }
  }

  return stringValue;
};

export const processExcelFile = async (
  file: File, 
  schoolInfo: any, 
  selectedGrade: any
): Promise<ProcessedFileResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // =======================================================
    // 🔥 NEW HELPER: Split a 20-digit number into two 10-digit numbers
    // =======================================================
    const split20DigitNumber = (sanitizedValue: string): string[] => {
        // Ensure the value is exactly 20 characters (digits) long
        if (sanitizedValue.length === 20) {
            const phone1 = sanitizedValue.substring(0, 10);
            const phone2 = sanitizedValue.substring(10, 20);
            return [phone1, phone2];
        }
        // Otherwise, return the value as a single item array (if not empty)
        return [sanitizedValue].filter(p => p.length > 0);
    };
    // =======================================================

    reader.onload = async (e) => {
      try {
        let data: any;
        
        if (file.type === 'text/csv') {
          data = e.target?.result as string;
        } else {
          data = new Uint8Array(e.target?.result as ArrayBuffer);
        }

        let workbook;
        
        if (file.type === 'text/csv') {
          workbook = XLSX.read(data, { type: 'string' });
        } else {
          workbook = XLSX.read(data, { type: 'array' });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (jsonData.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = (jsonData[i] as any[]).map(cell => (cell ? String(cell).trim() : ''));
          if (helpers.headerExists(row, FIRST_NAME_HEADERS) && helpers.headerExists(row, LAST_NAME_HEADERS)) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Could not find valid header row. Please ensure your file contains columns for first name and last name.');
        }

        const headers = (jsonData[headerRowIndex] as any[]).map(h => (h ? String(h).trim() : ''));
        const rows = jsonData.slice(headerRowIndex + 1) as any[][];

        // Find column indexes
        const colIndexes: { [key: string]: number } = {
          firstName: helpers.findHeaderIndex(headers, FIRST_NAME_HEADERS),
          lastName: helpers.findHeaderIndex(headers, LAST_NAME_HEADERS),
          gender: helpers.findHeaderIndex(headers, GENDER_HEADERS),
          cellPhone: helpers.findHeaderIndex(headers, CELL_PHONE_HEADERS),
          telHome: helpers.findHeaderIndex(headers, TEL_HOME_HEADERS),
          telEmergency: helpers.findHeaderIndex(headers, TEL_EMERGENCY_HEADERS),
          whatsapp: helpers.findHeaderIndex(headers, WHATSAPP_HEADERS),
          telegram: helpers.findHeaderIndex(headers, TELEGRAM_HEADERS),
          accessionNumber: helpers.findHeaderIndex(headers, ACCESSION_NUMBER_HEADERS),
        };

        // Handle the combined Home/Emergency phone column
        let telCombinedIndex = headers.findIndex(h => h.includes('Tel Number') && h.includes('(H)'));

        if (telCombinedIndex !== -1) {
            if (colIndexes.telHome === -1) colIndexes.telHome = telCombinedIndex;
            if (colIndexes.telEmergency === -1) colIndexes.telEmergency = telCombinedIndex;
        }
        
        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;
        let errors: Array<{ row: number; messages: string }> = [];
        let warnings: Array<{ row: number; field: string; message: string }> = [];
        let preview: any[] = [];
        const processedData: any[] = [];

        // Process each row
        rows.forEach((row, i) => {
          if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
            return;
          }

          totalRows++;
          const currentRowNumber = headerRowIndex + 2 + i;

          const learner: any = {
            firstName: colIndexes.firstName !== -1 ? (row[colIndexes.firstName] || '').toString().trim() : '',
            lastName: colIndexes.lastName !== -1 ? (row[colIndexes.lastName] || '').toString().trim() : '',
            gender: colIndexes.gender !== -1 ? (row[colIndexes.gender] || '').toString().trim() : '',
            accessionNumber: colIndexes.accessionNumber !== -1 ? (row[colIndexes.accessionNumber] || '').toString().trim() : '',
            ...schoolInfo,
            gradeId: selectedGrade?.id || null
          };

          // === START OF UPDATED PHONE NUMBER LOGIC ===
          const cellPhoneRaw = colIndexes.cellPhone !== -1 ? getPhoneValue(row[colIndexes.cellPhone]) : '';
          
          const homeIndex = colIndexes.telHome;
          const emerIndex = colIndexes.telEmergency;
          
          const rawCombinedTelValue = homeIndex !== -1 ? getPhoneValue(row[homeIndex]) : '';

          let telHomeRaw = rawCombinedTelValue;
          let telEmerRaw = (emerIndex !== -1 && emerIndex !== homeIndex) 
                         ? getPhoneValue(row[emerIndex])
                         : rawCombinedTelValue;

          const whatsappRaw = colIndexes.whatsapp !== -1 ? getPhoneValue(row[colIndexes.whatsapp]) : '';
          const telegramRaw = colIndexes.telegram !== -1 ? getPhoneValue(row[colIndexes.telegram]) : '';

          // Clean phone prefixes 
          telHomeRaw = helpers.cleanPhonePrefix(telHomeRaw, '\\(H\\)');
          telEmerRaw = helpers.cleanPhonePrefix(telEmerRaw, '\\(E\\)');

          // 1. Sanitize all primary numbers
          const sanitizedCellPhone = helpers.sanitizePhoneNumber(cellPhoneRaw);
          const sanitizedTelHome = helpers.sanitizePhoneNumber(telHomeRaw);
          const sanitizedTelEmer = helpers.sanitizePhoneNumber(telEmerRaw);

          // 2. Apply splitting logic and aggregate all potential phone numbers
          const allNumbers = [
              ...split20DigitNumber(sanitizedCellPhone),
              ...split20DigitNumber(sanitizedTelHome),
              ...split20DigitNumber(sanitizedTelEmer)
          ];

          // 3. Filter for unique, 10-digit numbers
          // We filter by length 10 because a 20-digit number was already split into two 10-digit numbers.
          const uniquePrimaryNumbers = Array.from(new Set(allNumbers))
              .filter(p => p.length === 10); 

          const mainPhone = uniquePrimaryNumbers[0] || '';
          const secondPhone = uniquePrimaryNumbers[1] || '';
          
          // 4. Assign Main Phone
          learner.phone = mainPhone;

          // 5. Assign Specific Phone Fields (These are for logging source data)
          // Since the main number for telHome/telEmergency could be the 1st or 2nd part of a split number,
          // we use the first 10 digits found in the respective split array.
          learner.telHome = split20DigitNumber(sanitizedTelHome)[0] || '';
          learner.telEmergency = split20DigitNumber(sanitizedTelEmer)[0] || '';
          learner.telegram = helpers.sanitizePhoneNumber(telegramRaw);

          // 6. Assign WhatsApp: Prioritize explicit column, then use the second unique number
          const explicitWhatsapp = helpers.sanitizePhoneNumber(whatsappRaw);
          
          if (explicitWhatsapp && explicitWhatsapp.length === 10) {
              // Priority 1: Use the 10-digit number from the explicit WhatsApp column
              learner.whatsapp = explicitWhatsapp;
          } else if (secondPhone) {
              // Priority 2: Use the second unique number found from cell/home/emergency
              learner.whatsapp = secondPhone;
          } else {
              learner.whatsapp = '';
          }

          // === END OF UPDATED PHONE NUMBER LOGIC ===

          // --- DEBUG CONSOLE LOG ADDITION ---
          console.log(`--- Row ${currentRowNumber}: Learner ${learner.firstName} ${learner.lastName} ---`);
          console.log('Processed Phone Numbers:');
          console.log(`  Main Phone (Cell/First Available - 10 digits): ${learner.phone}`);
          console.log(`  Home Phone (telHome - 10 digits): ${learner.telHome}`);
          console.log(`  Emergency Phone (telEmergency - 10 digits): ${learner.telEmergency}`);
          console.log(`  WhatsApp (10 digits): ${learner.whatsapp}`);
          console.log(`  Telegram: ${learner.telegram}`);
          console.log('----------------------------------------------------');
          // ----------------------------------

          // Validate learner data
          const validation = validateLearnerData(learner);

          if (validation.errors.length > 0) {
            invalidRows++;
            errors.push({ 
              row: currentRowNumber, 
              messages: validation.errors.join('; ') 
            });
          } else {
            validRows++;
            
            if (validation.warnings.length > 0) {
              validation.warnings.forEach(warning => {
                warnings.push({ 
                  row: currentRowNumber, 
                  field: 'phone', 
                  message: warning 
                });
              });
            }

            if (preview.length < 3) {
              preview.push({
                firstName: learner.firstName,
                lastName: learner.lastName,
                email: '', 
                phone: learner.phone,
                whatsapp: learner.whatsapp,
                telegram: learner.telegram,
                parentName: '', 
              });
            }

            processedData.push(learner);
          }
        });

        resolve({
          totalRows,
          validRows,
          invalidRows,
          duplicates: 0, 
          errors,
          warnings,
          preview,
          dataToUpload: processedData,
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};