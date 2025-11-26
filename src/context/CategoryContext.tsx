import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ICategory, TransactionType } from '../types';
import { categories as defaultCategories } from '../constants/categories';

const STORAGE_KEY = '@Bolsio:customCategories';

interface CustomCategoriesState {
  income: ICategory[];
  expense: ICategory[];
}

interface CategoryContextType {
  // Categorías personalizadas
  customCategories: CustomCategoriesState;
  // Todas las categorías (predefinidas + personalizadas)
  getAllCategories: (type: TransactionType) => ICategory[];
  // CRUD de categorías personalizadas
  addCustomCategory: (category: Omit<ICategory, 'id'>, type: TransactionType) => Promise<boolean>;
  updateCustomCategory: (id: string, category: Partial<ICategory>, type: TransactionType) => Promise<boolean>;
  deleteCustomCategory: (id: string, type: TransactionType) => Promise<boolean>;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [customCategories, setCustomCategories] = useState<CustomCategoriesState>({
    income: [],
    expense: [],
  });
  const [loading, setLoading] = useState(true);

  // Cargar categorías personalizadas al iniciar
  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomCategories(parsed);
      }
    } catch (error) {
      console.error('[CategoryContext] Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomCategories = async (categories: CustomCategoriesState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      setCustomCategories(categories);
      return true;
    } catch (error) {
      console.error('[CategoryContext] Error guardando categorías:', error);
      return false;
    }
  };

  // Obtener todas las categorías (predefinidas + personalizadas)
  const getAllCategories = (type: TransactionType): ICategory[] => {
    const predefined = defaultCategories[type];
    const custom = customCategories[type];
    return [...predefined, ...custom];
  };

  // Agregar categoría personalizada
  const addCustomCategory = async (
    category: Omit<ICategory, 'id'>,
    type: TransactionType
  ): Promise<boolean> => {
    const newCategory: ICategory = {
      ...category,
      id: `custom_${Date.now()}`,
    };

    const updated = {
      ...customCategories,
      [type]: [...customCategories[type], newCategory],
    };

    return saveCustomCategories(updated);
  };

  // Actualizar categoría personalizada
  const updateCustomCategory = async (
    id: string,
    categoryData: Partial<ICategory>,
    type: TransactionType
  ): Promise<boolean> => {
    const categories = customCategories[type];
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return false;

    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], ...categoryData };

    const updated = {
      ...customCategories,
      [type]: updatedCategories,
    };

    return saveCustomCategories(updated);
  };

  // Eliminar categoría personalizada
  const deleteCustomCategory = async (
    id: string,
    type: TransactionType
  ): Promise<boolean> => {
    const updated = {
      ...customCategories,
      [type]: customCategories[type].filter(c => c.id !== id),
    };

    return saveCustomCategories(updated);
  };

  const value: CategoryContextType = {
    customCategories,
    getAllCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    loading,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories debe usarse dentro de CategoryProvider');
  }
  return context;
};
