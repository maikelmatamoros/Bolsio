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

// Formatear encabezado de fecha para agrupar transacciones
export const formatDateHeader = (date: Date | string): string => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    if (d > oneWeekAgo) {
      return d.toLocaleDateString('es-ES', { weekday: 'long' });
    } else {
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

// Agrupar transacciones por fecha
export const groupTransactionsByDate = (transactions: any[]): { date: string; transactions: any[] }[] => {
  const groups: { [key: string]: any[] } = {};
  
  transactions.forEach(transaction => {
    const dateKey = new Date(transaction.date).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(dateKey => ({
      date: formatDateHeader(new Date(dateKey)),
      transactions: groups[dateKey]
    }));
};
