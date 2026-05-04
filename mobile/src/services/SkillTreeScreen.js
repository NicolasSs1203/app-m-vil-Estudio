import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import skill_service from '../services/skill.service';

const SkillTreeScreen = ({ navigation }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      // Usamos datos simulados basados en tus temas de "Aplicaciones Móviles"
      const data = [
        { id: 1, title: 'Fundamentos', status: 'completed', topics: ['Metodologías', 'Scrum'] },
        { id: 2, title: 'Diseño UI', status: 'in-progress', topics: ['Colorimetría', 'Layouts'] },
        { id: 3, title: 'Desarrollo', status: 'locked', topics: ['React Native', 'API Integration'] },
        { id: 4, title: 'Hardware', status: 'locked', topics: ['Arduino', 'I2C/RFID'] },
      ];
      setTreeData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node, index) => {
    const isLocked = node.status === 'locked';
    const isCompleted = node.status === 'completed';

    return (
      <View key={node.id} style={styles.nodeWrapper}>
        {/* Línea conectora */}
        {index !== 0 && <View style={[styles.connector, isCompleted && styles.connectorActive]} />}
        
        <TouchableOpacity 
          style={[
            styles.nodeCircle, 
            isCompleted && styles.nodeCompleted,
            isLocked && styles.nodeLocked
          ]}
          disabled={isLocked}
          onPress={() => alert(`Temas: ${node.topics.join(', ')}`)}
        >
          <Ionicons 
            name={isLocked ? "lock-closed" : (isCompleted ? "checkmark" : "rocket")} 
            size={28} 
            color={isLocked ? "#405570" : "#FFF"} 
          />
        </TouchableOpacity>

        <View style={styles.nodeInfo}>
          <Text style={[styles.nodeTitle, isLocked && styles.textLocked]}>{node.title}</Text>
          <Text style={styles.nodeTopics}>{node.topics.join(' • ')}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ruta de Aprendizaje</Text>
        <Text style={styles.headerSubtitle}>Domina el desarrollo de software y hardware</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#50A0FF" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {treeData.map((node, index) => renderNode(node, index))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#0F192D' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: '#8AABC8', marginTop: 5 },
  scrollContent: { alignItems: 'center', paddingVertical: 40 },
  nodeWrapper: { alignItems: 'center', marginBottom: 0, width: '100%' },
  nodeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#50A0FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 5,
    shadowColor: '#50A0FF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  nodeCompleted: { backgroundColor: '#4CAF50' },
  nodeLocked: { backgroundColor: '#152030', borderWidth: 1, borderColor: '#405570' },
  nodeInfo: { marginTop: 10, alignItems: 'center', marginBottom: 40 },
  nodeTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  nodeTopics: { color: '#8AABC8', fontSize: 12, marginTop: 4 },
  textLocked: { color: '#405570' },
  connector: {
    width: 4,
    height: 40,
    backgroundColor: '#152030',
    marginTop: -40,
    zIndex: 1,
  },
  connectorActive: { backgroundColor: '#4CAF50' }
});

export default SkillTreeScreen;