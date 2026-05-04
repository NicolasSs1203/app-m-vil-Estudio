import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth.service';

const LEVELS = [
  { label: 'Principiante', value: 'Principiante' },
  { label: 'Intermedio',   value: 'Intermedio' },
  { label: 'Avanzado',     value: 'Avanzado' },
];

const RegisterScreen = ({ onLogin }) => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    nombre:   '',
    email:    '',
    password: '',
    nivel:    '',
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const validate = () => {
    if (!formData.nombre.trim())   return 'El nombre es obligatorio.';
    if (!formData.email.trim())    return 'El correo es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'El correo no es válido.';
    if (formData.password.length < 6)          return 'La contraseña debe tener al menos 6 caracteres.';
    if (!formData.nivel)           return 'Selecciona tu nivel de experiencia.';
    return null;
  };

  const handleRegister = async () => {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const response = await authService.register({
        name:     formData.nombre,
        email:    formData.email,
        password: formData.password,
        nivel:    formData.nivel,
      });

      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
      }

      // En la web Alert.alert usa window.alert, nos aseguramos de que se vea
      Alert.alert(
        '🚀 ¡Cuenta Activada!',
        `Bienvenido al sistema Zenith, ${formData.nombre}. Ya puedes comenzar tu entrenamiento.`,
        [
          { 
            text: 'ENTRAR AL SISTEMA', 
            onPress: () => {
              if (onLogin) onLogin(); 
            }
          }
        ],
        { cancelable: false }
      );

      // Fallback para Web si Alert no bloquea
      if (Platform.OS === 'web') {
        setTimeout(() => {
          if (onLogin) onLogin();
        }, 3000);
      }

    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/fondoBlanco.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <Text style={styles.title}>Zenith</Text>
            <Text style={styles.subtitle}>Crea tu perfil de recluta</Text>
          </View>

          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#FF3131" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#8AABC8"
                value={formData.nombre}
                onChangeText={(val) => setFormData({ ...formData, nombre: val })}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#FF3131" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#8AABC8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => setFormData({ ...formData, email: val })}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#FF3131" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6)"
                placeholderTextColor="#8AABC8"
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => setFormData({ ...formData, password: val })}
              />
            </View>

            <Text style={styles.levelLabel}>Nivel de experiencia</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((lvl) => (
                <TouchableOpacity
                  key={lvl.value}
                  style={[
                    styles.levelBtn,
                    formData.nivel === lvl.value && styles.levelBtnActive,
                  ]}
                  onPress={() => setFormData({ ...formData, nivel: lvl.value })}
                >
                  <Text style={[
                    styles.levelBtnText,
                    formData.nivel === lvl.value && styles.levelBtnTextActive,
                  ]}>
                    {lvl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>CREAR CUENTA</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? <Text style={styles.linkHighlight}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FF3131',
    letterSpacing: 5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 49, 49, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 12,
    color: '#FF3131',
    letterSpacing: 3,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'rgba(15, 20, 30, 0.85)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#FF3131',
    shadowColor: '#FF3131',
    shadowRadius: 15,
    elevation: 10,
  },
  errorText: {
    color: '#FF3131',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 49, 49, 0.2)',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  levelLabel: {
    fontSize: 12,
    color: '#8AABC8',
    marginBottom: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  levelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 49, 49, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelBtnActive: {
    borderColor: '#FF3131',
    backgroundColor: 'rgba(255, 49, 49, 0.2)',
  },
  levelBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8AABC8',
  },
  levelBtnTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#FF3131',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3131',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#8AABC8',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#FF3131',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;