import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { PlannerAssessmentProvider } from '../context/PlannerAssessmentContext';
import { PlannerEntryScreen } from '../screens/planner/PlannerEntryScreen';
import { AssessmentScreen } from '../screens/planner/AssessmentScreen';
import { LifestyleTriggersScreen } from '../screens/planner/LifestyleTriggersScreen';
import { AIProcessingScreen } from '../screens/planner/AIProcessingScreen';
import { PlannerRevealScreen } from '../screens/planner/PlannerRevealScreen';

export type PlannerStackParamList = {
  PlannerEntry: undefined;
  Assessment: undefined;
  LifestyleTriggers: undefined;
  AIProcessing: undefined;
  PlannerReveal: undefined;
};

const Stack = createNativeStackNavigator<PlannerStackParamList>();

export function PlannerStack() {
  return (
    <PlannerAssessmentProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="PlannerEntry" component={PlannerEntryScreen} />
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="LifestyleTriggers" component={LifestyleTriggersScreen} />
        <Stack.Screen name="AIProcessing" component={AIProcessingScreen} />
        <Stack.Screen
          name="PlannerReveal"
          component={PlannerRevealScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </PlannerAssessmentProvider>
  );
}
