// app/tabs/participating.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ParticipatingScreen() {
  const router = useRouter();
  const user = auth.currentUser!;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('interestedUsers', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center' }}>You haven’t accepted any posts yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.category}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/tabs/interested/[postId]',
                params: { postId: item.id },
              })
            }
          >
            <Text style={styles.btnText}>View Participants</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#4C8BF5', marginBottom: 4 },
  desc: { fontSize: 14, color: '#333', marginBottom: 8 },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#4C8BF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: { color: '#fff', fontWeight: '600' },
});
