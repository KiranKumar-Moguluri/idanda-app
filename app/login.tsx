import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Animated } from 'react-native';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { showError } from '../utils/errorHandler';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const scaleValue = useState(new Animated.Value(1))[0];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert('Warning', 'Please verify your email before logging in.');
        return;
      }

      Alert.alert('Login Successful!', `Welcome back, ${user.email}`);
      router.replace('/tabs/home');
    } catch (error) {
      showError(error, 'Login Failed');
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(handleLogin);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Let’s get things done together.</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
      </View>

      <Animated.View style={[styles.gradientButton, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity onPress={animateButton} style={{ width: '100%' }}>
          <LinearGradient
            colors={['#4C8BF5', '#6AC8F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.innerGradient}
          >
            <Text style={styles.buttonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.link}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>iDanda • Connecting people through jobs & services</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0fc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4C8BF5',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  gradientButton: {
    width: '100%',
    borderRadius: 30,
    marginTop: 10,
    // ✅ Clearly updated to fix warnings
    boxShadow: '0px 5px 10px rgba(76, 139, 245, 0.3)',
    elevation: 3, // Keeps native Android shadow
  },
  innerGradient: {
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    marginTop: 20,
    color: '#4C8BF5',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
