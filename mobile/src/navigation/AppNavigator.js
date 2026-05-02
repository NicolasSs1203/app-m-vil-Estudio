import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

// Pantalla temporal para visualizar el menú
const Placeholder = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Pantalla de {name}</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" children={() => <Placeholder name="Home" />} />
      <Tab.Screen name="Ejercicios" children={() => <Placeholder name="Ejercicios" />} />
      <Tab.Screen name="Progreso" children={() => <Placeholder name="Progreso" />} />
      <Tab.Screen name="Chat IA" children={() => <Placeholder name="Chat IA" />} />
      <Tab.Screen name="Perfil" children={() => <Placeholder name="Perfil" />} />
    </Tab.Navigator>
  );
}