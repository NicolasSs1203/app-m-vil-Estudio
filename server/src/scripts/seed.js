const mongoose = require('mongoose');
require('dotenv').config();

const { User, Exercise, UserResponse, AIAnalysis, LearningPath } = require('../models/Schemas');

// ============================================================
// SEED DATA
// ============================================================

const users = [
  {
    email: 'beginner@test.com',
    displayName: 'Ana García',
    preferences: {
      language: 'es',
      learningGoals: ['Aprender JavaScript', 'Conseguir trabajo como dev'],
      experienceLevel: 'beginner',
      dailyGoalMinutes: 30,
    },
    lastActiveAt: new Date(),
  },
  {
    email: 'intermediate@test.com',
    displayName: 'Carlos López',
    preferences: {
      language: 'es',
      learningGoals: ['Dominar Node.js', 'Aprender DevOps'],
      experienceLevel: 'intermediate',
      dailyGoalMinutes: 60,
    },
    lastActiveAt: new Date(),
  },
  {
    email: 'advanced@test.com',
    displayName: 'María Torres',
    preferences: {
      language: 'en',
      learningGoals: ['Master system design', 'Learn Kubernetes'],
      experienceLevel: 'advanced',
      dailyGoalMinutes: 90,
    },
    lastActiveAt: new Date(),
  },
];

const exercises = [
  // JavaScript - Fácil
  {
    topic: 'JavaScript',
    category: 'Frontend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Cuál es la forma correcta de declarar una variable en JavaScript moderno?',
    options: ['var x = 5', 'let x = 5', 'int x = 5', 'dim x = 5'],
    correctAnswer: 'let x = 5',
    explanation: 'En JavaScript moderno se usa "let" para variables que pueden cambiar y "const" para constantes.',
    tags: ['variables', 'es6', 'fundamentos'],
  },
  {
    topic: 'JavaScript',
    category: 'Frontend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Qué devuelve typeof null en JavaScript?',
    options: ['null', 'undefined', 'object', 'string'],
    correctAnswer: 'object',
    explanation: 'typeof null devuelve "object" — es un bug histórico de JavaScript que se mantiene por compatibilidad.',
    tags: ['tipos', 'fundamentos', 'quirks'],
  },
  {
    topic: 'JavaScript',
    category: 'Frontend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Cuál método agrega un elemento al final de un array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctAnswer: 'push()',
    explanation: 'push() agrega elementos al final, pop() elimina el último, shift() elimina el primero, unshift() agrega al inicio.',
    tags: ['arrays', 'métodos', 'fundamentos'],
  },
  // JavaScript - Medio
  {
    topic: 'JavaScript',
    category: 'Frontend',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Qué es una Promesa (Promise) en JavaScript?',
    options: [
      'Una función que siempre retorna true',
      'Un objeto que representa un valor que puede estar disponible ahora, en el futuro o nunca',
      'Un tipo de variable especial',
      'Una forma de declarar clases',
    ],
    correctAnswer: 'Un objeto que representa un valor que puede estar disponible ahora, en el futuro o nunca',
    explanation: 'Las Promesas permiten manejar operaciones asíncronas de forma más legible que los callbacks.',
    tags: ['async', 'promesas', 'es6'],
  },
  {
    topic: 'JavaScript',
    category: 'Frontend',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Cuál es la diferencia entre == y === en JavaScript?',
    options: [
      'No hay diferencia',
      '=== compara valor y tipo, == solo compara valor con coerción',
      '== es más rápido que ===',
      '=== solo funciona con números',
    ],
    correctAnswer: '=== compara valor y tipo, == solo compara valor con coerción',
    explanation: 'Siempre usa === para evitar bugs por coerción de tipos implícita.',
    tags: ['operadores', 'tipos', 'buenas-practicas'],
  },
  // JavaScript - Difícil
  {
    topic: 'JavaScript',
    category: 'Frontend',
    difficulty: 'hard',
    type: 'multiple_choice',
    question: '¿Qué imprime el siguiente código? setTimeout(() => console.log(1), 0); console.log(2);',
    options: ['1, 2', '2, 1', 'undefined', 'Error'],
    correctAnswer: '2, 1',
    explanation: 'setTimeout se ejecuta en el event loop después del código síncrono, aunque el delay sea 0.',
    tags: ['event-loop', 'async', 'avanzado'],
  },
  // Backend - Node.js
  {
    topic: 'Node.js',
    category: 'Backend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Qué es Node.js?',
    options: [
      'Un framework de JavaScript para frontend',
      'Un entorno de ejecución de JavaScript del lado del servidor',
      'Un lenguaje de programación',
      'Una base de datos',
    ],
    correctAnswer: 'Un entorno de ejecución de JavaScript del lado del servidor',
    explanation: 'Node.js permite ejecutar JavaScript fuera del navegador, principalmente en servidores.',
    tags: ['node', 'fundamentos', 'backend'],
  },
  {
    topic: 'Node.js',
    category: 'Backend',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Qué módulo de Node.js se usa para crear un servidor HTTP básico?',
    options: ['fs', 'http', 'path', 'os'],
    correctAnswer: 'http',
    explanation: 'El módulo "http" es el módulo nativo de Node.js para crear servidores y manejar peticiones HTTP.',
    tags: ['http', 'servidor', 'módulos'],
  },
  {
    topic: 'Node.js',
    category: 'Backend',
    difficulty: 'hard',
    type: 'multiple_choice',
    question: '¿Qué es el Event Loop en Node.js?',
    options: [
      'Un bucle for especial de Node',
      'El mecanismo que permite a Node.js realizar operaciones no bloqueantes a pesar de ser single-threaded',
      'Una librería para manejo de eventos',
      'Un tipo de promesa',
    ],
    correctAnswer: 'El mecanismo que permite a Node.js realizar operaciones no bloqueantes a pesar de ser single-threaded',
    explanation: 'El Event Loop es el corazón de Node.js — delega operaciones I/O al sistema operativo y procesa callbacks cuando están listos.',
    tags: ['event-loop', 'arquitectura', 'avanzado'],
  },
  // Backend - Express
  {
    topic: 'Express',
    category: 'Backend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Cómo se define una ruta GET en Express?',
    options: ['app.get("/ruta", handler)', 'app.route("GET", "/ruta", handler)', 'express.get("/ruta")', 'router("/ruta").get(handler)'],
    correctAnswer: 'app.get("/ruta", handler)',
    explanation: 'En Express, app.get() define rutas para el método HTTP GET.',
    tags: ['express', 'rutas', 'fundamentos'],
  },
  {
    topic: 'Express',
    category: 'Backend',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Qué es un middleware en Express?',
    options: [
      'Una base de datos integrada',
      'Una función que tiene acceso a req, res y next en el ciclo de request-response',
      'Un tipo de ruta especial',
      'Una forma de manejar errores únicamente',
    ],
    correctAnswer: 'Una función que tiene acceso a req, res y next en el ciclo de request-response',
    explanation: 'Los middlewares son funciones que se ejecutan entre la petición y la respuesta, útiles para autenticación, logging, validación, etc.',
    tags: ['middleware', 'express', 'arquitectura'],
  },
  // DevOps
  {
    topic: 'Docker',
    category: 'DevOps',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Qué es Docker?',
    options: [
      'Un lenguaje de programación',
      'Una plataforma para desarrollar y ejecutar aplicaciones en contenedores',
      'Un sistema operativo',
      'Una base de datos',
    ],
    correctAnswer: 'Una plataforma para desarrollar y ejecutar aplicaciones en contenedores',
    explanation: 'Docker permite empaquetar aplicaciones con todas sus dependencias en contenedores portables.',
    tags: ['docker', 'contenedores', 'devops'],
  },
  {
    topic: 'Docker',
    category: 'DevOps',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Cuál es la diferencia entre una imagen y un contenedor en Docker?',
    options: [
      'No hay diferencia',
      'Una imagen es una plantilla estática; un contenedor es una instancia en ejecución de esa imagen',
      'Un contenedor es más grande que una imagen',
      'Las imágenes solo se usan en producción',
    ],
    correctAnswer: 'Una imagen es una plantilla estática; un contenedor es una instancia en ejecución de esa imagen',
    explanation: 'La imagen es como una clase y el contenedor como un objeto instanciado de esa clase.',
    tags: ['docker', 'imágenes', 'contenedores'],
  },
  {
    topic: 'Git',
    category: 'DevOps',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Qué comando crea una nueva rama en Git?',
    options: ['git new branch', 'git branch nombre', 'git create nombre', 'git checkout nombre'],
    correctAnswer: 'git branch nombre',
    explanation: 'git branch crea la rama pero no te mueve a ella. Usa git checkout -b para crear y moverse.',
    tags: ['git', 'ramas', 'fundamentos'],
  },
  {
    topic: 'Git',
    category: 'DevOps',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Qué es un git rebase?',
    options: [
      'Eliminar una rama',
      'Mover o combinar commits a una nueva base, reescribiendo el historial',
      'Lo mismo que git merge',
      'Crear un backup del repositorio',
    ],
    correctAnswer: 'Mover o combinar commits a una nueva base, reescribiendo el historial',
    explanation: 'Rebase reescribe el historial de commits para que parezca que tu trabajo empezó desde un punto diferente.',
    tags: ['git', 'rebase', 'avanzado'],
  },
  // MongoDB
  {
    topic: 'MongoDB',
    category: 'Backend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Qué tipo de base de datos es MongoDB?',
    options: ['Relacional', 'Orientada a documentos (NoSQL)', 'De grafos', 'Clave-valor'],
    correctAnswer: 'Orientada a documentos (NoSQL)',
    explanation: 'MongoDB almacena datos en documentos BSON (similar a JSON), organizados en colecciones.',
    tags: ['mongodb', 'nosql', 'fundamentos'],
  },
  {
    topic: 'MongoDB',
    category: 'Backend',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Qué es un índice en MongoDB y para qué sirve?',
    options: [
      'Una copia de seguridad de los datos',
      'Una estructura que mejora la velocidad de las consultas a costa de más espacio en disco',
      'Un tipo especial de colección',
      'Una forma de relacionar colecciones',
    ],
    correctAnswer: 'Una estructura que mejora la velocidad de las consultas a costa de más espacio en disco',
    explanation: 'Sin índices, MongoDB hace un "collection scan" revisando todos los documentos. Los índices permiten búsquedas eficientes.',
    tags: ['mongodb', 'índices', 'performance'],
  },
  {
    topic: 'MongoDB',
    category: 'Backend',
    difficulty: 'hard',
    type: 'multiple_choice',
    question: '¿Qué es el Aggregation Pipeline en MongoDB?',
    options: [
      'Una forma de conectar múltiples bases de datos',
      'Un framework para procesar datos en múltiples etapas, transformando documentos paso a paso',
      'Un tipo de índice especial',
      'Una forma de hacer joins entre colecciones',
    ],
    correctAnswer: 'Un framework para procesar datos en múltiples etapas, transformando documentos paso a paso',
    explanation: 'El Aggregation Pipeline permite hacer operaciones complejas como group, match, sort, project encadenadas.',
    tags: ['mongodb', 'aggregation', 'avanzado'],
  },
  // CSS
  {
    topic: 'CSS',
    category: 'Frontend',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: '¿Qué propiedad CSS se usa para cambiar el color de fondo?',
    options: ['color', 'background-color', 'bg-color', 'fill'],
    correctAnswer: 'background-color',
    explanation: '"color" cambia el color del texto, "background-color" cambia el fondo del elemento.',
    tags: ['css', 'estilos', 'fundamentos'],
  },
  {
    topic: 'CSS',
    category: 'Frontend',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: '¿Cuál es la diferencia entre display: flex y display: grid?',
    options: [
      'No hay diferencia práctica',
      'Flex es unidimensional (fila o columna), Grid es bidimensional (filas y columnas)',
      'Grid es más antiguo que Flex',
      'Flex solo funciona en Chrome',
    ],
    correctAnswer: 'Flex es unidimensional (fila o columna), Grid es bidimensional (filas y columnas)',
    explanation: 'Usa Flexbox para layouts en una dirección y CSS Grid para layouts en dos dimensiones.',
    tags: ['css', 'flexbox', 'grid', 'layout'],
  },
];

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

const seed = async () => {
  try {
    console.log('🌱 Iniciando seed...');
    console.log('📡 Conectando a MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Limpiar colecciones existentes
    console.log('🧹 Limpiando colecciones...');
    await Promise.all([
      User.deleteMany({}),
      Exercise.deleteMany({}),
      UserResponse.deleteMany({}),
      AIAnalysis.deleteMany({}),
      LearningPath.deleteMany({}),
    ]);
    console.log('✅ Colecciones limpias\n');

    // Insertar usuarios
    console.log('👥 Creando usuarios...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} usuarios creados`);

    // Insertar ejercicios
    console.log('📝 Creando ejercicios...');
    const createdExercises = await Exercise.insertMany(exercises);
    console.log(`✅ ${createdExercises.length} ejercicios creados`);

    // Crear historial de respuestas para el usuario beginner (mínimo 15)
    console.log('📊 Creando historial de respuestas...');
    const beginnerUser = createdUsers[0];
    const responses = [];

    for (let i = 0; i < createdExercises.length; i++) {
      const exercise = createdExercises[i];
      const isCorrect = Math.random() > 0.4; // 60% de acierto
      responses.push({
        userId: beginnerUser._id,
        exerciseId: exercise._id,
        answer: isCorrect ? exercise.correctAnswer : exercise.options?.[1] || 'wrong answer',
        isCorrect,
        timeSpentSeconds: Math.floor(Math.random() * 120) + 15,
        attemptNumber: 1,
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    // Agregar respuestas extra para llegar a mínimo 15
    for (let i = 0; i < 5; i++) {
      const exercise = createdExercises[i];
      responses.push({
        userId: beginnerUser._id,
        exerciseId: exercise._id,
        answer: exercise.correctAnswer,
        isCorrect: true,
        timeSpentSeconds: Math.floor(Math.random() * 60) + 10,
        attemptNumber: 2,
        submittedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      });
    }

    const createdResponses = await UserResponse.insertMany(responses);
    console.log(`✅ ${createdResponses.length} respuestas creadas`);

    // Crear learning paths
    console.log('🗺️  Creando learning paths...');
    const learningPaths = [
      {
        userId: createdUsers[0]._id,
        generatedByAI: true,
        topics: [
          { name: 'JavaScript Fundamentos', status: 'in_progress', priority: 1, lastUpdated: new Date(), aiNotes: 'El usuario muestra buen progreso en variables y tipos de datos' },
          { name: 'HTML & CSS', status: 'completed', priority: 2, lastUpdated: new Date(), aiNotes: 'Completado con éxito' },
          { name: 'Node.js Básico', status: 'pending', priority: 3, lastUpdated: new Date(), aiNotes: 'Próximo tema recomendado' },
        ],
        lastGeneratedAt: new Date(),
        nextReviewAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: createdUsers[1]._id,
        generatedByAI: true,
        topics: [
          { name: 'Node.js Avanzado', status: 'in_progress', priority: 1, lastUpdated: new Date(), aiNotes: 'Buen dominio de Express, enfocarse en performance' },
          { name: 'Docker & DevOps', status: 'pending', priority: 2, lastUpdated: new Date(), aiNotes: 'Recomendado después de Node.js avanzado' },
          { name: 'MongoDB Avanzado', status: 'needs_review', priority: 3, lastUpdated: new Date(), aiNotes: 'Revisar aggregation pipeline' },
        ],
        lastGeneratedAt: new Date(),
        nextReviewAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdPaths = await LearningPath.insertMany(learningPaths);
    console.log(`✅ ${createdPaths.length} learning paths creados`);

    // Resumen final
    console.log('\n🎉 Seed completado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Usuarios:          ${createdUsers.length}`);
    console.log(`📝 Ejercicios:        ${createdExercises.length}`);
    console.log(`📊 Respuestas:        ${createdResponses.length}`);
    console.log(`🗺️  Learning Paths:   ${createdPaths.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error en seed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

seed();