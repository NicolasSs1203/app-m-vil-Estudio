import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  
  // Configuración de los accesos rápidos a las funciones de IA
  const menuItems = [
    {
      title: 'Plan de Hoy',
      subtitle: 'Recomendaciones de la IA',
      icon: 'bulb',
      color: '#50A0FF',
      screen: 'Recommendations'
    },
    {
      title: 'Mi Progreso',
      subtitle: 'Análisis de rendimiento',
      icon: 'trending-up',
      color: '#4CAF50',
      screen: 'Progress'
    },
    {
      title: 'Tutor IA',
      subtitle: 'Resuelve tus dudas',
      icon: 'chatbubbles',
      color: '#9C27B0',
      screen: 'Chat IA' // Este navega a la pestaña del Tab
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hola, Juan Sebastian</Text>
          <Text style={styles.brandText}>Zenith AI</Text>
        </View>

        <Text style={styles.sectionTitle}>Acceso Rápido</Text>
        
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner de estado del proyecto actual */}
        <TouchableOpacity 
          style={styles.projectBanner}
          onPress={() => navigation.navigate('Árbol')}
        >
          <View>
            <Text style={styles.projectLabel}>PROYECTO ACTUAL</Text>
            <Text style={styles.projectTitle}>Aplicaciones Móviles</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8AABC8" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  welcomeText: { color: '#8AABC8', fontSize: 16 },
  brandText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { color: '#50A0FF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: '#0F192D',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(80, 160, 255, 0.1)'
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#8AABC8', fontSize: 11, marginTop: 4 },
  projectBanner: {
    backgroundColor: '#152030',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#50A0FF'
  },
  projectLabel: { color: '#50A0FF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  projectTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 }
});

export default HomeScreen;