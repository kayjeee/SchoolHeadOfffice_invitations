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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (jsonData.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        // Find header row
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i].map(cell => (cell ? String(cell).trim() : ''));
          if (helpers.headerExists(row, FIRST_NAME_HEADERS) && helpers.headerExists(row, LAST_NAME_HEADERS)) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Could not find valid header row. Please ensure your file contains columns for first name and last name.');
        }

        const headers = jsonData[headerRowIndex].map(h => (h ? String(h).trim() : ''));
        const rows = jsonData.slice(headerRowIndex + 1);

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

          const learner = {
            firstName: colIndexes.firstName !== -1 ? (row[colIndexes.firstName] || '').toString().trim() : '',
            lastName: colIndexes.lastName !== -1 ? (row[colIndexes.lastName] || '').toString().trim() : '',
            gender: colIndexes.gender !== -1 ? (row[colIndexes.gender] || '').toString().trim() : '',
            accessionNumber: colIndexes.accessionNumber !== -1 ? (row[colIndexes.accessionNumber] || '').toString().trim() : '',
            ...schoolInfo,
            gradeId: selectedGrade?.id || null
          };

          // Process phone numbers
          const cellPhoneRaw = colIndexes.cellPhone !== -1 ? (row[colIndexes.cellPhone] || '').toString().trim() : '';
          let telHomeRaw = colIndexes.telHome !== -1 ? (row[colIndexes.telHome] || '').toString().trim() : '';
          let telEmerRaw = colIndexes.telEmergency !== -1 ? (row[colIndexes.telEmergency] || '').toString().trim() : '';
          const whatsappRaw = colIndexes.whatsapp !== -1 ? (row[colIndexes.whatsapp] || '').toString().trim() : '';
          const telegramRaw = colIndexes.telegram !== -1 ? (row[colIndexes.telegram] || '').toString().trim() : '';

          // Clean phone prefixes
          telHomeRaw = helpers.cleanPhonePrefix(telHomeRaw, '\\(H\\)');
          telEmerRaw = helpers.cleanPhonePrefix(telEmerRaw, '\\(E\\)');

          learner.phone = cellPhoneRaw || telHomeRaw || telEmerRaw || '';
          learner.telHome = telHomeRaw;
          learner.telEmergency = telEmerRaw;
          learner.whatsapp = whatsappRaw;
          learner.telegram = telegramRaw;

          // Validate learner data
          const validation = validateLearnerData(learner);

          if (validation.errors.length > 0) {
            invalidRows++;
            errors.push({ 
              row: headerRowIndex + 2 + i, 
              messages: validation.errors.join('; ') 
            });
          } else {
            validRows++;
            
            // Add warnings if any
            if (validation.warnings.length > 0) {
              validation.warnings.forEach(warning => {
                warnings.push({ 
                  row: headerRowIndex + 2 + i, 
                  field: 'phone', 
                  message: warning 
                });
              });
            }

            // Add to preview (max 3 rows)
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

    // Always read as ArrayBuffer for Excel files - this is the key fix!
    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      // For .xls, .xlsx, and any other Excel formats
      reader.readAsArrayBuffer(file);
    }
  });
};