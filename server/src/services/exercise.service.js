class ExerciseService {
  constructor(db) {
    this.db = db;
    this.collection = db ? db.collection('exercises') : null;

    // Datos de prueba con respuestas correctas para validar el Submit
    this.mockExercises = [
      { 
        id: '1', 
        title: 'Lógica de Programación', 
        topic: 'software', 
        difficulty: 'easy', 
        category: 'logic',
        correctAnswer: '42' // Respuesta ejemplo
      },
      { 
        id: '2', 
        title: 'Circuitos con Arduino', 
        topic: 'electronics', 
        difficulty: 'medium', 
        category: 'hardware',
        correctAnswer: 'resistencia'
      },
      { 
        id: '3', 
        title: 'Consultas SQL Avanzadas', 
        topic: 'software', 
        difficulty: 'hard', 
        category: 'databases',
        correctAnswer: 'SELECT'
      }
    ];

    // Simulación de base de datos para respuestas (user_responses)
    this.userResponses = [];
  }

  async findAll(filters = {}) {
    const { topic, difficulty, category } = filters;
    let exercises = [...this.mockExercises];
    if (topic) exercises = exercises.filter(e => e.topic === topic);
    if (difficulty) exercises = exercises.filter(e => e.difficulty === difficulty);
    if (category) exercises = exercises.filter(e => e.category === category);
    return exercises;
  }

  async findById(id) {
    return this.mockExercises.find(e => e.id === id);
  }

  // NUEVO: Método para procesar el envío de respuesta (Checklist ✅)
  async submitResponse(exerciseId, userId, userSolution) {
    const exercise = await this.findById(exerciseId);
    if (!exercise) throw new Error('Ejercicio no encontrado');

    // 1. Verificar si es correcta (Checklist ✅)
    const isCorrect = userSolution.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();

    // 2. Calcular attemptNumber (Checklist ✅)
    // Filtramos las respuestas previas de este usuario para este ejercicio
    const previousAttempts = this.userResponses.filter(
      r => r.exerciseId === exerciseId && r.userId === userId
    );
    const attemptNumber = previousAttempts.length + 1;

    // 3. Crear el registro para "user_responses" (Checklist ✅)
    const responseRecord = {
      id: `resp_${Date.now()}`,
      exerciseId,
      userId,
      userSolution,
      isCorrect,
      attemptNumber,
      submittedAt: new Date()
    };

    // Guardamos en nuestro array (simulando la DB)
    this.userResponses.push(responseRecord);
    
    return responseRecord;
  }

  async create(data) {
    const newExercise = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date()
    };
    this.mockExercises.push(newExercise);
    return newExercise;
  }
}

module.exports = ExerciseService;