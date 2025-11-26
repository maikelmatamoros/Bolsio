import { useState } from 'react';

interface UseCurrencyInputReturn {
  displayValue: string;
  numericValue: number;
  handleChange: (text: string) => void;
  setValue: (value: number | string) => void;
  clear: () => void;
}

/**
 * Hook para manejar inputs de moneda con formato
 * Formatea con separadores de miles de forma dinámica
 */
export const useCurrencyInput = (initialValue: number | string = 0): UseCurrencyInputReturn => {
  const [rawValue, setRawValue] = useState<string>(() => {
    const num = typeof initialValue === 'string' ? parseFloat(initialValue) : initialValue;
    return num > 0 ? num.toString() : '';
  });

  const formatWithThousands = (value: string): string => {
    if (!value) return '';
    
    // Separar parte entera y decimal
    const parts = value.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Formatear parte entera con separadores de miles
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Combinar con decimales si existen
    return decimalPart !== undefined 
      ? `${formattedInteger}.${decimalPart}` 
      : formattedInteger;
  };

  const handleChange = (text: string) => {
    // Remover comas para procesar
    const withoutCommas = text.replace(/,/g, '');
    
    // Remover todo excepto números y punto decimal
    const cleaned = withoutCommas.replace(/[^0-9.]/g, '');
    
    // Permitir solo un punto decimal
    const parts = cleaned.split('.');
    let sanitized = parts[0];
    if (parts.length > 1) {
      // Permitir solo 2 decimales
      sanitized += '.' + parts[1].substring(0, 2);
    }
    
    setRawValue(sanitized);
  };

  const setValue = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    setRawValue(num > 0 ? num.toString() : '');
  };

  const clear = () => {
    setRawValue('');
  };

  // Convertir el valor de entrada a número
  const numericValue = parseFloat(rawValue) || 0;

  return {
    displayValue: formatWithThousands(rawValue),
    numericValue,
    handleChange,
    setValue,
    clear,
  };
};
