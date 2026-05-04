import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ImageBackground } from 'react-native';

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/fondoBlanco.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.Image
          source={require('../../assets/logo4.png')}
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
      </Animated.View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 280,
  },
});
