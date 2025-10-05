import { useState } from 'react';

export const useFormState = <T extends object>(initialState: T) => {
  const [formState, setFormState] = useState<T>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  return {
    formState,
    setFormState,
    handleChange,
    resetForm,
  };
};
