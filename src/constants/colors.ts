// Paleta de Colores Material Design 3 - Indigo Professional
// Generada siguiendo el sistema oficial de MD3 con armonía garantizada
export const colors = {
  // Colores Principales (MD3 - Primary)
  primary: '#6750A4',        // Indigo MD3 baseline
  onPrimary: '#FFFFFF',      
  primaryContainer: '#EADDFF', 
  onPrimaryContainer: '#21005D', 
  
  // Secundario (MD3 - Secondary)
  secondary: '#625B71',      // Purple gray complementario
  onSecondary: '#FFFFFF',    
  secondaryContainer: '#E8DEF8', 
  onSecondaryContainer: '#1D192B', 
  
  // Terciario (MD3 - Tertiary) 
  tertiary: '#7D5260',       // Marrón rosado
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  
  // Fondos y Superficies (MD3)
  background: '#FFFBFE',     // Ligeramente cálido
  onBackground: '#1C1B1F',   
  surface: '#FFFBFE',        
  onSurface: '#1C1B1F',      
  surfaceVariant: '#E7E0EC', 
  onSurfaceVariant: '#49454F', 
  surfaceHover: '#F3EDF7',   
  
  // Colores de Transacciones (manteniendo semántica clara)
  income: '#4CAF50',         // Verde Material
  expense: '#F44336',        // Rojo Material
  
  // Estados (MD3)
  error: '#B3261E',          
  onError: '#FFFFFF',        
  errorContainer: '#F9DEDC', 
  onErrorContainer: '#410E0B', 
  
  success: '#4CAF50',        
  warning: '#F9A825',        
  info: '#2196F3',           
  
  // Textos (basados en onSurface)
  text: '#1C1B1F',           
  textLight: '#49454F',      
  textMuted: '#79747E',      
  
  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  
  // Bordes y Divisores (MD3)
  outline: '#79747E',        
  outlineVariant: '#CAC4D0', 
  border: '#CAC4D0',         
  borderLight: '#E7E0EC',    
  
  // Sombras
  shadow: '#000000',
  shadowDark: '#000000',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradientes
  gradientStart: '#6750A4',
  gradientEnd: '#625B71',
  
  // Alias para compatibilidad
  danger: '#B3261E',
} as const;

export type Colors = typeof colors;
