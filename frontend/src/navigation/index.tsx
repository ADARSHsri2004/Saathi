import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingStack } from './OnboardingStack';

type NavRef = React.RefObject<any>;

export function RootNavigator({ navRef }: { navRef?: NavRef }) {
  return (
    <NavigationContainer ref={navRef}>
      <OnboardingStack />
    </NavigationContainer>
  );
}
