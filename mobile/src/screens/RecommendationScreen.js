import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  Linking, RefreshControl, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ai_service from '../services/ai.service';

const RecommendationsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const response = await ai_service.getRecommendations("user_123");
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPriorityColor = (prio) => {
    switch(prio.toLowerCase()) {
      case 'alta': return '#F44336';
      case 'media': return '#FFC107';
      default: return '#4CAF50';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#50A0FF" />}
      >
        <Text style={styles.headerTitle}>Plan de Hoy</Text>

        {/* Ruta de Aprendizaje (Hito Actual -> Siguiente) */}
        <View style={styles.pathCard}>
          <View style={styles.pathRow}>
            <View style={styles.step}>
              <Text style={styles.stepLabel}>Actual</Text>
              <Text style={styles.stepTitle}>{data?.learningPath?.currentLevel || 'Cargando...'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#50A0FF" />
            <View style={styles.step}>
              <Text style={styles.stepLabel}>Siguiente Hito</Text>
              <Text style={styles.stepTitle}>{data?.learningPath?.nextMilestone || '...'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recomendaciones IA</Text>

        {data?.recommendations?.map((rec, index) => (
          <View key={index} style={styles.recCard}>
            <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(rec.priority) }]} />
            <View style={styles.recContent}>
              <View style={styles.recHeader}>
                <Text style={styles.recType}>{rec.type}</Text>
                <Text style={styles.recTime}><Ionicons name="time-outline" /> {rec.estimatedTime}</Text>
              </View>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recDesc}>{rec.description}</Text>
              
              {rec.links?.map((link, lIdx) => (
                <TouchableOpacity key={lIdx} style={styles.linkButton} onPress={() => Linking.openURL(link.url)}>
                  <Text style={styles.linkText}>{link.label}</Text>
                  <Ionicons name="open-outline" size={14} color="#50A0FF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Nota Motivacional */}
        <View style={styles.motivationContainer}>
          <Ionicons name="bulb" size={30} color="#FFD700" />
          <Text style={styles.motivationText}>"{data?.motivationalNote || 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.'}"</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15' },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#50A0FF', fontWeight: 'bold', marginVertical: 15 },
  pathCard: { backgroundColor: '#0F192D', padding: 20, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#152030' },
  pathRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { alignItems: 'center', flex: 1 },
  stepLabel: { color: '#8AABC8', fontSize: 10, textTransform: 'uppercase' },
  stepTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
  recCard: { backgroundColor: '#152030', borderRadius: 12, marginBottom: 15, flexDirection: 'row', overflow: 'hidden' },
  priorityBar: { width: 6 },
  recContent: { flex: 1, padding: 15 },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recType: { color: '#50A0FF', fontSize: 12, fontWeight: 'bold' },
  recTime: { color: '#8AABC8', fontSize: 12 },
  recTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginBottom: 5 },
  recDesc: { color: '#8AABC8', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  linkButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(80, 160, 255, 0.1)', padding: 8, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 5 },
  linkText: { color: '#50A0FF', marginRight: 8, fontSize: 13 },
  motivationContainer: { marginTop: 30, padding: 25, alignItems: 'center', backgroundColor: '#0F192D', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#405570' },
  motivationText: { color: '#FFF', fontStyle: 'italic', textAlign: 'center', marginTop: 10, lineHeight: 22 }
});

export default RecommendationsScreen;