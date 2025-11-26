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
import { IconButton, Chip } from 'react-native-paper';
import { useCategories } from '../context/CategoryContext';
import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/common/Card';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { TransactionType, ICategory } from '../types';
import { categories as defaultCategories } from '../constants/categories';
import { CategoryFormScreen } from './CategoryFormScreen';

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
  const predefinedCategories = defaultCategories[selectedType];
  const customCategoriesList = customCategories[selectedType];

  const handleAddCategory = () => {
    setSelectedCategoryId(undefined);
    setCategoryFormVisible(true);
  };

  const handleEditCategory = (categoryId: string) => {
    // Solo permitir editar categorías personalizadas
    if (categoryId.startsWith('custom_')) {
      setSelectedCategoryId(categoryId);
      setCategoryFormVisible(true);
    } else {
      showToast('Las categorías predefinidas no se pueden editar', 'info');
    }
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
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    tabContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    tabActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.primary,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryContainer,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 4,
    },
    categoryList: {
      gap: 8,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    categoryIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    categoryBadge: {
      marginTop: 4,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
      fontStyle: 'italic',
      padding: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorías</Text>
        {onClose && (
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            iconColor={colors.textMuted}
          />
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Tabs Ingresos/Gastos */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'income' && styles.tabActive]}
              onPress={() => setSelectedType('income')}
            >
              <Text style={[styles.tabText, selectedType === 'income' && styles.tabTextActive]}>
                💰 Ingresos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'expense' && styles.tabActive]}
              onPress={() => setSelectedType('expense')}
            >
              <Text style={[styles.tabText, selectedType === 'expense' && styles.tabTextActive]}>
                💸 Gastos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categorías Predefinidas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorías Predefinidas</Text>
            </View>
            <View style={styles.categoryList}>
              {predefinedCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => handleEditCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Chip
                      mode="outlined"
                      textStyle={{ fontSize: 11 }}
                      style={styles.categoryBadge}
                      compact
                    >
                      Por defecto
                    </Chip>
                  </View>
                  <IconButton
                    icon="information-outline"
                    size={20}
                    iconColor={colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categorías Personalizadas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Categorías</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                <IconButton icon="plus" size={18} iconColor={colors.primary} style={{ margin: 0 }} />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
            
            {customCategoriesList.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>
                  No tienes categorías personalizadas.{'\n'}
                  ¡Crea una para empezar!
                </Text>
              </Card>
            ) : (
              <View style={styles.categoryList}>
                {customCategoriesList.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => handleEditCategory(category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <IconButton
                      icon="chevron-right"
                      size={20}
                      iconColor={colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
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
