import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TrackScreenEnhanced from '../screens/TrackScreenEnhanced';
import HistoryScreen from '../screens/HistoryScreen';
import RunDetailsScreen from '../screens/RunDetailsScreen';
import RunSummaryScreen from '../screens/RunSummaryScreen';
import SavedConfirmationScreen from '../screens/SavedConfirmationScreen';
import PhotosScreen from '../screens/PhotosScreen';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  RunSummary: undefined;
  RunDetails: { id: string } | undefined;
  SavedConfirmation: { distance?: number; durationSec?: number } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#17cf17',
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Track: 'map',
            History: 'time',
            Photos: 'images',
          };
          const name = map[route.name] ?? 'ellipse';
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Track" component={TrackScreenEnhanced} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="RunSummary" component={RunSummaryScreen} />
      <Stack.Screen name="RunDetails" component={RunDetailsScreen} />
      <Stack.Screen name="SavedConfirmation" component={SavedConfirmationScreen} />
    </Stack.Navigator>
  );
}
