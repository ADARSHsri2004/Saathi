import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeDashboardScreen } from '@/screens/HomeDashboardScreen';
import { GamesScreen } from '@/screens/GamesScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { FocusRecallGameWrapper } from './FocusRecallGameWrapper';
import { colors } from '../theme';

export type MainStackParamList = {
  HomeDashboard: undefined;
  Games: undefined;
  Rewards: undefined;
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
      <Stack.Screen name="FocusRecallGame" component={FocusRecallGameWrapper} />
    </Stack.Navigator>
  );
}
