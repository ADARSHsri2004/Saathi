import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeDashboardScreen } from '@/screens/HomeDashboardScreen';
import { colors } from '../theme';

export type MainStackParamList = {
  HomeDashboard: undefined;
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
    </Stack.Navigator>
  );
}
