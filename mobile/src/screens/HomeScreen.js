import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ImageBackground 
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ 
    name: 'Juan Sebastian', 
    streak: 5, 
    progress: 0.65 
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../../assets/fondoCity.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Cabecera Estilo Glassmorphism */}
          <View style={styles.contentCard}>
            <Text style={styles.emoji}>💻</Text>
            <Text style={styles.title}>¡Hola, {userData.name}!</Text>
            <Text style={styles.subtitle}>¿Qué lenguaje dominaremos hoy?</Text>
          </View>

          {/* Fila de Estadísticas */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.cardEmoji}>🔥</Text>
              <Text style={styles.cardValue}>{userData.streak} días</Text>
              <Text style={styles.cardLabel}>Racha actual</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.cardEmoji}>📊</Text>
              <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${userData.progress * 100}%` }]} />
              </View>
              <Text style={styles.cardLabel}>65% completado</Text>
            </View>
          </View>

          {/* Tarjeta de IA */}
          <View style={styles.aiCard}>
            <Text style={styles.aiTag}>IA TUTOR ✨</Text>
            <Text style={styles.aiText}>"He notado que te vendría bien repasar los arreglos en JavaScript antes de tu siguiente desafío."</Text>
          </View>

          {/* Botón Principal de Navegación */}
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => navigation.navigate('Exercises')}
          >
            <Text style={styles.mainButtonText}>Comenzar a practicar</Text>
          </TouchableOpacity>

        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050A15' },
  backgroundImage: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 21, 0.45)', // Oscurece el fondo para legibilidad
  },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  contentCard: {
    backgroundColor: 'rgba(15, 25, 45, 0.75)',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80, 160, 255, 0.3)',
    marginBottom: 25,
    marginTop: 10
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  title: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#fff', 
    textAlign: 'center',
    marginBottom: 5
  },
  subtitle: { fontSize: 14, color: '#8AABC8', textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    width: '48%', 
    padding: 15, 
    borderRadius: 18, 
    alignItems: 'center' 
  },
  cardEmoji: { fontSize: 20, marginBottom: 5 },
  cardValue: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  cardLabel: { fontSize: 11, color: '#666' },
  progressContainer: { height: 6, width: '100%', backgroundColor: '#E0E0E0', borderRadius: 3, marginVertical: 8 },
  progressBar: { height: 6, backgroundColor: '#4CAF50', borderRadius: 3 },
  aiCard: { 
    backgroundColor: 'rgba(0, 122, 255, 0.15)', 
    padding: 20, 
    borderRadius: 20, 
    borderLeftWidth: 4, 
    borderLeftColor: '#007AFF',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)'
  },
  aiTag: { fontSize: 10, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  aiText: { fontSize: 14, color: '#E0E0E0', fontStyle: 'italic', lineHeight: 20 },
  mainButton: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default HomeScreen;