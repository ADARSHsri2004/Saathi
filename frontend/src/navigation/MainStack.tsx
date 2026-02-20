import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeDashboardScreen } from '@/screens/HomeDashboardScreen';
import { CompanionDashboardScreen } from '@/screens/CompanionDashboardScreen';
import { GamesScreen } from '@/screens/GamesScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AssistantScreen } from '@/screens/AssistantScreen';
import { CompanionScreen } from '@/screens/CompanionScreen';
import { AddCompanionScreen } from '@/screens/AddCompanionScreen';
import { FocusRecallGameWrapper } from './FocusRecallGameWrapper';
import { LocationShieldStack } from './LocationShieldStack';
import { PlannerStack } from './PlannerStack';
import { colors } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';

export type MainStackParamList = {
  HomeDashboard: undefined;
  CompanionDashboard: undefined;
  Games: undefined;
  Rewards: undefined;
  Settings: undefined;
  Assistant: undefined;
  Companion: undefined;
  AddCompanion: undefined;
  LocationShieldStack: undefined;
  FocusRecallGame: undefined;
  PlannerStack: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  const { state } = useOnboarding();
  const isCompanion = state.role === 'companion';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName={isCompanion ? 'CompanionDashboard' : 'HomeDashboard'}
    >
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen name="CompanionDashboard" component={CompanionDashboardScreen} />
      <Stack.Screen name="Games" component={GamesScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Assistant" component={AssistantScreen} />
      <Stack.Screen name="Companion" component={CompanionScreen} />
      <Stack.Screen name="AddCompanion" component={AddCompanionScreen} />
      <Stack.Screen name="LocationShieldStack" component={LocationShieldStack} />
      <Stack.Screen name="FocusRecallGame" component={FocusRecallGameWrapper} />
      <Stack.Screen name="PlannerStack" component={PlannerStack} />
    </Stack.Navigator>
  );
}
