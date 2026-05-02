import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ImageBackground } from 'react-native';
import { Image } from 'expo-image';

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in everything smoothly
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/bg_cyberpunk.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/logo.svg')} 
            style={styles.artImage} 
            contentFit="contain"
          />
        </View>

      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 21, 0.35)', // Lighter overlay to show off the wallpaper
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artImage: {
    width: 340,
    height: 340,
    zIndex: 10,
  },
});
