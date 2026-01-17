import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface FabMenuItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  backgroundColor?: string;
}

export interface FabMenuProps {
  menuItems: FabMenuItem[];
  visible: boolean;
  onToggle: () => void;
  fabIcon?: keyof typeof Ionicons.glyphMap;
  fabBackgroundColor?: string;
}

export const FabMenu: React.FC<FabMenuProps> = ({
  menuItems,
  visible,
  onToggle,
  fabIcon = 'add',
  fabBackgroundColor,
}) => {
  const colors = useThemeColors();

  // Animations
  const [fabAnimation] = useState(new Animated.Value(0));
  const [menuItemsAnimation] = useState(
    menuItems.map(() => new Animated.Value(0))
  );

  // Toggle menu with animations
  const toggleMenu = () => {
    const isOpening = !visible;

    // Animate FAB rotation
    Animated.spring(fabAnimation, {
      toValue: isOpening ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Animate menu items
    menuItems.forEach((_, index) => {
      Animated.spring(menuItemsAnimation[index], {
        toValue: isOpening ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
        delay: isOpening ? index * 50 : (menuItems.length - 1 - index) * 50,
      }).start();
    });

    onToggle();
  };

  const handleMenuItemPress = (item: FabMenuItem) => {
    toggleMenu();
    item.onPress();
  };

  const styles = {
    // FAB principal
    fab: {
      position: 'absolute' as const,
      bottom: 15,
      right: 24,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: fabBackgroundColor || colors.primary,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    fabIcon: {
      fontSize: 24,
      color: colors.onPrimary,
    },

    // Items del menú
    fabMenuItem: {
      position: 'absolute' as const,
      bottom: 20,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },

    // Label del menú
    fabMenuLabel: {
      position: 'absolute' as const,
      right: 70,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    fabMenuLabelText: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.text,
    },
  };

  return (
    <>
      {/* FAB principal */}
      <Animated.View style={[
        styles.fab,
        {
          transform: [{
            rotate: fabAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '45deg']
            })
          }]
        }
      ]}>
        <TouchableOpacity
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Ionicons name={fabIcon} style={styles.fabIcon} />
        </TouchableOpacity>
      </Animated.View>

      {/* Items del menú */}
      {visible && menuItems.map((item, index) => (
        <Animated.View
          key={item.key}
          style={[
            styles.fabMenuItem,
            {
              backgroundColor: item.backgroundColor || colors.primary,
              transform: [
                { scale: menuItemsAnimation[index] },
                { translateY: -(80 + index * 60) }
              ],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleMenuItemPress(item)}
            activeOpacity={0.8}
          >
            <Ionicons name={item.icon} size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.fabMenuLabel}>
            <Text style={styles.fabMenuLabelText}>{item.label}</Text>
          </View>
        </Animated.View>
      ))}
    </>
  );
};