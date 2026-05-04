import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert, 
  SafeAreaView, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ZButton } from '../components/ZButton';
import { ZCard } from '../components/ZCard';
import user_service from '../services/user.service';

const ProfileScreen = ({ onLogout }) => {
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dailyGoal, setDailyGoal] = useState('30');
  const [experience, setExperience] = useState('Intermedio');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await user_service.getProfile();
      if (data.user) {
        setUser(data.user);
        setDailyGoal(data.user.preferences?.dailyGoalMinutes?.toString() || '30');
        setExperience(data.user.preferences?.experienceLevel || 'Principiante');
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await user_service.updatePreferences({
        dailyGoalMinutes: parseInt(dailyGoal),
        experienceLevel: experience
      });
      Alert.alert("Éxito", "Tus preferencias han sido actualizadas.");
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.m }}>
        
        {/* Encabezado Principal */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.displayName || 'Cargando...'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* Configuración de Metas (F-09) */}
        <ZCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Metas de Aprendizaje</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nivel de Experiencia</Text>
            <View style={styles.selectorRow}>
              {['Principiante', 'Intermedio', 'Avanzado'].map((lvl) => (
                <TouchableOpacity 
                  key={lvl} 
                  style={[
                    styles.chip, 
                    { borderColor: colors.border },
                    experience === lvl && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setExperience(lvl)}
                >
                  <Text style={[
                    styles.chipText, 
                    { color: colors.textSecondary },
                    experience === lvl && { color: '#FFF', fontWeight: 'bold' }
                  ]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Meta Diaria (Minutos)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surfaceLight, color: colors.text }]}
              keyboardType="numeric"
              value={dailyGoal}
              onChangeText={setDailyGoal}
            />
          </View>

          <ZButton title="Guardar Preferencias" onPress={handleUpdate} />
        </ZCard>

        {/* Sección Informativa */}
        <ZCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Zenith AI</Text>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Versión 1.0.0 — Stable</Text>
          </View>
        </ZCard>

        {/* Botón de Salida */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  profileHeader: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userEmail: { fontSize: 14, marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },
  input: { borderRadius: 8, padding: 12, fontSize: 16 },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 10, fontSize: 14 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 10 },
  logoutText: { marginLeft: 10, fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;