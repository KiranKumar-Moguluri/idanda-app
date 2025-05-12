// app/index.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.95, 540);

export default function Index() {
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  // 1) still loading?
  if (user === undefined) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4C8BF5" />
      </View>
    );
  }

  // 2) authenticated & verified → home
  if (user && user.emailVerified) {
    return <Redirect href="/tabs/home" />;
  }

  // 3) otherwise show landing page
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to iDanda</Text>
          <Text style={styles.subtitle}>
            Find Jobs. Post Tasks. Connect Easily.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Empowering people to earn and help each other.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: { flex: 1, backgroundColor: '#f6f7fb' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
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
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#4C8BF5',
    backgroundColor: '#fff',
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
    width: '100%',
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
    marginTop: 12,
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
