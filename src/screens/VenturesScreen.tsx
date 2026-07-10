import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Venture {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'paused' | 'planning';
  revenue: number;
  expenses: number;
}

const CATEGORIES = ['E-commerce', 'SaaS', 'Freelance', 'Content', 'Investment', 'Other'];

export default function VenturesScreen() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('E-commerce');
  const [newRevenue, setNewRevenue] = useState('');
  const [newExpenses, setNewExpenses] = useState('');

  useEffect(() => {
    loadVentures();
  }, []);

  const loadVentures = async () => {
    try {
      const data = await AsyncStorage.getItem('ventures');
      if (data) setVentures(JSON.parse(data));
    } catch (e) {
      console.error('Failed to load ventures');
    }
  };

  const saveVentures = async (updated: Venture[]) => {
    try {
      await AsyncStorage.setItem('ventures', JSON.stringify(updated));
      setVentures(updated);
    } catch (e) {
      console.error('Failed to save ventures');
    }
  };

  const addVenture = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a venture name');
      return;
    }

    const venture: Venture = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      status: 'active',
      revenue: parseFloat(newRevenue) || 0,
      expenses: parseFloat(newExpenses) || 0,
    };

    saveVentures([venture, ...ventures]);
    setModalVisible(false);
    setNewName('');
    setNewRevenue('');
    setNewExpenses('');
  };

  const toggleStatus = (id: string) => {
    const updated = ventures.map(v => {
      if (v.id === id) {
        const nextStatus = v.status === 'active' ? 'paused' : v.status === 'paused' ? 'planning' : 'active';
        return { ...v, status: nextStatus };
      }
      return v;
    });
    saveVentures(updated);
  };

  const deleteVenture = (id: string) => {
    Alert.alert('Delete Venture', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          saveVentures(ventures.filter(v => v.id !== id));
        },
      },
    ]);
  };

  const totalRevenue = ventures.reduce((sum, v) => sum + v.revenue, 0);
  const totalProfit = ventures.reduce((sum, v) => sum + (v.revenue - v.expenses), 0);

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
          <Text style={[styles.summaryValue, { color: '#00C896' }]}>
            ฿{totalRevenue.toLocaleString()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Profit</Text>
          <Text style={[styles.summaryValue, { color: totalProfit >= 0 ? '#00C896' : '#EF4444' }]}>
            ฿{totalProfit.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Ventures List */}
      <ScrollView style={styles.list}>
        {ventures.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyText}>No ventures yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first venture</Text>
          </View>
        ) : (
          ventures.map(venture => (
            <TouchableOpacity
              key={venture.id}
              style={styles.ventureCard}
              onLongPress={() => deleteVenture(venture.id)}
            >
              <View style={styles.ventureHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ventureName}>{venture.name}</Text>
                  <Text style={styles.ventureCategory}>{venture.category}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleStatus(venture.id)}
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        venture.status === 'active'
                          ? '#00C89620'
                          : venture.status === 'paused'
                          ? '#EF444420'
                          : '#FFB80020',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          venture.status === 'active'
                            ? '#00C896'
                            : venture.status === 'paused'
                            ? '#EF4444'
                            : '#FFB800',
                      },
                    ]}
                  >
                    {venture.status}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ventureMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Revenue</Text>
                  <Text style={[styles.metricValue, { color: '#00C896' }]}>
                    ฿{venture.revenue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Expenses</Text>
                  <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                    ฿{venture.expenses.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Profit</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: venture.revenue - venture.expenses >= 0 ? '#00C896' : '#EF4444' },
                    ]}
                  >
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
        onPress={() => setModalVisible(true)}
      >
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    newCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      newCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
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
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addVenture}
              >
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
