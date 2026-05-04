import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ai_service from '../services/ai.service';

const ChatAIScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola Juan! Soy tu tutor Zenith. ¿En qué puedo ayudarte hoy con tus proyectos de software o Arduino?', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // El userId debería venir de tu estado global de Auth
      const response = await ai_service.sendMessage(userMsg.text, "user_123");
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: 'ai',
        relatedTopics: response.relatedTopics || [],
        suggestedExerciseId: response.suggestedExerciseId
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: 'Lo siento, tuve un problema de conexión. Inténtalo de nuevo.', sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.messageText}>{item.text}</Text>
      
      {/* Chips de temas relacionados (Checklist F-07) */}
      {item.relatedTopics?.length > 0 && (
        <View style={styles.chipContainer}>
          {item.relatedTopics.map((topic, index) => (
            <View key={index} style={styles.topicChip}>
              <Text style={styles.topicText}>#{topic}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Link a ejercicio sugerido (Checklist F-07) */}
      {item.suggestedExerciseId && (
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.suggestedExerciseId })}
        >
          <Ionicons name="code-working" size={16} color="#FFF" />
          <Text style={styles.suggestionButtonText}>Probar ejercicio sugerido</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#50A0FF" />
          <Text style={styles.typingText}>Zenith está pensando...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pregunta sobre JavaScript, Arduino, SQL..."
          placeholderTextColor="#405570"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A15' },
  chatList: { padding: 15, paddingBottom: 20 },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 18, marginBottom: 15 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#50A0FF' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#152030', borderBottomLeftRadius: 2 },
  messageText: { color: '#FFF', fontSize: 15, lineHeight: 20 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    backgroundColor: '#0F192D', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#152030'
  },
  input: { flex: 1, color: '#FFF', paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, maxHeight: 100 },
  sendButton: { marginLeft: 10, padding: 8, backgroundColor: '#50A0FF', borderRadius: 50 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, marginBottom: 10 },
  typingText: { color: '#8AABC8', fontSize: 12, marginLeft: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  topicChip: { backgroundColor: 'rgba(80, 160, 255, 0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 4 },
  topicText: { color: '#50A0FF', fontSize: 11, fontWeight: 'bold' },
  suggestionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#4CAF50', 
    borderRadius: 8, 
    padding: 8, 
    marginTop: 10,
    justifyContent: 'center'
  },
  suggestionButtonText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 }
});

export default ChatAIScreen;