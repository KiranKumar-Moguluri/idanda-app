// app/tabs/interested/[postId].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { getUserNameById } from '../../../services/userService';

export default function InterestedUsersScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uids, setUids] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!postId) {
      Alert.alert('Error', 'No post ID provided.');
      router.back();
      return;
    }
    const ref = doc(db, 'posts', postId);
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) {
        Alert.alert('Error', 'Post not found.');
        router.back();
        return;
      }
      const data = snap.data() as any;
      setUids(data.interestedUsers || []);
      setLoading(false);
    });
    return () => unsub();
  }, [postId]);

  useEffect(() => {
    uids.forEach(uid => {
      if (!names[uid]) {
        getUserNameById(uid).then(name =>
          setNames(prev => ({ ...prev, [uid]: name }))
        );
      }
    });
  }, [uids]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4C8BF5" />
      </View>
    );
  }

  if (uids.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No one has expressed interest yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={uids}
      keyExtractor={uid => uid}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>{names[item] || '…'}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty:     { color: '#666' },
  row:       { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  name:      { fontSize: 16, color: '#333' },
});
