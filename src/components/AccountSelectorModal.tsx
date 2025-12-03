import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { IconButton, Divider } from 'react-native-paper';
import { useAccounts } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../constants/colors';
import { IAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface AccountSelectorModalProps {
  visible: boolean;
  selectedAccountId?: string;
  excludeAccountId?: string; // Excluir una cuenta específica de la lista
  onSelect: (account: IAccount) => void;
  onDismiss: () => void;
}

export const AccountSelectorModal: React.FC<AccountSelectorModalProps> = ({
  visible,
  selectedAccountId,
  excludeAccountId,
  onSelect,
  onDismiss,
}) => {
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  const activeAccounts = accounts
    .filter(a => a.isActive)
    .filter(a => !excludeAccountId || a.id !== excludeAccountId);

  const handleSelect = (account: IAccount) => {
    onSelect(account);
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
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    list: {
      maxHeight: 400,
    },
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    accountItemActive: {
      backgroundColor: colors.primaryContainer,
    },
    accountIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    accountIcon: {
      fontSize: 28,
    },
    accountInfo: {
      flex: 1,
    },
    accountName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    accountBalance: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 4,
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
      fontStyle: 'italic',
      marginTop: 8,
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
            <Text style={styles.title}>Seleccionar Cuenta</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={colors.textMuted}
            />
          </View>

        <ScrollView style={styles.list}>
          {activeAccounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💳</Text>
              <Text style={styles.emptyText}>
                No tienes cuentas activas.{'\n'}
                Crea una desde Ajustes.
              </Text>
            </View>
          ) : (
            activeAccounts.map((account, index) => (
              <React.Fragment key={account.id}>
                <TouchableOpacity
                  style={[
                    styles.accountItem,
                    selectedAccountId === account.id && styles.accountItemActive,
                  ]}
                  onPress={() => handleSelect(account)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accountIconContainer, { backgroundColor: account.color }]}>
                    <Text style={styles.accountIcon}>{account.icon}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBalance}>
                      {formatCurrency(account.balance, settings.currency.symbol)}
                    </Text>
                  </View>
                  {selectedAccountId === account.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
                {index < activeAccounts.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
