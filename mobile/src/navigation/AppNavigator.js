import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Pantallas de Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Pantallas de Main (Asegúrate de que estos archivos existan en /screens)
import HomeScreen from '../screens/HomeScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import SkillTreeScreen from '../screens/SkillTreeScreen';
import ChatAIScreen from '../screens/ChatAIScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Ejercicios') iconName = focused ? 'code-slash' : 'code-slash-outline';
          else if (route.name === 'Árbol') iconName = focused ? 'git-network' : 'git-network-outline';
          else if (route.name === 'Chat IA') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#50A0FF',
        tabBarInactiveTintColor: '#405570',
        headerStyle: { backgroundColor: '#050A15', borderBottomWidth: 1, borderBottomColor: '#152030' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#050A15', borderTopColor: '#152030' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Árbol" component={SkillTreeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Ejercicios" component={ExercisesScreen} />
      <Tab.Screen name="Chat IA" component={ChatAIScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // Si entra aquí, muestra las pestañas
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        // Si no, muestra el flujo de Login
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}