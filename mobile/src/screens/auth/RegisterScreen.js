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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // ── Validación local ──────────────────────────────────────────
  const validate = () => {
    if (!formData.nombre.trim())   return 'El nombre es obligatorio.';
    if (!formData.email.trim())    return 'El correo es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'El correo no es válido.';
    if (formData.password.length < 6)          return 'La contraseña debe tener al menos 6 caracteres.';
    if (!formData.nivel)           return 'Selecciona tu nivel de experiencia.';
    return null;
  };

  // ── Registro ──────────────────────────────────────────────────
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

      // Guardar token JWT en AsyncStorage
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
      }

      Alert.alert(
        '¡Cuenta creada!',
        `Bienvenido, ${formData.nombre}. Ya puedes comenzar tu entrenamiento.`,
        [{ text: 'Continuar', onPress: () => onLogin() }]
      );
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar. Intenta de nuevo.';
      // Caso común: correo ya registrado
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('existe')) {
        setError('Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crea tu cuenta</Text>
      <Text style={styles.subtitle}>Únete a la comunidad de entrenamiento</Text>

      {/* Error global */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#94a3b8"
        value={formData.nombre}
        onChangeText={(val) => setFormData({ ...formData, nombre: val })}
      />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#94a3b8"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(val) => setFormData({ ...formData, email: val })}
      />

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={formData.password}
        onChangeText={(val) => setFormData({ ...formData, password: val })}
      />

      {/* Selector de Nivel */}
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
            <Text
              style={[
                styles.levelBtnText,
                formData.nivel === lvl.value && styles.levelBtnTextActive,
              ]}
            >
              {lvl.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón registrar */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Registrarse</Text>
        }
      </TouchableOpacity>

      {/* Link a Login */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 28,
    textAlign: 'center',
  },
  errorText: {
    width: '100%',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 14,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    fontSize: 15,
  },
  levelLabel: {
    width: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  levelBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  levelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  levelBtnTextActive: {
    color: '#2563eb',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 22,
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkBold: {
    color: '#2563eb',
    fontWeight: '700',
  },
});

export default RegisterScreen;