import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { auth, db } from '../../services/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { showError } from '../../utils/errorHandler';

export default function ProfileScreen() {
  const router = useRouter();
  const currentUser = auth.currentUser;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'posts'), where('creatorId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: any[] = [];
      snapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleStatusChange = async (postId: string, newStatus: string, createdAt: Timestamp) => {
    const now = Timestamp.now();
    const postAgeInSeconds = now.seconds - createdAt.seconds;
    const twoHoursInSeconds = 2 * 60 * 60;

    if (newStatus === 'Active' && postAgeInSeconds > twoHoursInSeconds) {
      Alert.alert('Cannot Change to Active', 'Post is older than 2 hours. Cannot set to Active.');
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { status: newStatus });
    } catch (error) {
      showError(error, 'Failed to update status');
    }
  };

  const handleLogout =  async() => {
    console.log("logout initiated from the user");
    
    try {
      await auth.signOut();
      router.replace({ pathname: '/login' });
    } catch (error) {
      showError(error, 'Logout Failed');
    }
    // Alert.alert(
    //   'Confirm Logout',
    //   'Are you sure you want to logout?',
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     {
    //       text: 'Logout',
    //       style: 'destructive',
    //       onPress: async () => {
    //         try {
    //           await auth.signOut();
    //           // wait a tick so TabLayout is mounted
    //           setTimeout(() => {
    //             router.replace({ pathname: '/login' });
    //           }, 0);
    //         } catch (error) {
    //           showError(error, 'Logout Failed');
    //         }
    //       },
    //     },
    //   ],
    //   { cancelable: true }
    // );
  };
    

  const filteredPosts = posts.filter((post) =>
    filter === 'All' ? true : post.status === filter
  );

  const formatTimeAgo = (createdAt: Timestamp) => {
    const now = Timestamp.now();
    const diffSeconds = now.seconds - createdAt.seconds;

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#4CAF50'; // Green
      case 'Completed':
        return '#FF9800'; // Orange
      default:
        return '#4C8BF5'; // Default Blue
    }
  };

  const renderPost = ({ item }: { item: any }) => {
    const createdAt = item.createdAt;
    const postAgeInSeconds = Timestamp.now().seconds - createdAt.seconds;
    const isWithinTwoHours = postAgeInSeconds < 2 * 60 * 60;
    const isNew = postAgeInSeconds < 3600; // Less than 1 hour = NEW
    const statusOptions = ['Active', 'Completed'];

    return (
      <View style={styles.postCard}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.timestamp}>Posted: {formatTimeAgo(item.createdAt)}</Text>

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBadgeColor(item.status || 'Active') },
            ]}
          >
            <Text style={styles.statusBadgeText}>{item.status || 'Active'}</Text>
          </View>

          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        <View style={styles.statusButtons}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.activeStatusButton,
              ]}
              onPress={() => handleStatusChange(item.id, status, item.createdAt)}
              disabled={status === 'Active' && !isWithinTwoHours}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  item.status === status && styles.activeStatusText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4C8BF5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Your Profile</Text>
      <Text style={styles.subtitle}>You have posted {posts.length} tasks</Text>

      <View style={styles.filterRow}>
        {['All', 'Active', 'Completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(status as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.activeFilterText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListEmptyComponent={<Text style={styles.noPosts}>No posts found.</Text>}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: 20 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, borderColor: '#4C8BF5', borderWidth: 1 },
  activeFilterButton: { backgroundColor: '#4C8BF5' },
  filterText: { color: '#4C8BF5', fontWeight: '600' },
  activeFilterText: { color: '#fff' },
  postCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderColor: '#ddd', borderWidth: 1 },
  category: { color: '#4C8BF5', fontWeight: '700', fontSize: 16, marginBottom: 5 },
  description: { fontSize: 16, color: '#333', marginBottom: 5 },
  timestamp: { fontSize: 12, color: '#888', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  statusBadgeText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  newBadge: { backgroundColor: '#E91E63', borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10, marginLeft: 10 },
  newBadgeText: { color: '#fff', fontWeight: '700', fontSize: 10 },
  statusButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  statusButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderColor: '#4C8BF5', borderWidth: 1 },
  activeStatusButton: { backgroundColor: '#4C8BF5' },
  statusButtonText: { color: '#4C8BF5', fontWeight: '600' },
  activeStatusText: { color: '#fff' },
  noPosts: { textAlign: 'center', color: '#999', marginTop: 50 },
  logoutButton: { marginTop: 20, backgroundColor: '#ff4d4d', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
