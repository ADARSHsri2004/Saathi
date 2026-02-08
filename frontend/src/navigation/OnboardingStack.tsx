import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  IntroScreen,
  BasicDetailsScreen,
  AwarenessContextScreen,
  PatternsImpactScreen,
  IntentionDurationScreen,
  CompleteScreen,
} from '../screens/index';
import { colors } from '../theme/index';

export type OnboardingStackParamList = {
  Intro: undefined;
  BasicDetails: undefined;
  AwarenessContext: undefined;
  PatternsImpact: undefined;
  IntentionDuration: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="BasicDetails" component={BasicDetailsScreen} />
      <Stack.Screen name="AwarenessContext" component={AwarenessContextScreen} />
      <Stack.Screen name="PatternsImpact" component={PatternsImpactScreen} />
      <Stack.Screen name="IntentionDuration" component={IntentionDurationScreen} />
      <Stack.Screen
        name="Complete"
        component={CompleteScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
