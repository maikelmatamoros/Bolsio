// Paleta de Colores Material Design 3 - Indigo Professional
// Generada siguiendo el sistema oficial de MD3 con armonía garantizada

// TEMA CLARO
export const lightColors = {
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

// TEMA OSCURO
export const darkColors = {
  // Colores Principales (MD3 Dark - Primary)
  primary: '#D0BCFF',        // Indigo claro para contraste
  onPrimary: '#381E72',      
  primaryContainer: '#4F378B', 
  onPrimaryContainer: '#EADDFF', 
  
  // Secundario (MD3 Dark - Secondary)
  secondary: '#CCC2DC',      
  onSecondary: '#332D41',    
  secondaryContainer: '#4A4458', 
  onSecondaryContainer: '#E8DEF8', 
  
  // Terciario (MD3 Dark - Tertiary) 
  tertiary: '#EFB8C8',       
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  
  // Fondos y Superficies (MD3 Dark)
  background: '#1C1B1F',     
  onBackground: '#E6E1E5',   
  surface: '#1C1B1F',        
  onSurface: '#E6E1E5',      
  surfaceVariant: '#49454F', 
  onSurfaceVariant: '#CAC4D0', 
  surfaceHover: '#2B2930',   
  
  // Colores de Transacciones
  income: '#81C784',         // Verde más suave para dark
  expense: '#E57373',        // Rojo más suave para dark
  
  // Estados (MD3 Dark)
  error: '#F2B8B5',          
  onError: '#601410',        
  errorContainer: '#8C1D18', 
  onErrorContainer: '#F9DEDC', 
  
  success: '#81C784',        
  warning: '#FFD54F',        
  info: '#64B5F6',           
  
  // Textos
  text: '#E6E1E5',           
  textLight: '#CAC4D0',      
  textMuted: '#938F99',      
  
  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  
  // Bordes y Divisores (MD3 Dark)
  outline: '#938F99',        
  outlineVariant: '#49454F', 
  border: '#49454F',         
  borderLight: '#2B2930',    
  
  // Sombras
  shadow: '#000000',
  shadowDark: '#000000',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Gradientes
  gradientStart: '#D0BCFF',
  gradientEnd: '#CCC2DC',
  
  // Alias para compatibilidad
  danger: '#F2B8B5',
} as const;

// Exportar el tema claro como default para compatibilidad
export const colors = lightColors;

export type Colors = typeof lightColors;
