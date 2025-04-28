import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { showError } from '../utils/errorHandler';

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !address) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      Alert.alert('Signup Successful!', 'Please verify your email before logging in.');

      // ✅ Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        address,
        email,
        createdAt: new Date(),
      });

      router.replace('/'); // ✅ Redirect to login/landing after signup
    } catch (error) {
      showError(error, 'Signup Failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up for iDanda</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        onChangeText={setFirstName}
        value={firstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={setLastName}
        value={lastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        onChangeText={setAddress}
        value={address}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.link}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f6f7fb', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 50 },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 20 },
  input: { backgroundColor: '#fff', width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, borderColor: '#ddd', borderWidth: 1, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#4C8BF5', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12, marginTop: 10, shadowColor: '#4C8BF5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  link: { marginTop: 20, color: '#4C8BF5', fontSize: 16, textDecorationLine: 'underline' },
});
