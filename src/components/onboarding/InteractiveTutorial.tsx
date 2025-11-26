import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { lightColors, darkColors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetRef?: React.RefObject<View>; // Referencia al elemento a destacar
  position?: { x: number; y: number; width: number; height: number }; // O posición manual
  spotlightType?: 'circle' | 'rect' | 'none'; // Tipo de spotlight
  action?: () => void; // Acción opcional al completar el step
}

interface InteractiveTutorialProps {
  visible: boolean;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  visible,
  steps,
  onComplete,
  onSkip,
}) => {
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Resetear al paso 0 cuando el tutorial se vuelve visible
  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
      
      // Fade in cuando se muestra
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animación de pulso para el spotlight
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep?.targetRef?.current) {
      // Medir la posición del elemento target
      currentStep.targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTargetPosition({ x: pageX, y: pageY, width, height });
      });
    } else if (currentStep?.position) {
      setTargetPosition(currentStep.position);
    }
  }, [currentStepIndex, currentStep]);

  const handleNext = () => {
    if (currentStep.action) {
      // Ejecutar la acción con un pequeño delay para mejor UX
      setTimeout(() => {
        currentStep.action?.();
      }, 100);
    }

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  const handleSkip = () => {
    if (onSkip) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onSkip();
      });
    }
  };

  // Calcular posición del tooltip
  const getTooltipPosition = () => {
    const tooltipHeight = 200;
    const padding = 20;
    const topMargin = 60; // Margen superior para tooltips sin spotlight
    
    // Si no hay spotlight (mensajes iniciales), centrar con margen superior
    if (currentStep.spotlightType === 'none') {
      return {
        top: topMargin,
        left: padding,
        right: padding,
      };
    }
    
    // Si el elemento está en la parte superior, mostrar tooltip abajo
    if (targetPosition.y < SCREEN_HEIGHT / 2) {
      return {
        top: targetPosition.y + targetPosition.height + padding,
        left: padding,
        right: padding,
      };
    }
    
    // Si está en la parte inferior, mostrar tooltip arriba
    return {
      bottom: SCREEN_HEIGHT - targetPosition.y + padding,
      left: padding,
      right: padding,
    };
  };

  // Calcular posición del spotlight
  const getSpotlightStyle = () => {
    const { x, y, width, height } = targetPosition;
    const padding = 16; // Padding alrededor del elemento (aumentado de 8 a 16)

    if (currentStep.spotlightType === 'circle') {
      const radius = Math.max(width, height) / 2 + padding * 2;
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      return {
        left: centerX - radius,
        top: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
      };
    }

    // Rectángulo por defecto
    return {
      left: x - padding,
      top: y - padding,
      width: width + padding * 2,
      height: height + padding * 2,
      borderRadius: 12,
    };
  };

  if (!visible) return null;

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    spotlightContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    spotlight: {
      position: 'absolute',
      backgroundColor: 'transparent',
      borderWidth: 3,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 20,
    },
    tooltip: {
      position: 'absolute',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    tooltipTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: 8,
    },
    tooltipDescription: {
      fontSize: 15,
      color: colors.onSurfaceVariant,
      lineHeight: 22,
      marginBottom: 20,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    navigationButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    skipButton: {
      backgroundColor: 'transparent',
    },
    backButton: {
      backgroundColor: colors.surfaceVariant,
    },
    nextButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    skipButtonText: {
      color: colors.onSurfaceVariant,
    },
    backButtonText: {
      color: colors.onSurface,
    },
    nextButtonText: {
      color: '#fff',
    },
    progressContainer: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 16,
      justifyContent: 'center',
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceVariant,
    },
    progressDotActive: {
      backgroundColor: colors.primary,
      width: 24,
    },
    stepCounter: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Spotlight en el elemento target */}
        {currentStep.spotlightType !== 'none' && targetPosition.width > 0 && (
          <Animated.View
            style={[
              styles.spotlightContainer,
            ]}
          >
            <Animated.View
              style={[
                styles.spotlight,
                getSpotlightStyle(),
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          </Animated.View>
        )}

        {/* Tooltip con información */}
        <View style={[styles.tooltip, getTooltipPosition()]}>
          <Text style={styles.stepCounter}>
            Paso {currentStepIndex + 1} de {steps.length}
          </Text>
          
          <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
          <Text style={styles.tooltipDescription}>{currentStep.description}</Text>

          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStepIndex && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Botones de navegación */}
          <View style={styles.buttonsContainer}>
            {onSkip && (
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, styles.skipButtonText]}>
                  Saltar
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.navigationButtons}>
              {currentStepIndex > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.backButton]}
                  onPress={handlePrevious}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, styles.backButtonText]}>
                    Atrás
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, styles.nextButtonText]}>
                  {isLastStep ? '¡Entendido!' : 'Siguiente'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};
