import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ai_service from '../services/ai.service';

const ProgressScreen = ({ route }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // En un caso real, el userId vendría del contexto de Auth
  const userId = "user_123"; 

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await ai_service.getUserProgress(userId);
      setProgress(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50A0FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Mi Progreso</Text>

        {/* Resumen de Rachas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF9500" />
            <Text style={styles.statValue}>{progress?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Racha Actual</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{progress?.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Mejor Racha</Text>
          </View>
        </View>

        {/* Resumen General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análisis del Periodo</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{progress?.summary || "Sigue practicando para generar un análisis."}</Text>
          </View>
        </View>

        {/* Mejoras Logradas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros y Mejoras ✅</Text>
          {progress?.improvements?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Debilidades con Tendencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Áreas por Reforzar 📈</Text>
          {progress?.weaknesses?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Ionicons 
                name={item.trend === 'up' ? "trending-up" : "trending-down"} 
                size={20} 
                color={item.trend === 'up' ? "#F44336" : "#FFC107"} 
              />
              <Text style={styles.itemText}>{item.topic} ({item.status})</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15' },
  loadingContainer: { flex: 1, justifyContent: 'center', backgroundColor: '#050A15' },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { 
    backgroundColor: '#0F192D', 
    width: '48%', 
    padding: 15, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80, 160, 255, 0.1)'
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginVertical: 5 },
  statLabel: { fontSize: 12, color: '#8AABC8' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#50A0FF', marginBottom: 15 },
  summaryCard: { backgroundColor: 'rgba(80, 160, 255, 0.05)', padding: 15, borderRadius: 12 },
  summaryText: { color: '#8AABC8', lineHeight: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemText: { color: '#FFF', marginLeft: 10, fontSize: 15 }
});

export default ProgressScreen;