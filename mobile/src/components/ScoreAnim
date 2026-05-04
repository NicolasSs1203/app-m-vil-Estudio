import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

export const ScoreAnim = ({ targetScore }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // La animación dura 1 segundo
    const increment = targetScore / (duration / 16); // Cálculo para 60 cuadros por segundo

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetScore]);

  return (
    <Text style={styles.scoreText}>
      {displayScore}/100
    </Text>
  );
};

const styles = StyleSheet.create({
  scoreText: {
    color: '#50A0FF', // El azul de tu sistema Zenith
    fontSize: 28,
    fontWeight: '900',
  }
});