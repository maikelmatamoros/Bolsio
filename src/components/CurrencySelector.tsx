import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Currency, CURRENCIES, useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface CurrencySelectorProps {
  visible: boolean;
  onDismiss: () => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ visible, onDismiss }) => {
  const { settings, updateCurrency } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  const handleSelectCurrency = async (currency: Currency) => {
    await updateCurrency(currency);
    onDismiss();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: colors.surface,
      width: '90%',
      maxHeight: '80%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    list: {
      maxHeight: 400,
    },
    currencyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    currencyItemActive: {
      backgroundColor: colors.primaryContainer,
    },
    currencyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    currencySymbol: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      width: 50,
      textAlign: 'center',
    },
    currencyText: {
      marginLeft: 12,
    },
    currencyName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    currencyCode: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onDismiss}
      >
        <TouchableOpacity 
          style={styles.modal} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Moneda</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.list}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyItem,
                  settings.currency.code === currency.code && styles.currencyItemActive,
                ]}
                onPress={() => handleSelectCurrency(currency)}
                activeOpacity={0.7}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  <View style={styles.currencyText}>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                  </View>
                </View>
                
                {settings.currency.code === currency.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
