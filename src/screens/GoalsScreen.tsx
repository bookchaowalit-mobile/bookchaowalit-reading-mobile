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
  applyGoalDelta,
  daysLeft,
  goalProgress,
  isGoalComplete,
  newId,
  parseAmount,
  validateGoal,
  type Goal,
} from '../lib/business';
import {useGoals} from '../store';

function deadlineLabel(deadline: string): string {
  if (!deadline.trim()) {
    return 'No deadline';
  }
  const days = daysLeft(deadline);
  if (days === null) {
    return deadline;
  }
  if (days < 0) {
    return `${deadline} · ${-days}d overdue`;
  }
  return days === 0 ? `${deadline} · due today` : `${deadline} · ${days}d left`;
}

export default function GoalsScreen() {
  const {items: goals, save: saveGoals, error} = useGoals();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const addGoal = () => {
    const problem = validateGoal({
      title: newTitle,
      target: newTarget,
      deadline: newDeadline,
    });
    if (problem) {
      Alert.alert('Check the form', problem);
      return;
    }

    const goal: Goal = {
      id: newId(),
      title: newTitle.trim(),
      target: parseAmount(newTarget) ?? 0,
      current: 0,
      deadline: newDeadline.trim(),
    };

    saveGoals([goal, ...goals]);
    setModalVisible(false);
    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
  };

  const updateProgress = (id: string, amount: number) => {
    const updated = goals.map(g =>
      g.id === id ? applyGoalDelta(g, amount) : g,
    );
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          saveGoals(goals.filter(g => g.id !== id));
        },
      },
    ]);
  };

  const completedGoals = goals.filter(isGoalComplete).length;

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{goals.length}</Text>
          <Text style={styles.summaryLabel}>Total Goals</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, styles.textGreen]}>
            {completedGoals}
          </Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, styles.textOrange]}>
            {goals.length - completedGoals}
          </Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
      </View>

      {error && (
        <Text style={styles.errorBanner} accessibilityRole="alert">
          {error}
        </Text>
      )}

      {/* Goals List */}
      <ScrollView style={styles.list}>
        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>
              Set your first business goal
            </Text>
          </View>
        ) : (
          goals.map(goal => {
            const progress = goalProgress(goal);
            const isCompleted = isGoalComplete(goal);

            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                    <Text style={styles.deleteButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      ฿{goal.current.toLocaleString()} / ฿
                      {goal.target.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.progressPercent,
                        isCompleted ? styles.textGreen : styles.textOrange,
                      ]}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        isCompleted ? styles.fillDone : styles.fillOpen,
                        {width: `${Math.min(progress, 100)}%`},
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.goalFooter}>
                  <Text style={styles.deadline}>
                    📅 {deadlineLabel(goal.deadline)}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => updateProgress(goal.id, 1000)}>
                      <Text style={styles.actionButtonText}>+฿1K</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => updateProgress(goal.id, 5000)}>
                      <Text style={styles.actionButtonText}>+฿5K</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => updateProgress(goal.id, 10000)}>
                      <Text style={styles.actionButtonText}>+฿10K</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Goal Completed!</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Goal</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Goal</Text>

            <TextInput
              style={styles.input}
              placeholder="Goal title (e.g. Revenue target)"
              placeholderTextColor="#6B7280"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Target amount (฿)"
              placeholderTextColor="#6B7280"
              value={newTarget}
              onChangeText={setNewTarget}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Deadline YYYY-MM-DD (optional)"
              placeholderTextColor="#6B7280"
              value={newDeadline}
              onChangeText={setNewDeadline}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addGoal}>
                <Text style={styles.saveButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  textGreen: {color: '#00C896'},
  textOrange: {color: '#FF6B35'},
  fillDone: {backgroundColor: '#00C896'},
  fillOpen: {backgroundColor: '#FF6B35'},
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
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 24,
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
  goalCard: {
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  deleteButton: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#0F0F1E',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    backgroundColor: '#0F0F1E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  completedBadge: {
    marginTop: 12,
    backgroundColor: '#00C89620',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00C896',
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
  input: {
    backgroundColor: '#0F0F1E',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
