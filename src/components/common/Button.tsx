import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { colors } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  style 
}) => {
  // Mapear variantes a colores
  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'danger':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  return (
    <PaperButton
      mode="contained"
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={style}
      buttonColor={getButtonColor()}
      textColor={colors.white}
      contentStyle={{ paddingVertical: 6 }}
    >
      {title}
    </PaperButton>
  );
};
