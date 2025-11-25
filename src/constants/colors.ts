export const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  danger: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  text: '#333333',
  textLight: '#757575',
  border: '#E0E0E0',
  income: '#4CAF50',
  expense: '#F44336',
} as const;

export type Colors = typeof colors;
