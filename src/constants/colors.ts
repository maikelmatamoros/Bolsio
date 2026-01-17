// Paleta Minimalista - Colores neutros y suaves para un diseño clean

// TEMA CLARO
export const lightColors = {
  // Colores Principales (Neutros)
  primary: '#6366F1',        // Indigo suave
  onPrimary: '#FFFFFF',      
  primaryContainer: '#EEF2FF', 
  onPrimaryContainer: '#1E1B4B', 
  
  // Secundario (Grises)
  secondary: '#64748B',      // Slate
  onSecondary: '#FFFFFF',    
  secondaryContainer: '#F1F5F9', 
  onSecondaryContainer: '#0F172A', 
  
  // Terciario (Neutro)
  tertiary: '#94A3B8',       
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F8FAFC',
  onTertiaryContainer: '#334155',
  
  // Fondos y Superficies (Minimalistas)
  background: '#FFFFFF',     
  onBackground: '#1E293B',   
  surface: '#FFFFFF',        
  onSurface: '#1E293B',      
  surfaceVariant: '#F8FAFC', 
  onSurfaceVariant: '#64748B', 
  surfaceHover: '#F1F5F9',   
  
  // Colores de Transacciones (Suaves)
  income: '#10B981',         // Emerald suave
  expense: '#EF4444',        // Red suave
  
  // Estados (Neutros)
  error: '#DC2626',          
  onError: '#FFFFFF',        
  errorContainer: '#FEF2F2', 
  onErrorContainer: '#991B1B', 
  
  success: '#10B981',        
  warning: '#F59E0B',        
  info: '#3B82F6',           
  
  // Textos (Jerarquía clara)
  text: '#1E293B',           
  textLight: '#64748B',      
  textMuted: '#94A3B8',      
  
  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  
  // Bordes y Divisores (Minimalistas)
  outline: '#E2E8F0',        
  outlineVariant: '#CBD5E1', 
  border: '#E2E8F0',         
  borderLight: '#F1F5F9',    
  
  // Sombras (Suaves)
  shadow: '#000000',
  shadowDark: '#000000',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradientes (Subtiles)
  gradientStart: '#EEF2FF',
  gradientEnd: '#F1F5F9',
  
  // Alias para compatibilidad
  danger: '#DC2626',
} as const;

// TEMA OSCURO
export const darkColors = {
  // Colores Principales (Neutros oscuros)
  primary: '#818CF8',        // Indigo claro
  onPrimary: '#1E1B4B',      
  primaryContainer: '#312E81', 
  onPrimaryContainer: '#EEF2FF', 
  
  // Secundario (Grises oscuros)
  secondary: '#94A3B8',      
  onSecondary: '#0F172A',    
  secondaryContainer: '#334155', 
  onSecondaryContainer: '#F1F5F9', 
  
  // Terciario (Neutro oscuro)
  tertiary: '#64748B',       
  onTertiary: '#0F172A',
  tertiaryContainer: '#1E293B',
  onTertiaryContainer: '#CBD5E1',
  
  // Fondos y Superficies (Minimalistas oscuros)
  background: '#0F172A',     
  onBackground: '#F1F5F9',   
  surface: '#1E293B',        
  onSurface: '#F1F5F9',      
  surfaceVariant: '#334155', 
  onSurfaceVariant: '#94A3B8', 
  surfaceHover: '#334155',   
  
  // Colores de Transacciones (Suaves oscuros)
  income: '#34D399',         // Emerald claro
  expense: '#F87171',        // Red claro
  
  // Estados (Neutros oscuros)
  error: '#EF4444',          
  onError: '#FFFFFF',        
  errorContainer: '#451A16', 
  onErrorContainer: '#FECACA', 
  
  success: '#34D399',        
  warning: '#FBBF24',        
  info: '#60A5FA',           
  
  // Textos (Jerarquía clara oscura)
  text: '#F1F5F9',           
  textLight: '#CBD5E1',      
  textMuted: '#64748B',      
  
  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  
  // Bordes y Divisores (Minimalistas oscuros)
  outline: '#475569',        
  outlineVariant: '#334155', 
  border: '#475569',         
  borderLight: '#334155',    
  
  // Sombras
  shadow: '#000000',
  shadowDark: '#000000',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Gradientes (Subtiles oscuros)
  gradientStart: '#312E81',
  gradientEnd: '#334155',
  
  // Alias para compatibilidad
  danger: '#EF4444',
} as const;

// Exportar el tema claro como default para compatibilidad
export const colors = lightColors;

export type Colors = typeof lightColors;
