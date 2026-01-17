import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useCategories } from '../context/CategoryContext';
import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/common/Card';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { TransactionType } from '../types';
import { CategoryFormScreen } from './CategoryFormScreen';
import { Ionicons } from '@expo/vector-icons';
import { categories as defaultCategories } from '../constants/categories';

interface CategoriesScreenProps {
  onClose?: () => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onClose }) => {
  const { customCategories, getAllCategories } = useCategories();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();
  
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  const allCategories = getAllCategories(selectedType);
  const predefinedCategories = selectedType !== 'transfer' ? defaultCategories[selectedType] : [];
  const customCategoriesList = allCategories.filter(c => c.id.startsWith('custom_'));
  
  // Combinar todas las categorías: predefinidas primero, luego personalizadas
  const allCategoriesToShow = [...predefinedCategories, ...customCategoriesList];

  const handleAddCategory = () => {
    setSelectedCategoryId(undefined);
    setCategoryFormVisible(true);
  };

  const handleEditCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCategoryFormVisible(true);
  };

  const handleCloseCategoryForm = () => {
    setCategoryFormVisible(false);
    setSelectedCategoryId(undefined);
  };

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
    closeButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    tabActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    section: {
      marginBottom: 16,
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
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 4,
    },
    categoryItemEditable: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 4,
    },
    categoryIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.onSurface,
    },
    categoryArrow: {
      marginLeft: 8,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorías</Text>
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Tabs Ingresos/Gastos */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'income' && styles.tabActive]}
              onPress={() => setSelectedType('income')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedType === 'income' && styles.tabTextActive]}>
                💰 Ingresos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'expense' && styles.tabActive]}
              onPress={() => setSelectedType('expense')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedType === 'expense' && styles.tabTextActive]}>
                💸 Gastos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Categorías */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Todas las Categorías</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCategory}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {allCategoriesToShow.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyText}>
                  No hay categorías disponibles.{'\n'}
                  Crea tu primera categoría para organizar tus finanzas.
                </Text>
              </View>
            ) : (
              allCategoriesToShow.map((category) => {
                const isCustom = category.id.startsWith('custom_');
                return isCustom ? (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItemEditable}
                    onPress={() => handleEditCategory(category.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                ) : (
                  <View key={category.id} style={styles.categoryItem}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Toast de notificaciones */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Modal de formulario de categoría */}
      <Modal
        visible={categoryFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <CategoryFormScreen
          categoryId={selectedCategoryId}
          type={selectedType}
          onClose={handleCloseCategoryForm}
        />
      </Modal>
    </SafeAreaView>
  );
};
