import React from 'react';
import { TransactionProvider } from './src/context/TransactionContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App(): React.JSX.Element {
  return (
    <TransactionProvider>
      <HomeScreen navigation={{ navigate: () => {} }} />
    </TransactionProvider>
  );
}
