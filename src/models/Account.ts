import { IAccount, AccountJSON, AccountType } from '../types';

export class Account implements IAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  isActive: boolean;

  constructor({
    id,
    name = '',
    type = 'cash' as AccountType,
    balance = 0,
    icon = '💵',
    color = '#6750A4',
    isActive = true,
  }: Partial<IAccount> & { id?: string | null } = {}) {
    this.id = id ?? Date.now().toString();
    this.name = name;
    this.type = type;
    this.balance = parseFloat(balance.toString());
    this.icon = icon;
    this.color = color;
    this.isActive = isActive === true || isActive === 'true' as any;
  }

  // Método para convertir a objeto plano (para guardar)
  toJSON(): AccountJSON {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      balance: this.balance,
      icon: this.icon,
      color: this.color,
      isActive: this.isActive,
    };
  }

  // Método estático para crear desde JSON
  static fromJSON(json: any): Account {
    return new Account({
      id: json.id,
      name: json.name,
      type: json.type,
      balance: parseFloat(json.balance?.toString() || '0'),
      icon: json.icon,
      color: json.color,
      isActive: json.isActive === true || json.isActive === 'true', // Manejar string o boolean
    });
  }

  // Agregar balance
  addBalance(amount: number): void {
    this.balance += amount;
  }

  // Restar balance
  subtractBalance(amount: number): void {
    this.balance -= amount;
  }
}
