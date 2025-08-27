// components/utils/colorUtils.js

// Function to get background color
export const getBackgroundColor = (colorMode, customColor) => {
  if (colorMode === 'custom' && customColor) return customColor;

  switch (colorMode) {
    case 'dark':
      return '#333';
    case 'light':
      return '#f4f4f4';
    case 'colorful':
      return 'linear-gradient(to right, #f1c40f, #e67e22)';
    case 'grey':
      return '#7f8c8d';
    case 'gold':
      return '#f1c40f';
    case 'blue':
      return '#3498db';
    case 'aqua':
      return '#1abc9c';
    case 'skyblue':
      return '#00aaff';
    case 'red':
      return '#e74c3c';
    case 'orange':
      return '#e67e22';
    case 'yellow':
      return '#f1c40f';
    default:
      return '#ffffff';
  }
};

// Function to get hover color
export const getHoverColor = (colorMode, customColor) => {
  if (colorMode === 'custom' && customColor) {
    return lightenColor(customColor, 10); // lighten 10%
  }

  switch (colorMode) {
    case 'dark':
      return '#555';
    case 'light':
      return '#e0e0e0';
    case 'colorful':
      return 'linear-gradient(to right, #f39c12, #d35400)';
    case 'grey':
      return '#95a5a6';
    case 'gold':
      return '#f39c12';
    case 'blue':
      return '#5dade2';
    case 'aqua':
      return '#48c9b0';
    case 'skyblue':
      return '#5dade2';
    case 'red':
      return '#c0392b';
    case 'orange':
      return '#d35400';
    case 'yellow':
      return '#f39c12';
    default:
      return '#e0e0e0';
  }
};

// Utility: lighten hex color
const lightenColor = (color, percent) => {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};
