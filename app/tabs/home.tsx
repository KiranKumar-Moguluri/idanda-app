import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig'; // ✅ Update this path
import { collection, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot } from 'firebase/firestore';
import { showError } from '../../utils/errorHandler';
import { getUserEmailById } from '../../services/userService'; // ✅ Update this path

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingInterested, setLoadingInterested] = useState<string | null>(null);
  const [interestedEmails, setInterestedEmails] = useState<{ [key: string]: string[] }>({});
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: any[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    });
    return unsubscribe;
  }, []);

  const handleAccept = async (postId: string, interestedUserIds: string[]) => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      if (interestedUserIds?.includes(currentUser.uid)) {
        Alert.alert('Already Accepted', 'You have already shown interest in this post.');
        return;
      }

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        interestedUsers: arrayUnion(currentUser.uid),
      });

      Alert.alert('Success', 'You have shown interest in this post!');
    } catch (error) {
      showError(error, 'Failed to Accept Post');
    }
  };

  const fetchInterestedUserEmails = async (postId: string, userIds: string[]) => {
    setLoadingInterested(postId);
    try {
      const emails = await Promise.all(userIds.map((uid) => getUserEmailById(uid)));
      setInterestedEmails((prev) => ({ ...prev, [postId]: emails }));
    } catch (error) {
      showError(error, 'Failed to fetch interested users.');
    } finally {
      setLoadingInterested(null);
    }
  };

  const renderPost = ({ item }: { item: any }) => {
    const isCreator = currentUser?.uid === item.creatorId;
    const alreadyInterested = item.interestedUsers?.includes(currentUser?.uid);

    return (
      <View style={styles.postCard}>
        <Text style={styles.categoryTag}>{item.category}</Text>
        <Text style={styles.postText}>{item.description}</Text>

        {isCreator ? (
          <>
            <Text style={styles.interestedCount}>
              Interested Users: {item.interestedUsers ? item.interestedUsers.length : 0}
            </Text>

            {item.interestedUsers?.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.viewInterestedButton}
                  onPress={() => fetchInterestedUserEmails(item.id, item.interestedUsers)}
                >
                  <Text style={styles.viewInterestedText}>View Interested Users</Text>
                </TouchableOpacity>

                {loadingInterested === item.id ? (
                  <ActivityIndicator size="small" color="#4C8BF5" style={{ marginTop: 10 }} />
                ) : (
                  interestedEmails[item.id]?.length > 0 && (
                    <View style={styles.interestedList}>
                      {interestedEmails[item.id].map((email, index) => (
                        <Text key={index} style={styles.interestedUserEmail}>
                          • {email}
                        </Text>
                      ))}
                    </View>
                  )
                )}
              </>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={[styles.acceptButton, alreadyInterested && styles.disabledButton]}
            onPress={() => handleAccept(item.id, item.interestedUsers || [])}
            disabled={alreadyInterested}
          >
            <Text style={styles.acceptButtonText}>
              {alreadyInterested ? 'Accepted' : 'Accept'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iDanda Jobs & Tasks</Text>

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/createPost')}>
        <Text style={styles.createButtonText}>+ Create New Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListEmptyComponent={<Text style={styles.noPosts}>No posts yet. Be the first to create one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  createButton: { backgroundColor: '#4C8BF5', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  createButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  postCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderColor: '#ddd', borderWidth: 1 },
  categoryTag: { color: '#4C8BF5', fontWeight: '700', fontSize: 14, marginBottom: 5 },
  postText: { fontSize: 16, color: '#333', marginBottom: 10 },
  acceptButton: { backgroundColor: '#4C8BF5', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontWeight: '600' },
  disabledButton: { backgroundColor: '#ccc' },
  interestedCount: { color: '#555', marginTop: 5 },
  viewInterestedButton: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderColor: '#4C8BF5', borderWidth: 1, alignItems: 'center' },
  viewInterestedText: { color: '#4C8BF5', fontWeight: '600' },
  interestedList: { marginTop: 10 },
  interestedUserEmail: { color: '#555', fontSize: 14, marginBottom: 4 },
  noPosts: { textAlign: 'center', color: '#999', marginTop: 20 },
});
