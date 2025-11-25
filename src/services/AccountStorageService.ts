import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account } from '../models/Account';
import { IAccount } from '../types';

const STORAGE_KEY = '@MoneyTrack:accounts';

export const AccountStorageService = {
  // Guardar todas las cuentas
  async saveAccounts(accounts: Account[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(accounts.map(a => a.toJSON()));
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error guardando cuentas:', error);
      return false;
    }
  },

  // Obtener todas las cuentas
  async getAccounts(): Promise<Account[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        return data.map((item: any) => Account.fromJSON(item));
      }
      return [];
    } catch (error) {
      console.error('[AccountStorage] Error obteniendo cuentas:', error);
      return [];
    }
  },

  // Agregar una nueva cuenta
  async addAccount(account: Account): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      accounts.push(account);
      await this.saveAccounts(accounts);
      return true;
    } catch (error) {
      console.error('Error agregando cuenta:', error);
      return false;
    }
  },

  // Eliminar una cuenta
  async deleteAccount(id: string): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      const filtered = accounts.filter(a => a.id !== id);
      await this.saveAccounts(filtered);
      return true;
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      return false;
    }
  },

  // Actualizar una cuenta
  async updateAccount(id: string, updatedData: Partial<IAccount>): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      const index = accounts.findIndex(a => a.id === id);
      if (index !== -1) {
        accounts[index] = new Account({ ...accounts[index], ...updatedData });
        await this.saveAccounts(accounts);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error actualizando cuenta:', error);
      return false;
    }
  },

  // Actualizar balance de cuenta
  async updateAccountBalance(id: string, amount: number, operation: 'add' | 'subtract'): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      const account = accounts.find(a => a.id === id);
      if (account) {
        if (operation === 'add') {
          account.addBalance(amount);
        } else {
          account.subtractBalance(amount);
        }
        await this.saveAccounts(accounts);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error actualizando balance:', error);
      return false;
    }
  },

  // Limpiar todas las cuentas
  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error limpiando cuentas:', error);
      return false;
    }
  },

  // Inicializar con cuentas por defecto
  async initializeDefaultAccounts(): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      
      // Solo crear cuentas si no hay ninguna
      if (accounts.length === 0) {
        const defaultAccounts = [
          new Account({
            name: 'Efectivo',
            type: 'cash',
            icon: '💵',
            color: '#4CAF50',
            balance: 0,
          }),
          new Account({
            name: 'Banco',
            type: 'bank',
            icon: '🏦',
            color: '#2196F3',
            balance: 0,
          }),
        ];
        
        await this.saveAccounts(defaultAccounts);
        console.log('[AccountStorage] Cuentas por defecto creadas');
      }
      return true;
    } catch (error) {
      console.error('[AccountStorage] Error inicializando cuentas:', error);
      return false;
    }
  },
};
