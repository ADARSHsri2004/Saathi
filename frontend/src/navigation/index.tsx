import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingStack } from './OnboardingStack';
import { MainStack } from './MainStack';
import { useOnboarding } from '../context/OnboardingContext';
import { colors } from '../theme';
import { View, StyleSheet } from 'react-native';

type NavRef = React.RefObject<any>;

export function RootNavigator({ navRef }: { navRef?: NavRef }) {
  const { isOnboardingComplete, isHydrating } = useOnboarding();

  if (isHydrating) {
    return <View style={styles.splash} />;
  }

  return (
    <NavigationContainer ref={navRef}>
      {isOnboardingComplete ? <MainStack /> : <OnboardingStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
