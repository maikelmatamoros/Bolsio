import { ICategories } from '../types';

export const categories: ICategories = {
  income: [
    { id: 'salary', name: 'Salario', icon: '💼' },
    { id: 'freelance', name: 'Freelance', icon: '💻' },
    { id: 'debt_collection', name: 'Cobro de deudas', icon: '💳' },
    { id: 'other_income', name: 'Otros ingresos', icon: '💰' },
  ],
  expense: [
    { id: 'food', name: 'Comida', icon: '🍔' },
    { id: 'transport', name: 'Transporte', icon: '🚗' },
    { id: 'debt_payment', name: 'Pago de deudas', icon: '💸' },
    { id: 'other_expense', name: 'Otros gastos', icon: '💸' },
  ],
};
