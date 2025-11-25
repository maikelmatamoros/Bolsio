import { ValidationResult, TransactionType } from '../types';

// Validar si un número es válido
export const isValidAmount = (amount: number | string): boolean => {
  const num = parseFloat(amount.toString());
  return !isNaN(num) && num > 0;
};

// Validar si una categoría es válida
export const isValidCategory = (category: string): boolean => {
  return Boolean(category && category.trim().length > 0);
};

// Validar si una descripción es válida
export const isValidDescription = (description: string): boolean => {
  return Boolean(description && description.trim().length > 0);
};

// Validar una transacción completa
export const validateTransaction = (
  type: TransactionType,
  amount: number | string,
  category: string,
  description: string
): ValidationResult => {
  const errors: ValidationResult['errors'] = {};

  if (!type || (type !== 'income' && type !== 'expense')) {
    errors.type = 'Tipo de transacción inválido';
  }

  if (!isValidAmount(amount)) {
    errors.amount = 'La cantidad debe ser mayor a 0';
  }

  if (!isValidCategory(category)) {
    errors.category = 'Debes seleccionar una categoría';
  }

  if (!isValidDescription(description)) {
    errors.description = 'La descripción no puede estar vacía';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
