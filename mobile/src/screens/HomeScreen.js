import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import authService from '../services/auth.service';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ name: 'Juan Sebastian', streak: 5, progress: 0.65 });

  // [CHECKLIST] Saludo personalizado con nombre del usuario
  // Aquí cargaríamos los datos reales del servicio authService.getMe()
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Cabecera con Saludo */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>¡Hola, {userData.name}! 👋</Text>
          <Text style={styles.dateText}>Sábado, 2 de mayo</Text>
        </View>

        {/* [CHECKLIST] Racha actual de estudio */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🔥</Text>
            <Text style={styles.cardValue}>{userData.streak} días</Text>
            <Text style={styles.cardLabel}>Racha actual</Text>
          </View>

          {/* [CHECKLIST] Resumen de progreso (Barra de progreso) */}
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📊</Text>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '65%' }]} />
            </View>
            <Text style={styles.cardLabel}>65% completado</Text>
          </View>
        </View>

        {/* [CHECKLIST] Recomendaciones rápidas de la IA */}
        <Text style={styles.sectionTitle}>Recomendado para ti</Text>
        <View style={styles.aiCard}>
          <Text style={styles.aiTag}>IA TUTOR ✨</Text>
          <Text style={styles.aiText}>"He notado que te vendría bien repasar los arreglos en JavaScript antes de tu siguiente desafío."</Text>
          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>Repasar ahora</Text>
          </TouchableOpacity>
        </View>

        {/* [CHECKLIST] Botón "Comenzar a practicar" */}
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => navigation.navigate('Exercises')} // Navega a Ejercicios
        >
          <Text style={styles.mainButtonText}>Comenzar a practicar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20 },
  header: { marginBottom: 25, marginTop: 10 },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  dateText: { fontSize: 14, color: '#888', marginTop: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { 
    backgroundColor: '#F8F9FA', 
    width: '48%', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  cardEmoji: { fontSize: 24, marginBottom: 5 },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardLabel: { fontSize: 12, color: '#666' },
  progressContainer: { height: 8, width: '100%', backgroundColor: '#E0E0E0', borderRadius: 4, marginVertical: 8 },
  progressBar: { height: 8, backgroundColor: '#4CAF50', borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  aiCard: { 
    backgroundColor: '#F0F7FF', 
    padding: 20, 
    borderRadius: 20, 
    borderLeftWidth: 5, 
    borderLeftColor: '#007AFF',
    marginBottom: 30
  },
  aiTag: { fontSize: 10, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  aiText: { fontSize: 15, color: '#444', fontStyle: 'italic', lineHeight: 22 },
  aiButton: { marginTop: 15, alignSelf: 'flex-start' },
  aiButtonText: { color: '#007AFF', fontWeight: 'bold' },
  mainButton: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default HomeScreen;