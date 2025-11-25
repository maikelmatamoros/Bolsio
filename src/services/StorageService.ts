import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../models/Transaction';
import { ITransaction } from '../types';

const STORAGE_KEY = '@MoneyTrack:transactions';

export const StorageService = {
  // Guardar todas las transacciones
  async saveTransactions(transactions: Transaction[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(transactions.map(t => t.toJSON()));
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error guardando transacciones:', error);
      return false;
    }
  },

  // Obtener todas las transacciones
  async getTransactions(): Promise<Transaction[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        return data.map((item: any) => Transaction.fromJSON(item));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      return [];
    }
  },

  // Agregar una nueva transacción
  async addTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
      return true;
    } catch (error) {
      console.error('Error agregando transacción:', error);
      return false;
    }
  },

  // Eliminar una transacción
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await this.saveTransactions(filtered);
      return true;
    } catch (error) {
      console.error('Error eliminando transacción:', error);
      return false;
    }
  },

  // Actualizar una transacción
  async updateTransaction(id: string, updatedData: Partial<ITransaction>): Promise<boolean> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = new Transaction({ ...transactions[index], ...updatedData });
        await this.saveTransactions(transactions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error actualizando transacción:', error);
      return false;
    }
  },

  // Limpiar todas las transacciones
  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error limpiando datos:', error);
      return false;
    }
  },
};
