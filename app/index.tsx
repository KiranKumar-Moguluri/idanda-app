import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ✅ Circular Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Welcome to iDanda</Text>
      <Text style={styles.subtitle}>Find Jobs. Post Tasks. Connect Easily.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.push('/login')}>
        <Text style={styles.secondaryButtonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Empowering people to earn and help each other.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,               // ✅ Circle shape
    borderWidth: 4,                 // Optional: Clean border
    borderColor: '#4C8BF5',         // Matches your theme color
    backgroundColor: '#fff',        // Clean white inside the circle
    overflow: 'hidden',             // Makes sure the logo stays inside the circle
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4C8BF5',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#4C8BF5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#4C8BF5',
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: '#4C8BF5',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
});
