import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <PaperCard style={style} mode="elevated" elevation={1}>
      <PaperCard.Content>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
};
