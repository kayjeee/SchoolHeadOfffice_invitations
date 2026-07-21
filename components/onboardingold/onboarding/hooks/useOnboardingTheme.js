import { useMemo } from 'react';
import { 
  generateColorPalette, 
  getComplementaryColor,
  getTriadicColors,
  getLogoColor 
} from '../NavbarTheming/colorUtils';

// Default theme for onboarding when no school theme is available
const DEFAULT_ONBOARDING_THEME = {
  primary: '#3B82F6', // Blue
  secondary: '#10B981', // Green
  progress: '#3B82F6',
  logo: '#000000'
};

export const useOnboardingTheme = (schoolTheme) => {
  const themePalette = useMemo(() => {
    // If we have a school theme, use it
    if (schoolTheme) {
      const palette = generateColorPalette(schoolTheme);
      
      if (palette) {
        return {
          ...palette,
          progress: palette.primary,
          secondary: palette.secondary || getComplementaryColor(schoolTheme) || '#3B82F6'
        };
      }
    }
    
    // Fallback to default theme
    return DEFAULT_ONBOARDING_THEME;
  }, [schoolTheme]);

  // Calculate text colors based on background
  const getTextColor = (backgroundColor) => {
    return getLogoColor(backgroundColor) || '#000000';
  };

  // Enhanced color wheel for progress steps
  const getStepColors = (baseColor, totalSteps, currentStep, stepIndex) => {
    const triadicColors = getTriadicColors(baseColor);
    
    if (stepIndex < currentStep) {
      // Completed steps
      return {
        background: baseColor,
        text: getLogoColor(baseColor),
        border: baseColor
      };
    } else if (stepIndex === currentStep) {
      // Current step
      const currentColor = triadicColors?.[1] || getComplementaryColor(baseColor) || baseColor;
      return {
        background: currentColor,
        text: getLogoColor(currentColor),
        border: currentColor
      };
    } else {
      // Future steps
      return {
        background: baseColor + '20',
        text: getTextColor(baseColor + '20'),
        border: baseColor + '40'
      };
    }
  };

  return {
    themePalette,
    getTextColor,
    getStepColors
  };
};