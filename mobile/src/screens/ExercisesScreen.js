import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import exercise_service from '../services/exercise.service';

const ExercisesScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await exercise_service.getExercises();
      
      // Accedemos a response.data.data porque el array viene dentro de la propiedad 'data'
      if (response && response.data) {
        setExercises(response.data);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error("Error cargando retos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por categoría o dificultad
  const filteredExercises = filter === 'All' 
    ? exercises 
    : exercises.filter(ex => 
        ex.category?.toLowerCase() === filter.toLowerCase() || 
        ex.difficulty?.toLowerCase() === filter.toLowerCase()
      );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      // Usamos item.id que es el campo que viene de la DB de Kevin
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id || item._id })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.exerciseTitle}>{item.title}</Text>
        <Text style={styles.exerciseSubtitle}>{item.topic} • {item.difficulty}</Text>
      </View>
      <View style={[styles.difficultyBadge, styles[item.difficulty?.toLowerCase() || 'easy']]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Retos de Programación</Text>

      <View style={styles.filterContainer}>
        {['All', 'JavaScript', 'Python', 'Easy', 'Hard'].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron retos disponibles.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15', paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 15, marginTop: 20 },
  filterContainer: { flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap' },
  filterChip: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10, 
    marginBottom: 10 
  },
  filterChipActive: { backgroundColor: '#50A0FF' },
  filterText: { color: '#8AABC8', fontSize: 13 },
  filterTextActive: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  exerciseCard: {
    backgroundColor: 'rgba(15, 25, 45, 0.75)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(80, 160, 255, 0.15)'
  },
  exerciseTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  exerciseSubtitle: { color: '#8AABC8', fontSize: 12, marginTop: 4 },
  difficultyBadge: { width: 8, height: 8, borderRadius: 4 },
  easy: { backgroundColor: '#4CAF50' },
  medium: { backgroundColor: '#FFC107' },
  hard: { backgroundColor: '#F44336' },
  emptyText: { color: '#8AABC8', textAlign: 'center', marginTop: 50 }
});

export default ExercisesScreen;