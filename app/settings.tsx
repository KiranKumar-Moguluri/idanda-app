// app/settings.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { auth } from '../services/firebaseConfig';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser!;
  
  // --- Change Email State ---
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');

  // --- Change Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Helper to reauthenticate
  const reauth = async (password: string) => {
    const cred = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, cred);
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !currentPasswordForEmail) {
      return Alert.alert('Error', 'Please fill out both fields.');
    }
    try {
      await reauth(currentPasswordForEmail);
      await updateEmail(user, newEmail);
      Alert.alert('Success', 'Email updated.');
      setNewEmail('');
      setCurrentPasswordForEmail('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update email.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill out all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'New passwords do not match.');
    }
    try {
      await reauth(currentPassword);
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update password.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Account Settings</Text>

        {/* Change Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Email</Text>
          <TextInput
            style={styles.input}
            placeholder="New Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={currentPasswordForEmail}
            onChangeText={setCurrentPasswordForEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
            <Text style={styles.buttonText}>Update Email</Text>
          </TouchableOpacity>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7fb' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 20 },

  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#4C8BF5', marginBottom: 12 },

  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  button: {
    backgroundColor: '#4C8BF5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
