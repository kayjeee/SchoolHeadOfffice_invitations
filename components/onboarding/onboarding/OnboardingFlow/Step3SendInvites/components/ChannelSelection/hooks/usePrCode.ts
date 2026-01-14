import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { PrCodeData } from '../types/channel';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface UsePrCodeReturn {
  prCode: string | null;
  isGenerating: boolean;
  error: string | null;
}

export const usePrCode = (schoolId: string, schoolName: string, selectedChannels: string[]): UsePrCodeReturn => {
  const [prCode, setPrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePrCode = async () => {
      if (!schoolId || !schoolName) {
        logger.warn('usePrCode', 'Missing school ID or name', { schoolId, schoolName });
        return;
      }

      logger.info('usePrCode', 'Generating PR code', { schoolId, schoolName });
      setIsGenerating(true);
      setError(null);

      try {
        const prCodeData: PrCodeData = {
          purpose: "enrollment",
          metadata: {
            school_name: schoolName,
            academic_year: "2024",
            generated_at: new Date().toISOString(),
            scope: "school_wide",
            channels: selectedChannels
          }
        };

        const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/pr_codes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pr_code: prCodeData })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('usePrCode', 'PR code response', data);

        const generatedCode = data.pr_code?.code || data.code;
        if (generatedCode) {
          setPrCode(generatedCode);
          logger.info('usePrCode', 'PR code generated successfully', { generatedCode });
        } else {
          throw new Error('No PR code in response');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('usePrCode', 'Failed to generate PR code', errorMessage);
        setError(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    generatePrCode();
  }, [schoolId, schoolName, selectedChannels]);

  return { prCode, isGenerating, error };
};
