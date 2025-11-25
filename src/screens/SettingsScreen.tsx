import React from 'react';
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
import { Card } from '../components/common/Card';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

interface SettingsScreenProps {
  navigation?: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { accounts, getTotalBalance, loading } = useAccounts();

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
              onPress={() => {/* TODO: Navegar a agregar cuenta */}}
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
                    description={formatCurrency(account.balance)}
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
                    onPress={() => {/* TODO: Editar cuenta */}}
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
                  {formatCurrency(getTotalBalance())}
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
              onPress={() => {/* TODO: Navegar a categorías */}}
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
              description="MXN - Peso Mexicano"
              left={() => <List.Icon icon="currency-usd" color={colors.primary} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
            />
            <Divider key="divider-currency" />
            <List.Item
              key="settings-theme"
              title="Tema"
              description="Claro"
              left={() => <List.Icon icon="palette-outline" color={colors.primary} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
            />
          </Card>
        </View>

        {/* Sección de Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos</Text>
          <Card>
            <List.Item
              key="settings-export"
              title="Exportar datos"
              description="Descarga tus transacciones"
              left={() => <List.Icon icon="download-outline" color={colors.info} />}
              right={() => (
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={colors.textMuted}
                />
              )}
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
            />
          </Card>
        </View>

        {/* Información de la app */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>MoneyTrack v1.0.0</Text>
          <Text style={styles.appInfoText}>Control de Finanzas Personales</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    padding: 20,
    paddingTop: 10,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
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
