// app/login.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import { auth } from '../services/firebaseConfig';
import { showError } from '../utils/errorHandler';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.95, 540);

export default function LoginScreen() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  // — Expo‑Auth Google SSO setup (unchanged) —
  const redirectUri = makeRedirectUri({ useProxy: true } as any);
  const WEB_CLIENT_ID = '229236383058-4d6b1iev53qhdh0df23usufebvc9ldqt.apps.googleusercontent.com';
  const [gRequest, gResponse, promptGoogle] = Google.useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      responseType: ResponseType.IdToken,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    },
    { useProxy: true } as any
  );

  useEffect(() => {
    if (gResponse?.type === 'success' && gResponse.params.id_token) {
      const cred = GoogleAuthProvider.credential(gResponse.params.id_token);
      signInWithCredential(auth, cred).catch(err =>
        showError(err, 'Google Sign‑In Failed')
      );
    }
  }, [gResponse]);

  // Navigate on successful auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        router.replace('/tabs/home');
      }
    });
    return unsub;
  }, []);

  // Improved Email/Password login with detailed error messages
  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      const msg = 'Please enter both email and password.';
      return Platform.OS === 'web'
        ? window.alert(msg)
        : Alert.alert('Error', msg);
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged will redirect us
    } catch (err: any) {
      // Helper to show alert in web or native
      const show = (title: string, message: string) => {
        if (Platform.OS === 'web') return window.alert(`${title}\n\n${message}`);
        return Alert.alert(title, message);
      };

      switch (err.code) {
        case 'auth/wrong-password':
          show('Login Failed', 'Incorrect password. Please try again.');
          break;
        case 'auth/user-not-found':
          show('Login Failed', 'No account found with that email.');
          break;
        case 'auth/invalid-email':
          show('Login Failed', 'That email address is invalid.');
          break;
        case 'auth/user-disabled':
          show('Login Failed', 'This account has been disabled.');
          break;
        default:
          showError(err, 'Login Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const animateAndLogin = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(handleEmailLogin);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {/* Logo */}
          <Image source={require('../assets/logo.png')} style={styles.logo} />

          <Text style={styles.title}>Welcome to iDanda</Text>
          <Text style={styles.subtitle}>Choose how you’d like to sign in</Text>

          {/* Google SSO */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => promptGoogle()}
            disabled={!gRequest || loading}
          >
            {loading && !gRequest ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.googleText}>Continue with Google</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>— OR —</Text>

          {/* Email & Password */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity onPress={animateAndLogin} disabled={loading}>
              <View style={styles.loginBtn}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>Log In</Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={styles.link}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#e9f0fc' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  logo:      { width: 100, height: 100, marginBottom: 16, borderRadius: 50, borderWidth: 2, borderColor: '#4C8BF5' },
  title:     { fontSize: 24, fontWeight: '700', color: '#333' },
  subtitle:  { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  googleBtn: { width: '100%', backgroundColor: '#DB4437', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  googleText:{ color: '#fff', fontSize: 16, fontWeight: '600' },
  orText:    { marginVertical: 12, color: '#666', fontSize: 14 },
  inputWrapper: { width: '100%', marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
  input:     { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: '#333' },
  loginBtn:  { width: '100%', backgroundColor: '#4C8BF5', borderRadius: 30, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  linksRow:  { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between', width: '100%' },
  link:      { color: '#4C8BF5', fontSize: 14, textDecorationLine: 'underline' },
});
