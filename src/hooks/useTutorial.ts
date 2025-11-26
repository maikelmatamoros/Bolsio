/**
 * Tutorial Interactivo - Sistema de Onboarding
 * 
 * Este hook maneja el estado y la lógica del tutorial interactivo.
 */

import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_STORAGE_KEY = '@Bolsio:hasCompletedTutorial';

interface UseTutorialReturn {
  shouldShowTutorial: boolean;
  startTutorial: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void; // Para testing
  recheckTutorial: () => Promise<void>; // Para forzar re-chequeo
}

export const useTutorial = (): UseTutorialReturn => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      
      // Si nunca ha completado el tutorial, mostrarlo
      if (!hasCompleted) {
        setShouldShowTutorial(true);
      } else {
        setShouldShowTutorial(false);
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const recheckTutorial = async () => {
    await checkTutorialStatus();
  };

  const startTutorial = () => {
    setShouldShowTutorial(true);
  };

  const completeTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
    }
  };

  const skipTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
      setShouldShowTutorial(true);
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  };

  return {
    shouldShowTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
    recheckTutorial,
  };
};

/**
 * Hook para crear referencias a elementos del UI
 * Útil para el tutorial interactivo
 */
export const useTutorialRefs = () => {
  const refs = {
    addIncomeButton: useRef<any>(null),
    addExpenseButton: useRef<any>(null),
    balanceCard: useRef<any>(null),
    transactionsList: useRef<any>(null),
    settingsTab: useRef<any>(null),
    transactionsTab: useRef<any>(null),
  };

  return refs;
};
