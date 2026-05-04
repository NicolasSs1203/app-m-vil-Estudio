import React, { useState, useEffect } from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Pantalla de Carga
import LoadingScreen from '../screens/LoadingScreen';

// Pantallas de Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Pantallas de Main
import HomeScreen from '../screens/HomeScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import SkillTreeScreen from '../screens/SkillTreeScreen';
import ChatAIScreen from '../screens/ChatAIScreen';
import ProfileScreen from '../screens/ProfileScreen';

// NUEVA PANTALLA F-05
import ExerciseDetail from '../screens/ExerciseDetail';

// NUEVA PANTALLA F-06 — Pantalla de Progreso
import ProgressScreen from '../screens/ProgressScreen';

// NUEVA PANTALLA F-08 — Pantalla de Recomendaciones
import RecommendationScreen from '../screens/RecommendationScreen';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initApp = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    return () => clearTimeout(initApp);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        // F-11: Transición suave de desvanecimiento entre pantallas
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid 
      }}
    >
      {isLoggedIn ? (
        <>
          {/* Contenedor principal de pestañas */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          
          {/* Pantallas que se abren sobre las pestañas (Modales o detalles) */}
          <Stack.Screen 
            name="ExerciseDetail" 
            component={ExerciseDetail} 
            options={{ 
              headerShown: true, 
              title: 'Resolver Reto',
              headerStyle: { backgroundColor: '#050A15', borderBottomColor: '#152030' },
              headerTintColor: '#fff'
            }} 
          />

          {/* F-06: Pantalla de Progreso Analizado por IA */}
          <Stack.Screen 
            name="Progress" 
            component={ProgressScreen} 
            options={{ 
              headerShown: true, 
              title: 'Mi Rendimiento AI',
              headerStyle: { backgroundColor: '#050A15', borderBottomColor: '#152030' },
              headerTintColor: '#fff'
            }} 
          />

          {/* F-08: Pantalla de Recomendaciones Personalizadas */}
          <Stack.Screen 
            name="Recommendations" 
            component={RecommendationScreen} 
            options={{ 
              headerShown: true, 
              title: 'Mi Plan de Estudio',
              headerStyle: { backgroundColor: '#050A15', borderBottomColor: '#152030' },
              headerTintColor: '#fff'
            }} 
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}