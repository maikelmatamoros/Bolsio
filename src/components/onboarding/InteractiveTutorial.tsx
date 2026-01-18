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
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
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
  const tooltipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Resetear al paso 0 cuando el tutorial se vuelve visible
  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
      setTargetPosition({ x: 0, y: 0, width: 0, height: 0 });

      // Resetear animaciones
      tooltipAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Fade in del overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Animación de entrada del tooltip con delay
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(tooltipAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Animación de pulso para el spotlight (más sutil)
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Resetear animaciones cuando se oculta
      fadeAnim.setValue(0);
      tooltipAnim.setValue(0);
      scaleAnim.setValue(0.8);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep?.targetRef?.current) {
      // Medir la posición del elemento target con mejor manejo de errores
      const measureElement = () => {
        try {
          currentStep.targetRef!.current.measure((x, y, width, height, pageX, pageY) => {
            if (width > 0 && height > 0) {
              setTargetPosition({ x: pageX, y: pageY, width, height });
            } else {
              // Reintentar medición si las dimensiones son inválidas
              setTimeout(measureElement, 100);
            }
          });
        } catch (error) {
          console.warn('Error measuring element:', error);
          // Usar posición por defecto si falla la medición
          setTargetPosition({ x: SCREEN_WIDTH / 2 - 50, y: SCREEN_HEIGHT / 2 - 50, width: 100, height: 100 });
        }
      };

      // Pequeño delay para asegurar que el elemento esté renderizado
      setTimeout(measureElement, 50);
    } else if (currentStep?.position) {
      setTargetPosition(currentStep.position);
    } else {
      // Posición por defecto para mensajes sin spotlight
      setTargetPosition({ x: 0, y: 0, width: 0, height: 0 });
    }
  }, [currentStepIndex, currentStep]);

  const handleNext = () => {
    if (currentStep.action) {
      // Ejecutar la acción con un pequeño delay para mejor UX
      setTimeout(() => {
        currentStep.action?.();
      }, 150);
    }

    if (isLastStep) {
      handleComplete();
    } else {
      // Animación sutil al cambiar de paso
      Animated.parallel([
        Animated.timing(tooltipAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStepIndex(prev => prev + 1);
        Animated.parallel([
          Animated.timing(tooltipAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      // Animación sutil al volver atrás
      Animated.parallel([
        Animated.timing(tooltipAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStepIndex(prev => prev - 1);
        Animated.parallel([
          Animated.timing(tooltipAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      });
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

  // Calcular posición del tooltip con mejor UX - NUNCA tapa el elemento
  // Tooltip fijo en la parte superior para evitar movimiento
  const getTooltipPosition = () => {
    return {
      position: 'absolute' as const,
      top: 60,
      left: 24,
      right: 24,
    };
  };

  // Calcular posición del spotlight
  const getSpotlightStyle = () => {
    const { x, y, width, height } = targetPosition;
    const padding = 12; // Padding sincronizado con el agujero del overlay

    if (currentStep.spotlightType === 'circle') {
      const radius = Math.max(width, height) / 2 + padding;
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
    overlayContainer: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', // Overlay oscuro
    },
    spotlightBorder: {
      position: 'absolute',
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.9)',
      shadowColor: '#fff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 10,
    },
    tooltip: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    tooltipTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.onSurface,
      marginBottom: 12,
      lineHeight: 28,
    },
    tooltipDescription: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      lineHeight: 24,
      marginBottom: 24,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 90,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    skipButton: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.outline,
    },
    backButton: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    nextButton: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 0,
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
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    progressBar: {
      flex: 1,
      height: 6,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 3,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    tooltipHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    stepCounter: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
    },
    skipButtonCompact: {
      padding: 4,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlayContainer, { opacity: fadeAnim }]}>
        {/* Overlay con agujero transparente */}
        {currentStep.spotlightType !== 'none' && targetPosition.width > 0 ? (
          <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
            <Defs>
              <Mask id="mask">
                <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white" />
                {currentStep.spotlightType === 'circle' ? (
                  <Circle
                    cx={targetPosition.x + targetPosition.width / 2}
                    cy={targetPosition.y + targetPosition.height / 2}
                    r={Math.max(targetPosition.width, targetPosition.height) / 2 + 12}
                    fill="black"
                  />
                ) : (
                  <Rect
                    x={targetPosition.x - 12}
                    y={targetPosition.y - 12}
                    width={targetPosition.width + 24}
                    height={targetPosition.height + 24}
                    rx={12}
                    fill="black"
                  />
                )}
              </Mask>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              fill="rgba(0, 0, 0, 0.85)"
              mask="url(#mask)"
            />
          </Svg>
        ) : (
          <View style={styles.overlay} />
        )}

        {/* Borde brillante alrededor del elemento enfocado */}
        {currentStep.spotlightType !== 'none' && targetPosition.width > 0 && (
          <Animated.View
            style={[
              styles.spotlightBorder,
              getSpotlightStyle(),
              { transform: [{ scale: pulseAnim }] },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Tooltip con información */}
        <Animated.View
          style={[
            styles.tooltip,
            getTooltipPosition(),
            {
              opacity: tooltipAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header con contador y botón skip */}
          <View style={styles.tooltipHeader}>
            <Text style={styles.stepCounter}>
              Paso {currentStepIndex + 1} de {steps.length}
            </Text>
            {onSkip && (
              <TouchableOpacity
                style={styles.skipButtonCompact}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
          <Text style={styles.tooltipDescription}>{currentStep.description}</Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.stepCounter}>
              {currentStepIndex + 1}/{steps.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Botones de navegación */}
          <View style={styles.buttonsContainer}>
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
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
