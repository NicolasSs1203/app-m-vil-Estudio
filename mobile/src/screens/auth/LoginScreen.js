import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert("Acceso denegado", "Por favor completa tus credenciales");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.login(email.trim().toLowerCase(), password);
      console.log('✅ Login exitoso:', response.message);
      
      // Guardar el token para futuras peticiones (como dice el Checklist)
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
      }
      
      if (onLogin) {
        onLogin();
      }
    } catch (error) {
      console.error('❌ Error Login:', error.message);
      const errorMsg = error.response?.data?.error || 'No se pudo conectar con el servidor NEXUS';
      Alert.alert("Autenticación Fallida", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/fondoBlanco.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Logo and Brand */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../../assets/logo4.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Zenith</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        {/* Glassmorphism Form Container */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#FF3131" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#8AABC8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#FF3131" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#8AABC8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && { opacity: 0.7 }]} 
            onPress={handleLogin} 
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'AUTENTICANDO...' : 'AUTENTICAR'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>¿Nuevo usuario? <Text style={styles.linkHighlight}>Regístrate aquí</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A15',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Capa de contraste para suavizar el blanco de fondo
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 0, // Reducimos el margen porque el logo ya es grande
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FF3131', // Rojo Neón Brillante
    letterSpacing: 5,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 49, 49, 0.8)', // Resplandor Neón
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 12,
    color: '#FF3131', // Subtítulo también en rojo neón suave
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'rgba(15, 20, 30, 0.8)', // Semi-transparente para efecto cristal
    borderRadius: 30,
    padding: 28,
    borderWidth: 1.5,
    borderColor: '#FF3131',
    shadowColor: '#FF3131',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Casi invisible
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 49, 49, 0.2)', // Borde rojo muy sutil
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
    color: '#FF3131', // Iconos en rojo
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  button: {
    backgroundColor: '#FF3131', // Botón Rojo Neón
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF3131',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#8AABC8',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#FF3131', // Enlace en rojo
    fontWeight: 'bold',
  },
});

export default LoginScreen;