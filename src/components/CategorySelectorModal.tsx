import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { IconButton, Divider } from 'react-native-paper';
import { useCategories } from '../context/CategoryContext';
import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../constants/colors';
import { TransactionType, ICategory } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { categories as defaultCategories } from '../constants/categories';

interface CategorySelectorModalProps {
  visible: boolean;
  type: TransactionType;
  selectedCategoryId?: string;
  onSelect: (category: ICategory) => void;
  onDismiss: () => void;
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  visible,
  type,
  selectedCategoryId,
  onSelect,
  onDismiss,
}) => {
  const { getAllCategories } = useCategories();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = getAllCategories(type);
  const predefinedCategories = type !== 'transfer' ? defaultCategories[type] : [];
  const customCategories = allCategories.filter(c => c.id.startsWith('custom_'));

  // Filtrar por búsqueda
  const filteredPredefined = predefinedCategories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustom = customCategories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (category: ICategory) => {
    onSelect(category);
    setSearchQuery('');
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
    searchContainer: {
      padding: 16,
      paddingBottom: 8,
    },
    searchInput: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: colors.text,
    },
    list: {
      maxHeight: 450,
    },
    section: {
      paddingTop: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surfaceVariant,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingVertical: 12,
    },
    categoryItemActive: {
      backgroundColor: colors.primaryContainer,
    },
    categoryIcon: {
      fontSize: 28,
      marginRight: 12,
      width: 36,
      textAlign: 'center',
    },
    categoryName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
      padding: 32,
      fontStyle: 'italic',
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
            <Text style={styles.title}>
              {type === 'income' ? '💰 Categoría de Ingreso' : '💸 Categoría de Gasto'}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={colors.textMuted}
            />
          </View>

          {/* Búsqueda */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar categoría..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.list}>
          {/* Categorías Predefinidas */}
          {filteredPredefined.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PREDEFINIDAS</Text>
              {filteredPredefined.map((category, index) => (
                <React.Fragment key={category.id}>
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      selectedCategoryId === category.id && styles.categoryItemActive,
                    ]}
                    onPress={() => handleSelect(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    {selectedCategoryId === category.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  {index < filteredPredefined.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Categorías Personalizadas */}
          {filteredCustom.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MIS CATEGORÍAS</Text>
              {filteredCustom.map((category, index) => (
                <React.Fragment key={category.id}>
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      selectedCategoryId === category.id && styles.categoryItemActive,
                    ]}
                    onPress={() => handleSelect(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    {selectedCategoryId === category.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  {index < filteredCustom.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Mensaje vacío */}
          {filteredPredefined.length === 0 && filteredCustom.length === 0 && (
            <Text style={styles.emptyText}>
              No se encontraron categorías
            </Text>
          )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
