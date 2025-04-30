// /app/(tabs)/createPost.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '../../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Extract the exact union of valid Ionicons names:
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const categories: { key: string; icon: IoniconsName }[] = [
  { key: 'Ride', icon: 'car-outline' },
  { key: 'Home', icon: 'home-outline' },
  { key: 'Mechanical', icon: 'construct-outline' },
  { key: 'Technical', icon: 'settings-outline' },
  { key: 'IT', icon: 'laptop-outline' },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      Alert.alert('Missing Fields', 'Please select a category and enter a description.');
      return;
    }
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      await addDoc(collection(db, 'posts'), {
        category,
        description: description.trim(),
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        status: 'Active',
        interestedUsers: [],
      });

      Alert.alert('Posted!', 'Your task has been created.');
      router.replace({ pathname: '/tabs/home' });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Create a Task</Text>

          <Text style={styles.label}>Select Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.categoryItem,
                  category === c.key && styles.categoryItemActive,
                ]}
                onPress={() => setCategory(c.key)}
              >
                <Ionicons
                  name={c.icon}
                  size={24}
                  color={category === c.key ? '#fff' : '#4C8BF5'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === c.key && styles.categoryTextActive,
                  ]}
                >
                  {c.key}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 20 }]}>What do you need done?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your task..."
            multiline
            numberOfLines={6}
            onChangeText={setDescription}
            value={description}
            editable={!submitting}
          />

          <TouchableOpacity
            style={styles.submitWrapper}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#4C8BF5', '#6AC8F5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                {submitting ? 'Posting...' : 'Post Task'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7fb' },
  flex: { flex: 1 },
  container: { padding: 20 },
  header: { fontSize: 26, fontWeight: '700', color: '#333', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10 },
  categoryRow: { paddingBottom: 10 },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4C8BF5',
    width: 80,
  },
  categoryItemActive: {
    backgroundColor: '#4C8BF5',
  },
  categoryText: { marginTop: 6, fontSize: 14, color: '#4C8BF5' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
  },
  submitWrapper: { marginTop: 30 },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
