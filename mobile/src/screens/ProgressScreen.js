import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Dimensions,
  Animated // F-11: Necesario para las animaciones nativas
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";
import { useTheme } from '../context/ThemeContext'; // F-10: Uso del tema central
import { ZCard } from '../components/ZCard'; // F-10: Componente reutilizable

const ProgressScreen = () => {
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // F-11: Valor para la animación de pulso de la racha
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => setLoading(false), 1200);

    // F-11: Configuración de la animación de pulso infinito para la flama
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(timer);
  }, []);

  const progressData = {
    currentStreak: 5,
    longestStreak: 12,
    summary: "Tu enfoque en lógica de programación ha mejorado un 15% esta semana. Te recomendamos reforzar el manejo de estados en React Native.",
    improvements: ["Optimización de bucles", "Estructuras de datos en JS", "Conexión I2C en Arduino"],
    weaknesses: [
      { topic: "Manejo de SQL", trend: "up", status: "Mejorando" },
      { topic: "CSS Flexbox", trend: "down", status: "Requiere práctica" }
    ],
    chartData: [2, 5, 3, 8, 5, 9, 10]
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.m }}>
        
        {/* Sección de Rachas con Animación (F-06 y F-11) */}
        <View style={styles.statsRow}>
          <ZCard style={styles.statCard}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="flame" size={32} color="#FF9500" />
            </Animated.View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {progressData.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Racha Actual
            </Text>
          </ZCard>

          <ZCard style={styles.statCard}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {progressData.longestStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Mejor Racha
            </Text>
          </ZCard>
        </View>

        {/* Resumen General IA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Análisis de Desempeño
          </Text>
          <View style={[styles.summaryCard, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {progressData.summary}
            </Text>
          </View>
        </View>

        {/* Gráfico de Consistencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Consistencia de Estudio
          </Text>
          <LineChart
            data={{
              labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
              datasets: [{ data: progressData.chartData }]
            }}
            width={Dimensions.get("window").width - 40}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(80, 160, 255, ${opacity})`,
              labelColor: (opacity = 1) => colors.textSecondary,
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>

        {/* Mejoras y Debilidades */}
        <View style={styles.grid}>
          <View style={styles.listSection}>
            <Text style={[styles.sectionSubTitle, { color: colors.text }]}>Logros ✅</Text>
            {progressData.improvements.map((item, i) => (
              <Text key={i} style={[styles.listItem, { color: colors.textSecondary }]}>
                • {item}
              </Text>
            ))}
          </View>
          
          <View style={styles.listSection}>
            <Text style={[styles.sectionSubTitle, { color: colors.text }]}>Por Mejorar 📈</Text>
            {progressData.weaknesses.map((item, i) => (
              <View key={i} style={styles.trendRow}>
                <Ionicons 
                  name={item.trend === 'up' ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={item.trend === 'up' ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[styles.listItem, { color: colors.textSecondary }]}> 
                  {item.topic}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundColor: "#0F192D",
  backgroundGradientFrom: "#0F192D",
  backgroundGradientTo: "#152030",
  decimalPlaces: 0,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#50A0FF" }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', alignItems: 'center', padding: 20 },
  statValue: { fontSize: 28, fontWeight: '900', marginVertical: 5 },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  summaryCard: { 
    backgroundColor: 'rgba(80, 160, 255, 0.05)', 
    padding: 15, 
    borderRadius: 12, 
    borderLeftWidth: 3 
  },
  summaryText: { lineHeight: 22, fontSize: 15 },
  chartStyle: { borderRadius: 16, marginVertical: 8 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  listSection: { width: '48%' },
  sectionSubTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  listItem: { fontSize: 14, marginBottom: 8 },
  trendRow: { flexDirection: 'row', alignItems: 'center' }
});

export default ProgressScreen;