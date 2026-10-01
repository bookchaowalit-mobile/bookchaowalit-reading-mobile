import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import DashboardScreen from './screens/DashboardScreen';
import VenturesScreen from './screens/VenturesScreen';
import GoalsScreen from './screens/GoalsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1E" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#0F0F1E',
            borderTopColor: '#1E1E2E',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#6B7280',
          headerStyle: {
            backgroundColor: '#0F0F1E',
            borderBottomColor: '#1E1E2E',
            borderBottomWidth: 1,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: tabIcon('home'),
          }}
        />
        <Tab.Screen
          name="Ventures"
          component={VenturesScreen}
          options={{
            tabBarIcon: tabIcon('briefcase'),
          }}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            tabBarIcon: tabIcon('target'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: tabIcon('settings'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Emoji tab icons: the active tab is fully opaque, inactive ones are dimmed.
const ICONS: Record<string, string> = {
  home: '🏠',
  briefcase: '💼',
  target: '🎯',
  settings: '⚙️',
};

const styles = StyleSheet.create({
  active: {opacity: 1},
  inactive: {opacity: 0.5},
});

function tabIcon(name: string) {
  return ({focused, size}: {focused: boolean; size: number}) => (
    <Text style={[{fontSize: size}, focused ? styles.active : styles.inactive]}>
      {ICONS[name] || '•'}
    </Text>
  );
}
