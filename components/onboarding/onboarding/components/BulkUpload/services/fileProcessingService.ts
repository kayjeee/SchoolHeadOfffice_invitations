
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
// Defined outside the main function for cleaner code and potential reuse.
const getPhoneValue = (rawValue: any): string => {
  if (rawValue === null || rawValue === undefined) return '';

  // Handle numbers, strings, and other types
  const stringValue = String(rawValue).trim();

  // If it's a number in scientific notation or a very large number, handle it.
  // Note: BigInt conversion can be risky if the rawValue isn't a clean number/integer string.
  if (!isNaN(rawValue) && stringValue.includes('e')) {
    try {
      // Convert scientific notation to full number string
      // Rounding is added as a safety measure for floating point numbers from Excel,
      // assuming phone numbers should be integers.
      return BigInt(Math.round(rawValue)).toString();
    } catch (e) {
      // Fallback to the string representation if BigInt conversion fails
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

    reader.onload = async (e) => {
      try {
        // Handle both ArrayBuffer (for Excel) and text (for CSV)
        let data: any;
        
        if (file.type === 'text/csv') {
          // For CSV files, we get text data
          data = e.target?.result as string;
        } else {
          // For Excel files (.xls, .xlsx), we get ArrayBuffer
          data = new Uint8Array(e.target?.result as ArrayBuffer);
        }

        let workbook;
        
        if (file.type === 'text/csv') {
          // Parse CSV text
          workbook = XLSX.read(data, { type: 'string' });
        } else {
          // Parse Excel binary data
          workbook = XLSX.read(data, { type: 'array' });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Read as array of arrays (row, col)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (jsonData.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        // Find header row
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
        const colIndexes = {
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

        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;
        let errors: Array<{ row: number; messages: string }> = [];
        let warnings: Array<{ row: number; field: string; message: string }> = [];
        let preview: any[] = [];
        const processedData: any[] = [];

        // Process each row
        rows.forEach((row, i) => {
          // Skip empty rows
          if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
            return;
          }

          totalRows++;
          const currentRowNumber = headerRowIndex + 2 + i; // Data starts at row headerRowIndex + 2 (1-indexed)

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
          let telHomeRaw = colIndexes.telHome !== -1 ? getPhoneValue(row[colIndexes.telHome]) : '';
          let telEmerRaw = colIndexes.telEmergency !== -1 ? getPhoneValue(row[colIndexes.telEmergency]) : '';
          const whatsappRaw = colIndexes.whatsapp !== -1 ? getPhoneValue(row[colIndexes.whatsapp]) : '';
          const telegramRaw = colIndexes.telegram !== -1 ? getPhoneValue(row[colIndexes.telegram]) : '';

          // Clean phone prefixes
          telHomeRaw = helpers.cleanPhonePrefix(telHomeRaw, '\\(H\\)');
          telEmerRaw = helpers.cleanPhonePrefix(telEmerRaw, '\\(E\\)');

          // Use the first available phone number
          learner.phone = cellPhoneRaw || telHomeRaw || telEmerRaw || '';
          learner.telHome = telHomeRaw;
          learner.telEmergency = telEmerRaw;
          learner.whatsapp = whatsappRaw;
          learner.telegram = telegramRaw;

          // Sanitize phone numbers for consistency (must be done *after* assigning raw values)
          learner.phone = helpers.sanitizePhoneNumber(learner.phone);
          learner.telHome = helpers.sanitizePhoneNumber(learner.telHome);
          learner.telEmergency = helpers.sanitizePhoneNumber(learner.telEmergency);
          learner.whatsapp = helpers.sanitizePhoneNumber(learner.whatsapp);
          learner.telegram = helpers.sanitizePhoneNumber(learner.telegram);
          // === END OF UPDATED PHONE NUMBER LOGIC ===

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
            
            // Add warnings if any
            if (validation.warnings.length > 0) {
              validation.warnings.forEach(warning => {
                warnings.push({ 
                  row: currentRowNumber, 
                  field: 'phone', // Assuming validation warnings mostly pertain to phone fields
                  message: warning 
                });
              });
            }

            // Add to preview (max 3 rows)
            if (preview.length < 3) {
              preview.push({
                firstName: learner.firstName,
                lastName: learner.lastName,
                email: '', // Placeholder, as email extraction wasn't in the provided code
                phone: learner.phone,
                whatsapp: learner.whatsapp,
                telegram: learner.telegram,
                parentName: '', // Placeholder
              });
            }

            processedData.push(learner);
          }
        });

        resolve({
          totalRows,
          validRows,
          invalidRows,
          duplicates: 0, // Duplicates checking is not implemented in this scope
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

    // Use ArrayBuffer for all non-CSV files to correctly handle Excel formats
    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};
