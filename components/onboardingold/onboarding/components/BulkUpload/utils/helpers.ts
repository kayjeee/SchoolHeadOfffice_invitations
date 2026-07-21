import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from './constants';

// Header processing functions
export const normalizeHeader = (header: string): string => {
  if (!header) return '';
  return header.toLowerCase().replace(/[\s\n\r\t_-]/g, '');
};

export const findHeaderIndex = (headers: string[], possibleNames: string[]): number => {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const name of possibleNames) {
    const normalizedName = normalizeHeader(name);
    const index = normalizedHeaders.findIndex(header => header === normalizedName);
    if (index !== -1) return index;
  }
  return -1;
};

export const headerExists = (headers: string[], possibleNames: string[]): boolean => {
  const normalizedHeaders = headers.map(normalizeHeader);
  return possibleNames.some(name => {
    const normalizedName = normalizeHeader(name);
    return normalizedHeaders.includes(normalizedName);
  });
};

// File validation utilities
export const validateFileExtension = (fileName: string): boolean => {
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.includes(fileExtension);
};

export const validateFileSize = (fileSize: number): boolean => {
  return fileSize <= MAX_FILE_SIZE;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Phone number utilities
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
};

export const isValidPhoneFormat = (phone: string): boolean => {
  if (!phone) return false;
  return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Data utilities
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isNotEmpty = (value: any): boolean => {
  return !isEmpty(value);
};

// Clean phone number prefixes
export const cleanPhonePrefix = (phone: string, prefix: string): string => {
  if (!phone) return '';
  return phone.replace(new RegExp(`^${prefix}\\s*`), '').trim();
};

// Default export for backward compatibility
const helperFunctions = {
  normalizeHeader,
  findHeaderIndex,
  headerExists,
  validateFileExtension,
  validateFileSize,
  formatFileSize,
  sanitizePhoneNumber,
  isValidPhoneFormat,
  truncateText,
  capitalizeFirst,
  isEmpty,
  isNotEmpty,
  cleanPhonePrefix
};

export default helperFunctions;