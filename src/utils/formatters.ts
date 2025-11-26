// Formatear cantidad de dinero
export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${currencySymbol}${formatted}`;
};

// Formatear fecha
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Formatear fecha completa
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatear fecha relativa (hoy, ayer, etc.)
export const formatRelativeDate = (date: Date | string): string => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    return formatDate(d);
  }
};
