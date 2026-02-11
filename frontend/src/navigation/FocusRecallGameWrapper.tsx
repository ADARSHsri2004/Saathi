import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FocusRecallGameScreen } from '../games/focusRecall';
import { useFocusRecall } from '../context/FocusRecallContext';

export function FocusRecallGameWrapper() {
  const navigation = useNavigation();
  const { onGameComplete } = useFocusRecall();

  return (
    <FocusRecallGameScreen
      onGameComplete={onGameComplete}
      onReturnToGames={() => navigation.goBack()}
    />
  );
}
