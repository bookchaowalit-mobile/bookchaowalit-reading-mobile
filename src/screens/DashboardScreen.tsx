import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {
  goalPercentLabel,
  goalProgress,
  topVentures,
  totals,
} from '../lib/business';
import {useGoals, useVentures} from '../store';

export default function DashboardScreen() {
  const {items: ventures} = useVentures();
  const {items: goals} = useGoals();
  const {
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit,
    active: activeVentures,
    margin,
  } = totals(ventures);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back 👋</Text>
        <Text style={styles.subtitle}>Here's your business overview</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.surface]}>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={[styles.statValue, styles.textGreen]}>
            ฿{totalRevenue.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statCard, styles.surface]}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, styles.textRed]}>
            ฿{totalExpenses.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.statCard, styles.surface]}>
          <Text style={styles.statLabel}>Profit</Text>
          <Text
            style={[
              styles.statValue,
              profit >= 0 ? styles.textGreen : styles.textRed,
            ]}>
            ฿{profit.toLocaleString()}
          </Text>
          {margin !== null && (
            <Text style={styles.statLabel}>{margin}% margin</Text>
          )}
        </View>

        <View style={[styles.statCard, styles.surface]}>
          <Text style={styles.statLabel}>Active Ventures</Text>
          <Text style={[styles.statValue, styles.textOrange]}>
            {activeVentures}
          </Text>
        </View>
      </View>

      {/* Goals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Goals</Text>
        {goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first goal to track progress
            </Text>
          </View>
        ) : (
          goals.slice(0, 3).map(goal => {
            const progress = goalProgress(goal);
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalProgress}>
                    {goalPercentLabel(goal)}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${Math.min(progress, 100)}%`},
                    ]}
                  />
                </View>
                <Text style={styles.goalMeta}>
                  ฿{goal.current.toLocaleString()} / ฿
                  {goal.target.toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Recent Ventures */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Ventures</Text>
        {ventures.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No ventures yet</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your business ventures
            </Text>
          </View>
        ) : (
          topVentures(ventures).map(venture => (
            <View key={venture.id} style={styles.ventureCard}>
              <View style={styles.ventureHeader}>
                <View>
                  <Text style={styles.ventureName}>{venture.name}</Text>
                  <Text style={styles.ventureCategory}>{venture.category}</Text>
                </View>
                <View
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
                </View>
              </View>
              <View style={styles.ventureStats}>
                <Text style={styles.ventureRevenue}>
                  ฿{venture.revenue.toLocaleString()}
                </Text>
                <Text style={styles.ventureExpenses}>
                  -฿{venture.expenses.toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  surface: {backgroundColor: '#1E1E2E'},
  textAmber: {color: '#FFB800'},
  badgeActive: {backgroundColor: '#00C89620'},
  badgePaused: {backgroundColor: '#EF444420'},
  badgeOther: {backgroundColor: '#FFB80020'},
  textGreen: {color: '#00C896'},
  textRed: {color: '#EF4444'},
  textOrange: {color: '#FF6B35'},
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#1E1E2E',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0F0F1E',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  goalMeta: {
    fontSize: 12,
    color: '#6B7280',
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
    marginBottom: 12,
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
  ventureStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ventureRevenue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00C896',
  },
  ventureExpenses: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
