import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {clearAll} from '../store';

export default function SettingsScreen() {
  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all ventures and goals. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>App Name</Text>
            <Text style={styles.value}>SoloEmpire</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Framework</Text>
            <Text style={styles.value}>React Native CLI</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.card}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.flex1}>
              <Text style={styles.featureTitle}>Business Dashboard</Text>
              <Text style={styles.featureDesc}>
                Track revenue, expenses, and profit across all ventures
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>💼</Text>
            <View style={styles.flex1}>
              <Text style={styles.featureTitle}>Venture Management</Text>
              <Text style={styles.featureDesc}>
                Organize and monitor all your business ventures
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.flex1}>
              <Text style={styles.featureTitle}>Goal Tracking</Text>
              <Text style={styles.featureDesc}>
                Set targets and track progress with visual indicators
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <Text style={styles.dataInfo}>
            All data is stored locally on your device using AsyncStorage. No
            data is sent to external servers.
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearData}>
            <Text style={styles.clearButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Credits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credits</Text>
        <View style={styles.card}>
          <Text style={styles.creditText}>
            Built with React Native CLI{'\n'}
            Part of the SoloEmpire mobile app collection
          </Text>
          <Text style={styles.copyright}>© 2025 Chaowalit Greepoke</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: {flex: 1},
  bottomSpacer: {height: 40},
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#0F0F1E',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  dataInfo: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: '#EF444420',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  creditText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  copyright: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
});
