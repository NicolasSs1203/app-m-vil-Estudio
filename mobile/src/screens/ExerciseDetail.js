import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import exercise_service from '../services/exercise.service';
import user_service from '../services/user.service';
import { ScoreAnim } from '../components/ScoreAnim'; // F-11: Micro-animación de score
import { ZCard } from '../components/ZCard'; // F-10: Componente reutilizable
import { ZButton } from '../components/ZButton'; // F-10: Componente reutilizable

const ExerciseDetail = ({ route, navigation }) => {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await user_service.getProfile();
        setUserId(profile.user?._id);
        await fetchExercise();
      } catch (error) {
        console.error("Error inicializando pantalla:", error);
      }
    };
    init();
  }, [exerciseId]);

  const fetchExercise = async () => {
    // Verificar si el ID parece un ObjectId de MongoDB (24 caracteres hex)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(exerciseId);

    if (!isMongoId) {
      // Es un reto personalizado generado por la IA en texto
      setExercise({
        title: "Reto Personalizado IA",
        description: exerciseId, // El texto de la sugerencia
        difficulty: "Especial",
        topic: "Refuerzo",
        category: "Chat IA"
      });
      setLoading(false);
      return;
    }

    try {
      const result = await exercise_service.getExerciseById(exerciseId);
      // El backend devuelve { success: true, data: { ... } }
      setExercise(result.data || result);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el detalle del reto.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return Alert.alert("Campo vacío", "Por favor escribe tu solución antes de enviar.");
    }
    
    setSubmitting(true);
    try {
      const result = await exercise_service.submitExercise(exerciseId, answer, userId);
      console.log('DEBUG AI RESULT:', result);
      // El backend devuelve { success: true, analysis: { score, overallFeedback, ... } }
      setFeedback(result.analysis || result); 
    } catch (error) {
      Alert.alert("Error de IA", "El tutor no pudo procesar tu código.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#50A0FF" />
        <Text style={styles.loaderText}>Cargando reto...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.difficultyTag}>{exercise?.difficulty?.toUpperCase()}</Text>
        <Text style={styles.title}>{exercise?.title || exercise?.topic || 'Reto de Programación'}</Text>
        <Text style={styles.topicText}>Tópico: {exercise?.topic || 'General'} • Categoría: {exercise?.category || 'Software'}</Text>
      </View>

      {/* Problema */}
      <ZCard style={styles.problemCard}>
        <Text style={styles.cardTitle}>PROBLEMA</Text>
        <Text style={styles.descriptionText}>{exercise?.question || exercise?.description}</Text>
      </ZCard>

      {/* Área de Respuesta */}
      <Text style={styles.label}>Tu solución:</Text>
      <TextInput
        style={styles.codeInput}
        multiline
        placeholder="// Escribe tu código aquí..."
        placeholderTextColor="#405570"
        value={answer}
        onChangeText={setAnswer}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {!feedback ? (
        <ZButton 
          title={submitting ? "" : "Enviar a revisión ✨"}
          onPress={handleSubmit}
          style={styles.mainButton}
        >
          {submitting && <ActivityIndicator color="#FFF" />}
        </ZButton>
      ) : (
        /* Análisis de la IA con Animación (F-05 & F-11) */
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackHeader}>Análisis del Tutor IA</Text>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Puntaje obtenido:</Text>
            {/* F-11: Aquí aplicamos la animación de conteo */}
            <ScoreAnim targetScore={feedback.score} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.feedbackSubtitle}>Feedback del experto:</Text>
          <Text style={styles.feedbackText}>{feedback.overallFeedback || feedback.feedback}</Text>

          {/* Conceptos Logrados */}
          {feedback.correctConcepts?.length > 0 && (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>✅ Puntos clave logrados:</Text>
              <Text style={styles.successText}>{feedback.correctConcepts.join(', ')}</Text>
            </View>
          )}

          {/* Áreas a mejorar */}
          {feedback.weakAreas?.length > 0 && (
            <View style={styles.areasContainer}>
              <Text style={styles.areasTitle}>📈 Recomendación de mejora:</Text>
              <Text style={styles.areasText}>
                {Array.isArray(feedback.weakAreas) 
                  ? feedback.weakAreas.map(wa => typeof wa === 'object' ? wa.topic : wa).join(', ') 
                  : feedback.weakAreas}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setFeedback(null);
              setAnswer('');
            }}
          >
            <Text style={styles.retryButtonText}>Intentar otro enfoque</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15', padding: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050A15' },
  loaderText: { color: '#8AABC8', marginTop: 10 },
  header: { marginBottom: 20 },
  difficultyTag: { color: '#50A0FF', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  topicText: { color: '#405570', fontSize: 13, marginTop: 4 },
  problemCard: { marginBottom: 20 },
  cardTitle: { color: '#50A0FF', fontWeight: 'bold', marginBottom: 8, fontSize: 12, letterSpacing: 2 },
  descriptionText: { color: '#E0E0E0', fontSize: 16, lineHeight: 24 },
  label: { color: '#8AABC8', marginBottom: 10, fontSize: 14, fontWeight: '600' },
  codeInput: { 
    backgroundColor: '#000', 
    color: '#00FF41', 
    fontFamily: 'monospace', 
    padding: 15, 
    borderRadius: 10, 
    minHeight: 180, 
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#152030',
    fontSize: 14
  },
  mainButton: { marginTop: 20 },
  feedbackCard: { 
    backgroundColor: '#0F192D', 
    padding: 20, 
    borderRadius: 16, 
    marginTop: 25, 
    borderWidth: 1, 
    borderColor: '#50A0FF' 
  },
  feedbackHeader: { color: '#50A0FF', fontWeight: 'bold', fontSize: 18, marginBottom: 15 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { color: '#FFF', fontSize: 16 },
  divider: { height: 1, backgroundColor: 'rgba(80, 160, 255, 0.2)', marginVertical: 15 },
  feedbackSubtitle: { color: '#8AABC8', fontWeight: 'bold', marginBottom: 8 },
  feedbackText: { color: '#FFF', lineHeight: 22, fontSize: 15 },
  successContainer: { marginTop: 15, padding: 10, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 8 },
  successTitle: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  successText: { color: '#C8E6C9', fontSize: 13 },
  areasContainer: { marginTop: 12, padding: 10, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 8 },
  areasTitle: { color: '#FF5252', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  areasText: { color: '#FFCDD2', fontSize: 13 },
  retryButton: { marginTop: 20, padding: 12, alignItems: 'center' },
  retryButtonText: { color: '#8AABC8', fontWeight: 'bold' }
});

export default ExerciseDetail;