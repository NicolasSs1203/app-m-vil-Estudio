import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

export default function HomeScreen() {
  return (
    <ImageBackground 
      source={require('../../assets/fondoCity.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <View style={styles.contentCard}>
        <Text style={styles.emoji}>💻</Text>
        <Text style={styles.title}>¡Hola, Juan Sebastian!</Text>
        <Text style={styles.subtitle}>¿Qué lenguaje dominaremos hoy?</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#050A15' 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 21, 0.35)', // Capa oscura para no opacar el fondo
  },
  contentCard: {
    backgroundColor: 'rgba(15, 25, 45, 0.75)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80, 160, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    marginHorizontal: 24,
    width: '85%',
  },
  emoji: { 
    fontSize: 56, 
    marginBottom: 16 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#8AABC8',
    textAlign: 'center',
    lineHeight: 24,
  },
});