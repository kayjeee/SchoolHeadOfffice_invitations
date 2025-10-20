import React, { ReactNode, useMemo } from 'react';
import { useAppTheme } from '../context/ThemeContext';
import { ColorPalette } from '../utils/colorUtils';

interface StyleProviderProps {
  children: ReactNode;
}

const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  const { colorPalette } = useAppTheme();

  const themeStyles = useMemo(() => {
    if (!colorPalette) return {};

    return {
      '--primary-color': colorPalette.primary,
      '--secondary-color': colorPalette.secondary || colorPalette.primary,
      '--tertiary-color': colorPalette.tertiary || colorPalette.primary,
      '--logo-color': colorPalette.logo,
      '--font-family-primary': 'Arial, sans-serif',
      '--font-size-base': '16px',
      '--spacing-unit': '8px',
    };
  }, [colorPalette]);

  return (
    <div style={themeStyles as React.CSSProperties}>
      {children}
    </div>
  );
};

export default StyleProvider;
