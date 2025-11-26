/**
 * Feature Flags Configuration
 * 
 * Sistema de flags para habilitar/deshabilitar funcionalidades
 * sin necesidad de hacer deploy nuevo.
 */

export interface FeatureFlags {
  // Funcionalidades de Transacciones
  enableTransactionEdit: boolean;
  enableTransactionDelete: boolean;
  enableRecurringTransactions: boolean;
  enableTransactionAttachments: boolean;
  
  // Funcionalidades de Cuentas
  enableMultipleAccounts: boolean;
  enableAccountTransfers: boolean;
  enableCryptoAccounts: boolean;
  
  // Funcionalidades de Categorías
  enableCustomCategories: boolean;
  enableCategoryIcons: boolean;
  enableSubcategories: boolean;
  
  // Funcionalidades de Presupuesto
  enableBudgets: boolean;
  enableBudgetAlerts: boolean;
  enableSavingsGoals: boolean;
  
  // Funcionalidades de Reportes
  enableReports: boolean;
  enableExportData: boolean;
  enableCharts: boolean;
  
  // Funcionalidades Premium (futuro)
  enableCloudSync: boolean;
  enableBiometricAuth: boolean;
  enableDarkModeSchedule: boolean;
  
  // Funcionalidades Experimentales
  enableAIInsights: boolean;
  enableVoiceInput: boolean;
  enableWidgets: boolean;
}

/**
 * Configuración de Feature Flags
 * 
 * Cambia estos valores a `true` para habilitar una funcionalidad
 * o a `false` para deshabilitarla.
 */
export const featureFlags: FeatureFlags = {
  // Transacciones - Habilitadas
  enableTransactionEdit: true,
  enableTransactionDelete: true,
  enableRecurringTransactions: false, // TODO: Implementar
  enableTransactionAttachments: false, // TODO: Implementar
  
  // Cuentas - Habilitadas
  enableMultipleAccounts: true,
  enableAccountTransfers: false, // TODO: Implementar
  enableCryptoAccounts: false, // Futuro
  
  // Categorías - Habilitadas
  enableCustomCategories: true,
  enableCategoryIcons: true,
  enableSubcategories: false, // TODO: Implementar
  
  // Presupuesto - Deshabilitadas (por implementar)
  enableBudgets: false,
  enableBudgetAlerts: false,
  enableSavingsGoals: false,
  
  // Reportes - Deshabilitadas (por implementar)
  enableReports: false,
  enableExportData: false,
  enableCharts: false,
  
  // Premium - Deshabilitadas (futuro)
  enableCloudSync: false,
  enableBiometricAuth: false,
  enableDarkModeSchedule: false,
  
  // Experimentales - Deshabilitadas
  enableAIInsights: false,
  enableVoiceInput: false,
  enableWidgets: false,
};

/**
 * Hook para verificar si una feature está habilitada
 * @param feature - Nombre del feature flag
 * @returns boolean
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

/**
 * Obtener todas las features habilitadas
 * @returns Array de nombres de features habilitadas
 */
export const getEnabledFeatures = (): string[] => {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
};

/**
 * Obtener todas las features deshabilitadas
 * @returns Array de nombres de features deshabilitadas
 */
export const getDisabledFeatures = (): string[] => {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => !enabled)
    .map(([feature]) => feature);
};
