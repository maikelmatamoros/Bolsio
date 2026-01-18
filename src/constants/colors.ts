// Paleta Minimalista - Colores neutros y suaves para un diseño clean

// TEMA CLARO - Paleta Minimalista Definida
export const lightColors = {
  // Colores Principales (Neutros definidos)
  primary: '#475569',        // Slate más oscuro
  onPrimary: '#FFFFFF',      
  primaryContainer: '#E2E8F0', 
  onPrimaryContainer: '#1E293B', 
  
  // Secundario (Grises definidos)
  secondary: '#64748B',      // Slate medio
  onSecondary: '#FFFFFF',    
  secondaryContainer: '#F1F5F9', 
  onSecondaryContainer: '#334155', 
  
  // Terciario (Neutro definido)
  tertiary: '#94A3B8',       
  onTertiary: '#1E293B',
  tertiaryContainer: '#F1F5F9',
  onTertiaryContainer: '#475569',
  
  // Fondos y Superficies (Definidos)
  background: '#FAFAFA',     // Gris muy sutil en lugar de blanco puro
  onBackground: '#0F172A',   // Texto más oscuro
  surface: '#FFFFFF',        
  onSurface: '#0F172A',      // Texto más oscuro
  surfaceVariant: '#F1F5F9', // Más definido
  onSurfaceVariant: '#475569', // Texto más oscuro
  surfaceHover: '#E2E8F0',   // Más definido
  
  // Colores de Transacciones (Más definidos)
  income: '#059669',         // Verde más fuerte
  expense: '#DC2626',        // Rojo más fuerte
  
  // Estados (Más definidos)
  error: '#DC2626',          
  onError: '#FFFFFF',        
  errorContainer: '#FEF2F2', 
  onErrorContainer: '#7F1D1D', 
  
  success: '#059669',        
  warning: '#D97706',        
  info: '#2563EB',           
  
  // Textos (Jerarquía definida)
  text: '#0F172A',           // Mucho más oscuro
  textLight: '#475569',      // Más oscuro
  textMuted: '#64748B',      // Más oscuro      
  
  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  
  // Bordes y Divisores (Más definidos)
  outline: '#CBD5E1',        // Más visible
  outlineVariant: '#94A3B8', // Más definido
  border: '#CBD5E1',         // Más visible
  borderLight: '#E2E8F0',    // Más definido
  
  // Sombras (Más presentes)
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  // Gradientes (Más definidos)
  gradientStart: '#F1F5F9',
  gradientEnd: '#FAFAFA',
  
  // Alias para compatibilidad
  danger: '#DC2626',
  card: '#FFFFFF',
  textSecondary: '#64748B',
  buttonText: '#FFFFFF',
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
  card: '#1E293B',
  textSecondary: '#94A3B8',
  buttonText: '#1E1B4B',
} as const;

// Exportar el tema claro como default para compatibilidad
export const colors = lightColors;

export type Colors = typeof lightColors;
