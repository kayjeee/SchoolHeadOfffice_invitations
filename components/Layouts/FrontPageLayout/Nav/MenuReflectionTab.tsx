import Link from 'next/link';
import { useMemo } from 'react';
import { useAppTheme } from '../../context/ThemeContext';
import { generateColorPalette, ColorPalette, getLogoColor } from '../../NavbarTheming/colorUtils';

const MenuReflectionTab: React.FC = () => {
  const { getPrimaryColorValue } = useAppTheme();
  
  // Generate palette from the primary color value
  const themePalette: ColorPalette | null = useMemo(() => {
    const primaryColorValue = getPrimaryColorValue();
    const palette = generateColorPalette(primaryColorValue);
    
    // If palette generation fails, create a basic one with logo color
    if (!palette) {
      const logoColor = getLogoColor(primaryColorValue) || '#000000';
      return {
        primary: primaryColorValue,
        logo: logoColor
      };
    }
    
    return palette;
  }, [getPrimaryColorValue]);

  // Use the primary color for background and appropriate contrasting color for text
  const backgroundColor = getPrimaryColorValue();
  const textColor = themePalette?.logo || '#000000';
  
  return (
    <div 
      className="max-w-full mx-auto h-12 flex justify-between items-center px-4 border-b shadow-lg"
      style={{ 
        backgroundColor,
        borderBottomColor: textColor + '30' // Add transparency to border
      }}
    >
      <Link href="/Careers" passHref>
        <span 
          className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4 border-b border-opacity-30"
          style={{ 
            color: textColor,
            borderBottomColor: textColor 
          }}
        >
          Careers
        </span>
      </Link>
      <Link href="/Branches" passHref>
        <span 
          className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4 border-b border-opacity-30"
          style={{ 
            color: textColor,
            borderBottomColor: textColor 
          }}
        >
          Branches
        </span>
      </Link>
      <Link href="/Call-center" passHref>
        <span 
          className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4 border-b border-opacity-30"
          style={{ 
            color: textColor,
            borderBottomColor: textColor 
          }}
        >
          Call Center
        </span>
      </Link>
      <Link href="/Contact-us" passHref>
        <span 
          className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4 border-b border-opacity-30"
          style={{ 
            color: textColor,
            borderBottomColor: textColor 
          }}
        >
          Contact Us
        </span>
      </Link>
      <Link href="/privacy-policy" passHref>
        <span 
          className="cursor-pointer hover:opacity-80 transition-opacity py-2 px-4 border-b border-opacity-30"
          style={{ 
            color: textColor,
            borderBottomColor: textColor 
          }}
        >
          Privacy Policy
        </span>
      </Link>
    </div>
  );
};

export default MenuReflectionTab;