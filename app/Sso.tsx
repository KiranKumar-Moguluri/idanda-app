import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// Required for Expo WebBrowser
WebBrowser.maybeCompleteAuthSession();

export default function SsoScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '229236383058-4d6b1iev53qhdh0df23usufebvc9ldqt.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@kirankumarm131998/idanda-app',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { idToken } = response.authentication;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .then(() => {
          console.log('✅ Google Sign-In successful');
          router.replace('/tabs/home');
        })
        .catch((err) => {
          console.error('❌ Google Sign-In failed:', err);
        });
    }
  }, [response]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to iDanda</Text>
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Text style={styles.btnText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7fb' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  googleBtn: {
    backgroundColor: '#DB4437',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600' },
});
