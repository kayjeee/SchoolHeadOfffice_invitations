import { useState, useEffect } from 'react';

const useColorMode = () => {
  const [colorMode, setColorModeState] = useState('light'); // default
  const [customColor, setCustomColor] = useState('white');  // default

  useEffect(() => {
    const storedMode = localStorage.getItem('colorMode');
    const storedCustomColor = localStorage.getItem('customColor');

    if (storedMode) setColorModeState(storedMode);
    if (storedCustomColor) setCustomColor(storedCustomColor);
  }, []);

  const setColorMode = (mode, color = customColor) => {
    setColorModeState(mode);
    setCustomColor(color);
    localStorage.setItem('colorMode', mode);
    localStorage.setItem('customColor', color);
  };

  return [colorMode, customColor, setColorMode];
};

export default useColorMode;
