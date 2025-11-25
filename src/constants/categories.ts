import { ICategories } from '../types';

export const categories: ICategories = {
  income: [
    { id: 'salary', name: 'Salario', icon: '💼' },
    { id: 'freelance', name: 'Freelance', icon: '💻' },
    { id: 'investment', name: 'Inversiones', icon: '📈' },
    { id: 'gift', name: 'Regalo', icon: '🎁' },
    { id: 'other_income', name: 'Otros ingresos', icon: '💰' },
  ],
  expense: [
    { id: 'food', name: 'Comida', icon: '🍔' },
    { id: 'transport', name: 'Transporte', icon: '🚗' },
    { id: 'entertainment', name: 'Entretenimiento', icon: '🎬' },
    { id: 'shopping', name: 'Compras', icon: '🛍️' },
    { id: 'bills', name: 'Servicios', icon: '📄' },
    { id: 'health', name: 'Salud', icon: '🏥' },
    { id: 'education', name: 'Educación', icon: '📚' },
    { id: 'other_expense', name: 'Otros gastos', icon: '💸' },
  ],
};
