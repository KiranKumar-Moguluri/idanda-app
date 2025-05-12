// app/tabs/profile.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import {
  uploadProfileImageAsync,
  saveUserProfilePicture,
  getUserProfile,
  UserProfile,
} from '../../services/userService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser!;
  const [uploading, setUploading] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [participateCount, setParticipateCount] = useState(0);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Guard until auth is loaded
  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4C8BF5" />
      </View>
    );
  }

  // Subscribe to my posts + counts
  useEffect(() => {
    const q1 = query(collection(db, 'posts'), where('creatorId', '==', user.uid));
    const unsub1 = onSnapshot(q1, snap => {
      setMyPosts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      setCreatedCount(snap.size);
    });
    const q2 = query(
      collection(db, 'posts'),
      where('interestedUsers', 'array-contains', user.uid)
    );
    const unsub2 = onSnapshot(q2, snap => setParticipateCount(snap.size));
    return () => { unsub1(); unsub2(); };
  }, [user.uid]);

  // Load full user profile
  useEffect(() => {
    getUserProfile(user.uid)
      .then(p => setProfile(p))
      .catch(() => setProfile(null));
  }, [user.uid]);

  // Avatar picker
  const pickAndUpload = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission required', 'Allow photo access to update your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled) return;
    setUploading(true);
    try {
      const url = await uploadProfileImageAsync(result.assets[0].uri);
      await saveUserProfilePicture(url);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  // Logout handler
  const handleLogout = useCallback(() => {
    const doLogout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (e: any) {
        Alert.alert('Logout failed', e.message);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Sign Out\n\nAre you sure you want to sign out?')) {
        doLogout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: doLogout },
        ],
        { cancelable: true }
      );
    }
  }, [router]);

  // Delete post with debug & confirmation
  const handleDeletePost = async (postId: string) => {
    // 1) Ask for confirmation
    let ok = false;

    if (Platform.OS === 'web') {
      ok = window.confirm(
        'Delete Post\n\nAre you sure you want to delete this post? This cannot be undone.'
      );
    } else {
      // on native, show Alert.alert
      ok = await new Promise<boolean>(resolve => {
        Alert.alert(
          'Delete Post',
          'Are you sure you want to delete this post? This cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true }
        );
      });
    }

    if (!ok) {
      console.log('User cancelled delete');
      return;
    }

    console.log(`Deleting post ${postId}…`);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      console.log(`Post ${postId} deleted.`);
      if (Platform.OS === 'web') {
        window.alert('Deleted\n\nYour post has been removed.');
      } else {
        Alert.alert('Deleted', 'Your post has been removed.');
      }
    } catch (e: any) {
      console.error('Delete error:', e);
      Alert.alert('Delete failed', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <TouchableOpacity onPress={pickAndUpload} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator style={styles.avatar} color="#4C8BF5" />
          ) : (
            <Image
              source={
                user.photoURL
                  ? { uri: user.photoURL }
                  : require('../../assets/avatar-placeholder.png')
              }
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>

        {/* Name & Email */}
        <Text style={styles.name}>
          {profile
            ? `${profile.firstName} ${profile.lastName}`
            : user.email!.split('@')[0]
          }
        </Text>
        <Text style={styles.email}>{user.email}</Text>

        {/* User Info dropdown */}
        <TouchableOpacity
          style={styles.infoToggle}
          onPress={() => setInfoOpen(v => !v)}
        >
          <Ionicons
            name={infoOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={20}
            color="#555"
          />
          <Text style={styles.infoToggleText}>User Info</Text>
        </TouchableOpacity>
        {infoOpen && profile && (
          <View style={styles.infoBox}>
            <Text><Text style={styles.infoLabel}>First Name:</Text> {profile.firstName}</Text>
            <Text><Text style={styles.infoLabel}>Last Name:</Text> {profile.lastName}</Text>
            <Text><Text style={styles.infoLabel}>Phone:</Text> {profile.phone || '—'}</Text>
            <Text><Text style={styles.infoLabel}>Address:</Text> {profile.address || '—'}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCount}>{createdCount}</Text>
            <Text style={styles.statLabel}>My Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCount}>{participateCount}</Text>
            <Text style={styles.statLabel}>Participating</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={[styles.menuText, { color: '#d00' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* My Posts with Delete */}
        <Text style={styles.sectionTitle}>My Posts</Text>
        {myPosts.length === 0 ? (
          <Text style={styles.emptyText}>You haven’t posted anything yet.</Text>
        ) : (
          <FlatList
            data={myPosts}
            keyExtractor={p => p.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Text style={styles.postCategory}>{item.category}</Text>
                  <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#d00" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.postText}>{item.description}</Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { alignItems: 'center', padding: 20 },

  avatar: {
    width: 100, height: 100, borderRadius: 50,
    marginBottom: 12, backgroundColor: '#eef',
  },
  name: { fontSize: 20, fontWeight: '700', color: '#333' },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },

  infoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoToggleText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
  },
  infoLabel: { fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statCount: { fontSize: 24, fontWeight: '700', color: '#4C8BF5' },
  statLabel: { fontSize: 14, color: '#555', marginTop: 4 },

  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuText: { fontSize: 16, color: '#333' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postCategory: { color: '#4C8BF5', fontWeight: '700' },
  postText: { fontSize: 15, color: '#333', marginTop: 4 },
});
