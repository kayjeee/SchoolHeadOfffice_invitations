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
import { findHeaderIndex, headerExists, normalizeHeader } from '../utils/helpers';
import { validateLearnerData } from './validationService';

export const processExcelFile = async (file: File, schoolInfo: any, selectedGrade: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (jsonData.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i].map(cell => (cell ? String(cell).trim() : ''));
          if (headerExists(row, FIRST_NAME_HEADERS) && headerExists(row, LAST_NAME_HEADERS)) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Could not find valid header row. Please ensure your file contains columns for first name and last name.');
        }

        const headers = jsonData[headerRowIndex].map(h => (h ? String(h).trim() : ''));
        const rows = jsonData.slice(headerRowIndex + 1);

        const colIndexes = {
          firstName: findHeaderIndex(headers, FIRST_NAME_HEADERS),
          lastName: findHeaderIndex(headers, LAST_NAME_HEADERS),
          gender: findHeaderIndex(headers, GENDER_HEADERS),
          cellPhone: findHeaderIndex(headers, CELL_PHONE_HEADERS),
          telHome: findHeaderIndex(headers, TEL_HOME_HEADERS),
          telEmergency: findHeaderIndex(headers, TEL_EMERGENCY_HEADERS),
          whatsapp: findHeaderIndex(headers, WHATSAPP_HEADERS),
          telegram: findHeaderIndex(headers, TELEGRAM_HEADERS),
          accessionNumber: findHeaderIndex(headers, ACCESSION_NUMBER_HEADERS),
        };

        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;
        let errors: any[] = [];
        let warnings: any[] = [];
        let preview: any[] = [];
        const processedData: any[] = [];

        rows.forEach((row, i) => {
          if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) return;

          totalRows++;

          const learner = {
            firstName: colIndexes.firstName !== -1 ? (row[colIndexes.firstName] || '').toString().trim() : '',
            lastName: colIndexes.lastName !== -1 ? (row[colIndexes.lastName] || '').toString().trim() : '',
            gender: colIndexes.gender !== -1 ? (row[colIndexes.gender] || '').toString().trim() : '',
            accessionNumber: colIndexes.accessionNumber !== -1 ? (row[colIndexes.accessionNumber] || '').toString().trim() : '',
            ...schoolInfo,
            gradeId: selectedGrade?.id || null
          };

          const cellPhoneRaw = colIndexes.cellPhone !== -1 ? (row[colIndexes.cellPhone] || '').toString().trim() : '';
          let telHomeRaw = colIndexes.telHome !== -1 ? (row[colIndexes.telHome] || '').toString().trim() : '';
          let telEmerRaw = colIndexes.telEmergency !== -1 ? (row[colIndexes.telEmergency] || '').toString().trim() : '';
          const whatsappRaw = colIndexes.whatsapp !== -1 ? (row[colIndexes.whatsapp] || '').toString().trim() : '';
          const telegramRaw = colIndexes.telegram !== -1 ? (row[colIndexes.telegram] || '').toString().trim() : '';

          telHomeRaw = telHomeRaw.replace(/^\(H\)\s*/, '').trim();
          telEmerRaw = telEmerRaw.replace(/^\(E\)\s*/, '').trim();

          learner.phone = cellPhoneRaw || telHomeRaw || telEmerRaw || '';
          learner.telHome = telHomeRaw;
          learner.telEmergency = telEmerRaw;
          learner.whatsapp = whatsappRaw;
          learner.telegram = telegramRaw;

          const validation = validateLearnerData(learner);

          if (validation.errors.length > 0) {
            invalidRows++;
            errors.push({ row: headerRowIndex + 2 + i, messages: validation.errors.join('; ') });
          } else {
            validRows++;
            if (validation.warnings.length > 0) {
              validation.warnings.forEach(warning => {
                warnings.push({ row: headerRowIndex + 2 + i, field: 'phone', message: warning });
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