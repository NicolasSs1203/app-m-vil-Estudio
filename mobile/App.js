import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

// Importamos el proveedor del tema (F-10)
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}