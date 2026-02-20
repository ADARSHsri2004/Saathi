import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { colors } from '../theme';
import { LocationShieldIntro } from '../screens/settings/locationShield/LocationShieldIntro';
import { PermissionExplainer } from '../screens/settings/locationShield/PermissionExplainer';
import { RiskZoneMap } from '../screens/settings/locationShield/RiskZoneMap';
import { LocationShieldAllSet } from '../screens/settings/locationShield/LocationShieldAllSet';

export type LocationShieldStackParamList = {
  Intro: undefined;
  Permission: undefined;
  RiskZones: undefined;
  AllSet: undefined;
};

const Stack = createNativeStackNavigator<LocationShieldStackParamList>();

export function LocationShieldStack() {
  const [riskZones, setRiskZones] = useState<any[]>([]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Intro">
        {({ navigation }) => (
          <LocationShieldIntro onNext={() => navigation.navigate('Permission')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Permission">
        {({ navigation }) => (
          <PermissionExplainer
            onAllow={() => navigation.navigate('RiskZones')}
            onDenied={() => {}}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RiskZones">
        {({ navigation }) => (
          <RiskZoneMap
            onContinue={(zones) => {
              setRiskZones(zones);
              navigation.navigate('AllSet');
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AllSet">
        {({ navigation }) => (
          <LocationShieldAllSet
            onContinue={() => {
              const parent = navigation.getParent();
              if (parent) {
                parent.dispatch(CommonActions.navigate({ name: 'Settings' }));
              } else {
                navigation.getParent()?.goBack();
              }
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
