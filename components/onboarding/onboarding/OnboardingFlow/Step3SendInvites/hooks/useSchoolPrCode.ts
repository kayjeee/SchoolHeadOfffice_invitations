// hooks/useSchoolPrCode.ts
import { useState, useEffect } from 'react';

export const useSchoolPrCode = (schoolId: string, schoolName: string) => {
  const [prCode, setPrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePrCode = async () => {
      if (!schoolId || !schoolName) return;

      console.log("🚀 [useSchoolPrCode] Generating PR code for school:", {
        schoolId,
        schoolName
      });

      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:4000/api/v1/schools/${schoolId}/pr_codes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pr_code: {
              purpose: "enrollment",
              metadata: {
                school_name: schoolName,
                academic_year: "2024",
                generated_at: new Date().toISOString(),
                scope: "school_wide"
              }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ [useSchoolPrCode] PR code generated successfully:", data);
        
        const generatedCode = data.pr_code?.code || data.code;
        if (generatedCode) {
          setPrCode(generatedCode);
        } else {
          throw new Error("No PR code in response");
        }

      } catch (err) {
        console.error("❌ [useSchoolPrCode] Failed to generate PR code:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsGenerating(false);
      }
    };

    generatePrCode();
  }, [schoolId, schoolName]);

  return {
    prCode,
    isGenerating,
    error,
    regenerate: () => {
      // Force regeneration by clearing state and letting useEffect run again
      setPrCode(null);
      setError(null);
    }
  };
};