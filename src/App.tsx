import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
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
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Ventures"
          component={VenturesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="briefcase" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="target" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="settings" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Simple icon component
const Icon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  const icons: Record<string, string> = {
    home: '🏠',
    briefcase: '💼',
    target: '🎯',
    settings: '⚙️',
  };
  return <Text style={{ fontSize: size }}>{icons[name] || '•'}</Text>;
};
