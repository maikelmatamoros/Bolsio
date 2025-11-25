import { ITransaction, TransactionJSON, TransactionType } from '../types';

export class Transaction implements ITransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  accountId: string;

  constructor({
    id,
    type = 'expense' as TransactionType,
    amount = 0,
    category = '',
    description = '',
    date = new Date(),
    accountId = '',
  }: Partial<ITransaction> & { id?: string | null } = {}) {
    this.id = id ?? Date.now().toString();
    this.type = type;
    this.amount = parseFloat(amount.toString());
    this.category = category;
    this.description = description;
    this.date = date instanceof Date ? date : new Date(date);
    this.accountId = accountId;
  }

  // Método para convertir a objeto plano (para guardar)
  toJSON(): TransactionJSON {
    return {
      id: this.id,
      type: this.type,
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: this.date.toISOString(),
      accountId: this.accountId,
    };
  }

  // Método estático para crear desde JSON
  static fromJSON(json: TransactionJSON): Transaction {
    return new Transaction({
      ...json,
      date: new Date(json.date),
    });
  }
}
