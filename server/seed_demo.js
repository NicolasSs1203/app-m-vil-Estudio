const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = 'app-estudio';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB - Ajustando a valores Mongoose');
    const db = client.db(dbName);

    const demoEmail = 'demo@zenith.com';
    const user = await db.collection('users').findOne({ email: demoEmail });
    
    if (!user) {
      console.error('❌ Error: El usuario demo@zenith.com no existe.');
      return;
    }

    const userId = user._id;

    // 1. Actualizar perfil usando enums de Mongoose ('advanced' en lugar de 'Avanzado')
    await db.collection('users').updateOne({ _id: userId }, {
      $set: {
        displayName: 'Nicolas Senior Architect',
        preferences: {
          language: 'es',
          experienceLevel: 'advanced', // Valor correcto para el Schema
          learningGoals: ['Microservicios', 'Cloud Computing', 'Kafka'],
          dailyGoalMinutes: 60
        }
      }
    });
    console.log('👤 Perfil actualizado a nivel: advanced');

    // 2. Generar historial
    const responses = [];
    const now = new Date();
    const advancedTopics = ['Clean Architecture', 'Docker', 'Kubernetes', 'Design Patterns', 'Cybersecurity'];

    await db.collection('user_responses').deleteMany({ userId: userId });

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      responses.push({
        userId: userId,
        exerciseId: new ObjectId(), // Generamos IDs nuevos para la demo
        topic: advancedTopics[i % advancedTopics.length],
        answer: 'Implementación técnica de alto nivel con optimización de rendimiento...',
        score: 92 + Math.random() * 8,
        isCorrect: true,
        submittedAt: date,
        timeSpentSeconds: 450
      });
    }

    await db.collection('user_responses').insertMany(responses);
    console.log('📊 Historial de 30 días inyectado correctamente');

    // 3. Limpiar análisis previos
    await db.collection('ai_analysis').deleteMany({ userId: userId });

    console.log('✨ ¡TODO LISTO! Prueba iniciar sesión ahora.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

seed();
