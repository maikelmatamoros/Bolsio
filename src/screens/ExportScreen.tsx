import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { ExportService } from '../services/ExportService';
import { formatMonthYear } from '../utils/formatters';

interface ExportScreenProps {
  onClose: () => void;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ onClose }) => {
  const { transactions, getBalance } = useTransactions();
  const { settings } = useSettings();
  const { toast, showToast, hideToast } = useToast();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  const [startMonth, setStartMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endMonth, setEndMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (startMonth > endMonth) {
      showToast('El mes inicial debe ser anterior al mes final', 'error');
      return;
    }

    setExporting(true);
    try {
      const success = await ExportService.generatePDFReport({
        totalBalance: getBalance(),
        startMonth,
        endMonth,
        transactions,
        currencySymbol: settings.currency.symbol,
      });

      if (success) {
        showToast('Reporte generado correctamente', 'success');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showToast('Error al generar el reporte', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('Error al exportar los datos', 'error');
    } finally {
      setExporting(false);
    }
  };

  const adjustMonth = (date: Date, increment: number, setter: (date: Date) => void) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + increment);
    setter(newDate);
  };

  const canGoForwardStart = startMonth < new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const canGoForwardEnd = endMonth < new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.onSurface,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 12,
    },
    monthSelector: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    monthSelectorLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    monthControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      textTransform: 'capitalize',
      flex: 1,
      textAlign: 'center',
    },
    infoCard: {
      backgroundColor: colors.primaryContainer,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    infoText: {
      fontSize: 14,
      color: colors.onPrimaryContainer,
      lineHeight: 20,
    },
    exportButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    exportButtonDisabled: {
      opacity: 0.5,
    },
    exportButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    previewSection: {
      marginTop: 8,
      marginBottom: 24,
    },
    previewCard: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
    },
    previewLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    previewValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.onSurface,
      textTransform: 'capitalize',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          iconColor={colors.onSurface}
          onPress={onClose}
        />
        <Text style={styles.headerTitle}>Exportar Reporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📊 Genera un reporte PDF con tu balance total y el detalle de ingresos y gastos del período seleccionado.
          </Text>
        </View>

        {/* Mes Inicial */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes Inicial</Text>
          <View style={styles.monthSelector}>
            <Text style={styles.monthSelectorLabel}>Desde</Text>
            <View style={styles.monthControls}>
              <TouchableOpacity onPress={() => adjustMonth(startMonth, -1, setStartMonth)}>
                <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.monthText}>{formatMonthYear(startMonth)}</Text>
              <TouchableOpacity
                onPress={() => adjustMonth(startMonth, 1, setStartMonth)}
                disabled={!canGoForwardStart}
                style={{ opacity: canGoForwardStart ? 1 : 0.3 }}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mes Final */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes Final</Text>
          <View style={styles.monthSelector}>
            <Text style={styles.monthSelectorLabel}>Hasta</Text>
            <View style={styles.monthControls}>
              <TouchableOpacity onPress={() => adjustMonth(endMonth, -1, setEndMonth)}>
                <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.monthText}>{formatMonthYear(endMonth)}</Text>
              <TouchableOpacity
                onPress={() => adjustMonth(endMonth, 1, setEndMonth)}
                disabled={!canGoForwardEnd}
                style={{ opacity: canGoForwardEnd ? 1 : 0.3 }}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Período a exportar</Text>
            <Text style={styles.previewValue}>
              {formatMonthYear(startMonth)} - {formatMonthYear(endMonth)}
            </Text>
          </View>
        </View>

        {/* Botón de Exportar */}
        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.exportButtonText}>Generando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.exportButtonText}>Generar Reporte PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Toast */}
      {toast.visible && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <View
            style={{
              backgroundColor: toast.type === 'success' ? colors.income : colors.expense,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Ionicons
              name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color="#fff"
            />
            <Text style={{ color: '#fff', fontSize: 14, flex: 1 }}>{toast.message}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
