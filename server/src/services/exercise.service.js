const { Exercise, UserResponse } = require('../models/Schemas');

class ExerciseService {
  constructor(db) {
    this.db = db;
  }

  async findAll(filters = {}) {
    const { topic, difficulty, category } = filters;
    const query = {};
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    // Devolvemos los ejercicios excluyendo la respuesta correcta por seguridad (opcional, pero buena práctica)
    return await Exercise.find(query).select('-correctAnswer');
  }

  async findById(id) {
    return await Exercise.findById(id);
  }

  async submitResponse(exerciseId, userId, userSolution) {
    // 1. Obtener el ejercicio con su respuesta correcta
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw new Error('Ejercicio no encontrado');

    // 2. Verificar si es correcta
    let isCorrect = false;
    
    // Validar según el tipo de respuesta esperada
    if (typeof exercise.correctAnswer === 'string') {
      isCorrect = String(userSolution).trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
    } else if (Array.isArray(exercise.correctAnswer)) {
      // Si la respuesta es un array (ej. de opciones múltiples), verificamos si la solución está incluida o si coincide exactamente
      isCorrect = exercise.correctAnswer.includes(userSolution) || 
                  JSON.stringify(exercise.correctAnswer) === JSON.stringify(userSolution);
    } else {
      isCorrect = exercise.correctAnswer == userSolution;
    }

    // 3. Calcular attemptNumber contando los intentos previos en la base de datos
    const previousAttempts = await UserResponse.countDocuments({
      exerciseId: exerciseId,
      userId: userId
    });
    const attemptNumber = previousAttempts + 1;

    // 4. Crear y guardar el registro en la base de datos
    const responseRecord = new UserResponse({
      userId,
      exerciseId,
      answer: userSolution,
      isCorrect,
      attemptNumber,
      // Se podría recibir el tiempo invertido desde el cliente, pero por ahora lo dejamos en 0 o el que envíen
      timeSpentSeconds: 0 
    });

    await responseRecord.save();
    
    // Devolvemos el resultado al cliente
    return {
      success: true,
      isCorrect,
      attemptNumber,
      message: isCorrect ? '¡Excelente! Respuesta correcta.' : 'No es la respuesta correcta, ¡inténtalo de nuevo!',
      submittedAt: responseRecord.submittedAt,
      explanation: isCorrect ? exercise.explanation : null
    };
  }

  async create(data) {
    const newExercise = new Exercise(data);
    await newExercise.save();
    return newExercise;
  }
}

module.exports = ExerciseService;