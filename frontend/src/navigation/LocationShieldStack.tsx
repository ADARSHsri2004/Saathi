import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { LocationShieldIntro } from '../screens/settings/locationShield/LocationShieldIntro';
import { PermissionExplainer } from '../screens/settings/locationShield/PermissionExplainer';
import { RiskZoneMap } from '../screens/settings/locationShield/RiskZoneMap';
import { AlertStyleSelector, type AlertStyle } from '../screens/settings/locationShield/AlertStyleSelector';
import { NotificationPreview } from '../screens/settings/locationShield/NotificationPreview';

export type LocationShieldStackParamList = {
  Intro: undefined;
  Permission: undefined;
  RiskZones: undefined;
  AlertStyle: undefined;
  NotificationPreview: { alertStyle: AlertStyle };
};

const Stack = createNativeStackNavigator<LocationShieldStackParamList>();

export function LocationShieldStack() {
  const [riskZones, setRiskZones] = useState<any[]>([]);
  const [alertStyle, setAlertStyle] = useState<AlertStyle>('gentle');

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
            onDenied={() => {
              // Handle denial gracefully
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RiskZones">
        {({ navigation }) => (
          <RiskZoneMap
            onContinue={(zones) => {
              setRiskZones(zones);
              navigation.navigate('AlertStyle');
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AlertStyle">
        {({ navigation }) => (
          <AlertStyleSelector
            onSelect={(style) => {
              setAlertStyle(style);
              navigation.navigate('NotificationPreview', { alertStyle: style });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NotificationPreview">
        {({ navigation, route }) => (
          <NotificationPreview
            alertStyle={route.params.alertStyle}
            onContinue={() => navigation.getParent()?.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
