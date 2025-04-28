import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { showError } from '../utils/errorHandler';

const categories = ['Home', 'Ride', 'Mechanical', 'Technical', 'IT/Software Support'];

export default function CreatePostScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleCreatePost = async () => {
    if (!category || !description.trim()) {
      Alert.alert('Error', 'Please select a category and enter the requirement.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      await addDoc(collection(db, 'posts'), {
        category,
        description,
        creatorId: currentUser.uid,
        creatorEmail: currentUser.email,
        createdAt: serverTimestamp(),
        interestedUsers: [],
      });

      Alert.alert('Success', 'Your post has been created!');
      router.replace('/tabs/home'); // ✅ After posting, go back to home (post list)
    } catch (error) {
      showError(error, 'Post Creation Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Post</Text>

      <Text style={styles.label}>Select Category:</Text>
      {categories.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.categoryButton, category === item && styles.selectedCategory]}
          onPress={() => setCategory(item)}
        >
          <Text style={styles.categoryText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Requirement / Task Description:</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe your need..."
        multiline
        numberOfLines={4}
        onChangeText={setDescription}
        value={description}
      />

      <TouchableOpacity style={styles.postButton} onPress={handleCreatePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, color: '#555', marginTop: 15 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderColor: '#ddd', borderWidth: 1, padding: 12, marginTop: 10, marginBottom: 20 },
  categoryButton: { padding: 12, borderRadius: 10, borderColor: '#4C8BF5', borderWidth: 1, marginTop: 10 },
  selectedCategory: { backgroundColor: '#4C8BF5' },
  categoryText: { color: '#333', textAlign: 'center' },
  postButton: { backgroundColor: '#4C8BF5', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  postButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
