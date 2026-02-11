import React, { createContext, useContext } from 'react';
import type { OnGameComplete } from '../games/focusRecall';

type FocusRecallContextValue = {
  onGameComplete?: OnGameComplete;
};

const FocusRecallContext = createContext<FocusRecallContextValue>({});

export function FocusRecallProvider({
  children,
  onGameComplete,
}: {
  children: React.ReactNode;
  onGameComplete?: OnGameComplete;
}) {
  return (
    <FocusRecallContext.Provider value={{ onGameComplete }}>
      {children}
    </FocusRecallContext.Provider>
  );
}

export function useFocusRecall() {
  return useContext(FocusRecallContext);
}
