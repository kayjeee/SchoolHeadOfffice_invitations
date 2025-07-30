import { useState, useEffect } from 'react';

const useColorMode = () => {
  const [colorMode, setColorMode] = useState('light'); // Default mode

  useEffect(() => {
    const storedMode = localStorage.getItem('colorMode');
    if (storedMode) {
      setColorMode(storedMode);
    }
  }, []);

  const handleSetColorMode = (mode) => {
    setColorMode(mode);
    localStorage.setItem('colorMode', mode);
  };

  return [colorMode, handleSetColorMode];
};

export default useColorMode;
