import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const navigation = useNavigation();
  
  // Estado para capturar los datos del checklist (F-02)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    nivel: '' // Nivel de experiencia
  });

  const handleRegister = () => {
    console.log("Datos de registro:", formData);
    // Aquí conectarás con el backend (B-02) más adelante
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crea tu cuenta</Text>
      <Text style={styles.subtitle}>Únete a la comunidad de entrenamiento</Text>

      {/* Campo: Nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={formData.nombre}
        onChangeText={(val) => setFormData({...formData, nombre: val})}
      />

      {/* Campo: Email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(val) => setFormData({...formData, email: val})}
      />

      {/* Campo: Password */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={formData.password}
        onChangeText={(val) => setFormData({...formData, password: val})}
      />

      {/* Campo: Nivel de Experiencia */}
      <TextInput
        style={styles.input}
        placeholder="Nivel (Principiante, Intermedio, Avanzado)"
        value={formData.nivel}
        onChangeText={(val) => setFormData({...formData, nivel: val})}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f8fafc',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
  },
});

export default RegisterScreen;