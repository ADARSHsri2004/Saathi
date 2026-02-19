import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeDashboardScreen } from '@/screens/HomeDashboardScreen';
import { GamesScreen } from '@/screens/GamesScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AssistantScreen } from '@/screens/AssistantScreen';
import { FocusRecallGameWrapper } from './FocusRecallGameWrapper';
import { LocationShieldStack } from './LocationShieldStack';
import { colors } from '../theme';

export type MainStackParamList = {
  HomeDashboard: undefined;
  Games: undefined;
  Rewards: undefined;
  Settings: undefined;
  Assistant: undefined;
  LocationShieldStack: undefined;
  FocusRecallGame: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen name="Games" component={GamesScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Assistant" component={AssistantScreen} />
      <Stack.Screen name="LocationShieldStack" component={LocationShieldStack} />
      <Stack.Screen name="FocusRecallGame" component={FocusRecallGameWrapper} />
    </Stack.Navigator>
  );
}
