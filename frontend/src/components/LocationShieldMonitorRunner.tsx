import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  startLocationShieldMonitor,
  stopLocationShieldMonitor,
} from '../services/locationShieldMonitor';

export function LocationShieldMonitorRunner() {
  useEffect(() => {
    startLocationShieldMonitor();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        startLocationShieldMonitor();
      }
    });
    return () => {
      sub.remove();
      stopLocationShieldMonitor();
    };
  }, []);
  return null;
}
