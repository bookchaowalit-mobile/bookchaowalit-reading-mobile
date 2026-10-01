import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  CATEGORIES,
  newId,
  nextStatus,
  parseAmount,
  totals,
  validateVenture,
  type Venture,
} from '../lib/business';
import {useVentures} from '../store';

export default function VenturesScreen() {
  const {items: ventures, save: saveVentures, error} = useVentures();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('E-commerce');
  const [newRevenue, setNewRevenue] = useState('');
  const [newExpenses, setNewExpenses] = useState('');

  const addVenture = () => {
    const problem = validateVenture({
      name: newName,
      category: newCategory,
      revenue: newRevenue,
      expenses: newExpenses,
    });
    if (problem) {
      Alert.alert('Check the form', problem);
      return;
    }

    const venture: Venture = {
      id: newId(),
      name: newName.trim(),
      category: newCategory,
      status: 'active',
      revenue: parseAmount(newRevenue) ?? 0,
      expenses: parseAmount(newExpenses) ?? 0,
    };

    saveVentures([venture, ...ventures]);
    setModalVisible(false);
    setNewName('');
    setNewRevenue('');
    setNewExpenses('');
  };

  const toggleStatus = (id: string) => {
    const updated = ventures.map(v =>
      v.id === id ? {...v, status: nextStatus(v.status)} : v,
    );
    saveVentures(updated);
  };

  const deleteVenture = (id: string) => {
    Alert.alert('Delete Venture', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          saveVentures(ventures.filter(v => v.id !== id));
        },
      },
    ]);
  };

  const {revenue: totalRevenue, profit: totalProfit} = totals(ventures);

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Ventures</Text>
          <Text style={styles.summaryValue}>{ventures.length}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Revenue</Text>
          <Text style={[styles.summaryValue, styles.textGreen]}>
            ฿{totalRevenue.toLocaleString()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Profit</Text>
          <Text
            style={[
              styles.summaryValue,
              totalProfit >= 0 ? styles.textGreen : styles.textRed,
            ]}>
            ฿{totalProfit.toLocaleString()}
          </Text>
        </View>
      </View>

      {error && (
        <Text style={styles.errorBanner} accessibilityRole="alert">
          {error}
        </Text>
      )}

      {/* Ventures List */}
      <ScrollView style={styles.list}>
        {ventures.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyText}>No ventures yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add your first venture
            </Text>
          </View>
        ) : (
          ventures.map(venture => (
            <TouchableOpacity
              key={venture.id}
              style={styles.ventureCard}
              onLongPress={() => deleteVenture(venture.id)}>
              <View style={styles.ventureHeader}>
                <View style={styles.flex1}>
                  <Text style={styles.ventureName}>{venture.name}</Text>
                  <Text style={styles.ventureCategory}>{venture.category}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleStatus(venture.id)}
                  style={[
                    styles.statusBadge,
                    venture.status === 'active'
                      ? styles.badgeActive
                      : venture.status === 'paused'
                      ? styles.badgePaused
                      : styles.badgeOther,
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      venture.status === 'active'
                        ? styles.textGreen
                        : venture.status === 'paused'
                        ? styles.textRed
                        : styles.textAmber,
                    ]}>
                    {venture.status}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ventureMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Revenue</Text>
                  <Text style={[styles.metricValue, styles.textGreen]}>
                    ฿{venture.revenue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Expenses</Text>
                  <Text style={[styles.metricValue, styles.textRed]}>
                    ฿{venture.expenses.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Profit</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      venture.revenue - venture.expenses >= 0
                        ? styles.textGreen
                        : styles.textRed,
                    ]}>
                    ฿{(venture.revenue - venture.expenses).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Venture</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Venture</Text>

            <TextInput
              style={styles.input}
              placeholder="Venture name"
              placeholderTextColor="#6B7280"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    newCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setNewCategory(cat)}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      newCategory === cat && styles.categoryChipTextActive,
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Revenue (฿)"
              placeholderTextColor="#6B7280"
              value={newRevenue}
              onChangeText={setNewRevenue}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Expenses (฿)"
              placeholderTextColor="#6B7280"
              value={newExpenses}
              onChangeText={setNewExpenses}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addVenture}>
                <Text style={styles.saveButtonText}>Add Venture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {flex: 1},
  textGreen: {color: '#00C896'},
  textRed: {color: '#EF4444'},
  textAmber: {color: '#FFB800'},
  badgeActive: {backgroundColor: '#00C89620'},
  badgePaused: {backgroundColor: '#EF444420'},
  badgeOther: {backgroundColor: '#FFB80020'},
  errorBanner: {
    color: '#EF4444',
    backgroundColor: '#EF444420',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#1E1E2E',
    padding: 16,
    margin: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#0F0F1E',
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
  },
  ventureCard: {
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ventureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ventureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ventureCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ventureMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0F0F1E',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    fontSize: 15,
    marginTop: 8,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0F0F1E',
    borderRadius: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryChipText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#0F0F1E',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
