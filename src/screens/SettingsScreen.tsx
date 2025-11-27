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
import { List, Divider, IconButton } from 'react-native-paper';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../context/TransactionContext';
import { useSettings } from '../context/SettingsContext';
import { isFeatureEnabled, getEnabledFeatures } from '../config/featureFlags';
import { useTutorial } from '../hooks/useTutorial';
import { Card } from '../components/common/Card';
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
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textLight,
      marginTop: 2,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    addButton: {
      margin: 0,
      padding: 0,
    },
    accountsCard: {
      padding: 0,
    },
    accountIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    accountIconText: {
      fontSize: 24,
    },
    accountTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    accountBalance: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 4,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textLight,
      fontSize: 14,
      padding: 20,
    },
    totalCard: {
      marginTop: 12,
      backgroundColor: colors.primaryContainer,
    },
    totalContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 14,
      color: colors.onPrimaryContainer,
      fontWeight: '500',
    },
    totalAmount: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.onPrimaryContainer,
    },
    appInfo: {
      alignItems: 'center',
      padding: 32,
      marginTop: 16,
    },
    appInfoText: {
      fontSize: 12,
      color: colors.textMuted,
      marginVertical: 2,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus cuentas y preferencias</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Sección de Cuentas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuentas / Sobres</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddAccount}
            >
              <IconButton icon="plus" size={20} iconColor={colors.primary} />
            </TouchableOpacity>
          </View>

          <Card style={styles.accountsCard}>
            {loading ? (
              <Text style={styles.emptyText}>Cargando cuentas...</Text>
            ) : accounts.length === 0 ? (
              <Text style={styles.emptyText}>No hay cuentas configuradas</Text>
            ) : (
              accounts.map((account, index) => (
                <React.Fragment key={account.id}>
                  <List.Item
                    title={account.name}
                    description={formatCurrency(account.balance, settings.currency.symbol)}
                    left={() => (
                      <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                        <Text style={styles.accountIconText}>{account.icon}</Text>
                      </View>
                    )}
                    right={() => (
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={colors.textMuted}
                      />
                    )}
                    onPress={() => handleEditAccount(account.id)}
                    titleStyle={styles.accountTitle}
                    descriptionStyle={styles.accountBalance}
                  />
                  {index < accounts.length - 1 && <Divider key={`divider-${account.id}`} />}
                </React.Fragment>
              ))
            )}
          </Card>

          {/* Total Balance Card */}
          {accounts.length > 0 && !loading && (
            <Card style={styles.totalCard}>
              <View style={styles.totalContent}>
                <Text style={styles.totalLabel}>Balance Total</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(getTotalBalance(), settings.currency.symbol)}
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Sección de Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <Card>
            <List.Item
              key="settings-categories"
              title="Gestionar categorías"
              description="Personaliza tus categorías de gastos e ingresos"
              left={() => <List.Icon icon="tag-outline" color={colors.primary} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
              onPress={() => setCategoriesVisible(true)}
            />
          </Card>
        </View>

        {/* Sección de Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <Card>
            <List.Item
              key="settings-currency"
              title="Moneda"
              description={`${settings.currency.code} - ${settings.currency.name}`}
              left={() => <List.Icon icon="currency-usd" color={colors.primary} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
              onPress={() => setCurrencyModalVisible(true)}
            />
            <Divider key="divider-currency" />
            <List.Item
              key="settings-theme"
              title="Tema"
              description={settings.theme === 'light' ? 'Claro' : 'Oscuro'}
              left={() => <List.Icon icon="palette-outline" color={colors.primary} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
              onPress={() => setThemeModalVisible(true)}
            />
          </Card>
        </View>

        {/* Sección de Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos</Text>
          <Card>
            <List.Item
              key="settings-export"
              title="Exportar reporte"
              description="Genera un reporte PDF de tus finanzas"
              left={() => <List.Icon icon="download-outline" color={colors.primary} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
              onPress={() => setExportVisible(true)}
            />
            <Divider key="divider-export" />
            <List.Item
              key="settings-delete"
              title="Borrar todo"
              description="Eliminar todas las transacciones y cuentas"
              left={() => <List.Icon icon="delete-outline" color={colors.error} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
              onPress={() => setDeleteAllDialogVisible(true)}
            />
            <Divider key="divider-delete" />
            <List.Item
              key="settings-reset-tutorial"
              title="Resetear tutorial"
              description="Ver el tutorial interactivo nuevamente"
              left={() => <List.Icon icon="help-circle-outline" color={colors.info} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
              onPress={handleResetTutorial}
            />
          </Card>
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
