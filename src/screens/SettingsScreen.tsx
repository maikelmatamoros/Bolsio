import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../context/TransactionContext';
import { useSettings } from '../context/SettingsContext';
import { useTutorial } from '../hooks/useTutorial';
import { Dialog } from '../components/common/Dialog';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { CurrencySelector } from '../components/CurrencySelector';
import { ThemeSelector } from '../components/ThemeSelector';
import { AccountFormScreen } from './AccountFormScreen';
import { CategoriesScreen } from './CategoriesScreen';
import { ExportScreen } from './ExportScreen';
import { lightColors, darkColors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  navigation?: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { accounts, getTotalBalance, loading, clearAllAccounts } = useAccounts();
  const { transactions, loadTransactions } = useTransactions();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();
  const { resetTutorial } = useTutorial();
  
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [accountFormVisible, setAccountFormVisible] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [deleteAllDialogVisible, setDeleteAllDialogVisible] = useState(false);

  const handleAddAccount = () => {
    setSelectedAccountId(undefined);
    setAccountFormVisible(true);
  };

  const handleEditAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setAccountFormVisible(true);
  };

  const handleCloseAccountForm = () => {
    setAccountFormVisible(false);
    setSelectedAccountId(undefined);
  };

  const handleDeleteAll = async () => {
    try {
      // Importar AsyncStorage para borrar todo
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Borrar todas las claves de Bolsio
      await AsyncStorage.multiRemove([
        '@Bolsio:transactions',
        '@Bolsio:accounts',
        '@Bolsio:customCategories',
        // Mantener configuraciones
        // '@Bolsio:settings',
      ]);

      // Recargar datos
      await loadTransactions();
      await clearAllAccounts();

      showToast('Todos los datos han sido eliminados', 'success');
      setDeleteAllDialogVisible(false);
    } catch (error) {
      console.error('Error deleting all data:', error);
      showToast('Error al eliminar los datos', 'error');
    }
  };

  const handleResetTutorial = async () => {
    try {
      await resetTutorial();
      showToast('Tutorial reseteado. Se mostrará al volver a Inicio', 'success');
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      showToast('Error al resetear el tutorial', 'error');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
    },
    section: {
      marginTop: 16,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    addButton: {
      padding: 4,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 4,
    },
    settingItemPressed: {
      backgroundColor: colors.surfaceVariant,
    },
    settingIcon: {
      width: 32,
      alignItems: 'center',
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.onSurface,
    },
    settingDescription: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    settingArrow: {
      marginLeft: 8,
    },
    accountIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    accountIconText: {
      fontSize: 18,
    },
    accountTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.onSurface,
    },
    accountBalance: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      fontSize: 14,
      padding: 20,
    },
    totalCard: {
      marginTop: 8,
      backgroundColor: colors.primaryContainer,
      borderRadius: 8,
    },
    totalContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    totalLabel: {
      fontSize: 12,
      color: colors.onPrimaryContainer,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.onPrimaryContainer,
    },
    appInfo: {
      alignItems: 'center',
      padding: 24,
      marginTop: 16,
    },
    appInfoText: {
      fontSize: 11,
      color: colors.onSurfaceVariant,
      marginVertical: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Sección de Cuentas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuentas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.settingItem}>
              <Text style={styles.emptyText}>Cargando cuentas...</Text>
            </View>
          ) : accounts.length === 0 ? (
            <View style={styles.settingItem}>
              <Text style={styles.emptyText}>No hay cuentas configuradas</Text>
            </View>
          ) : (
            accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.settingItem}
                onPress={() => handleEditAccount(account.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                  <Text style={styles.accountIconText}>{account.icon}</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.accountTitle}>{account.name}</Text>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance, settings.currency.symbol)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))
          )}

          {/* Total Balance Card */}
          {accounts.length > 0 && !loading && (
            <View style={styles.totalCard}>
              <View style={styles.totalContent}>
                <Text style={styles.totalLabel}>Balance Total</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(getTotalBalance(), settings.currency.symbol)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Sección de Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setCategoriesVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Gestionar categorías</Text>
              <Text style={styles.settingDescription}>Personaliza tus categorías de gastos e ingresos</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Sección de Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setCurrencyModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Moneda</Text>
              <Text style={styles.settingDescription}>
                {settings.currency.code} - {settings.currency.name}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setThemeModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Tema</Text>
              <Text style={styles.settingDescription}>
                {settings.theme === 'light' ? 'Claro' : 'Oscuro'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Sección de Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setExportVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="download-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Exportar reporte</Text>
              <Text style={styles.settingDescription}>Genera un reporte PDF de tus finanzas</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setDeleteAllDialogVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Borrar todo</Text>
              <Text style={styles.settingDescription}>Eliminar todas las transacciones y cuentas</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetTutorial}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Resetear tutorial</Text>
              <Text style={styles.settingDescription}>Ver el tutorial interactivo nuevamente</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Información de la app */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Bolsio v1.0.0</Text>
          <Text style={styles.appInfoText}>Control de Finanzas Personales</Text>
        </View>
      </ScrollView>

      {/* Modal de selección de moneda */}
      <CurrencySelector
        visible={currencyModalVisible}
        onDismiss={() => setCurrencyModalVisible(false)}
      />

      {/* Modal de selección de tema */}
      <ThemeSelector
        visible={themeModalVisible}
        onDismiss={() => setThemeModalVisible(false)}
      />

      {/* Modal de formulario de cuenta */}
      <Modal
        visible={accountFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AccountFormScreen
          accountId={selectedAccountId}
          onClose={handleCloseAccountForm}
        />
      </Modal>

      {/* Modal de categorías */}
      <Modal
        visible={categoriesVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <CategoriesScreen onClose={() => setCategoriesVisible(false)} />
      </Modal>

      {/* Modal de exportación */}
      <Modal
        visible={exportVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ExportScreen onClose={() => setExportVisible(false)} />
      </Modal>

      {/* Diálogo de confirmación para borrar todo */}
      <Dialog
        visible={deleteAllDialogVisible}
        title="¿Borrar todos los datos?"
        message={`Esta acción eliminará:\n\n• ${transactions.length} transacciones\n• ${accounts.length} cuentas\n• Todas las categorías personalizadas\n\nEsta acción NO se puede deshacer.`}
        type="error"
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setDeleteAllDialogVisible(false),
          },
          {
            text: 'Borrar Todo',
            style: 'destructive',
            onPress: handleDeleteAll,
          },
        ]}
        onDismiss={() => setDeleteAllDialogVisible(false)}
      />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};
