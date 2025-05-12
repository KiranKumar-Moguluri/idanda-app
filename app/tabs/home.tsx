// app/(tabs)/home.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { showError } from '../../utils/errorHandler';
import ChatDrawer from './ChatDrawer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.9, 600);
const CARD_MIN_HEIGHT = 180;

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = auth.currentUser;
  if (!currentUser) return <Redirect href="/login" />;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});

  // Chat drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeOtherId, setActiveOtherId] = useState<string | null>(null);

  // Load posts
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const data: any[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Fetch creator names
  useEffect(() => {
    posts.forEach(post => {
      const uid = post.creatorId;
      if (uid && !creatorNames[uid]) {
        getDoc(doc(db, 'users', uid))
          .then(snap => {
            if (snap.exists()) {
              const { firstName, lastName } = snap.data() as any;
              setCreatorNames(prev => ({
                ...prev,
                [uid]: `${firstName} ${lastName}`
              }));
            } else {
              setCreatorNames(prev => ({ ...prev, [uid]: 'Unknown' }));
            }
          })
          .catch(() =>
            setCreatorNames(prev => ({ ...prev, [uid]: 'Unknown' }))
          );
      }
    });
  }, [posts]);

  // Show interest
  const handleAccept = async (postId: string, interested: string[]) => {
    if (interested.includes(currentUser.uid)) return;
    try {
      await updateDoc(doc(db, 'posts', postId), {
        interestedUsers: arrayUnion(currentUser.uid),
      });
    } catch (e) {
      showError(e, 'Accept Failed');
    }
  };

  // Human‑friendly “time ago”
  const formatTimeAgo = (ts?: Timestamp | null) => {
    if (!ts?.seconds) return 'Just now';
    const diff = Timestamp.now().seconds - ts.seconds;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Open chat drawer
  const openChat = (otherId: string) => {
    const chatId = [currentUser.uid, otherId].sort().join('_');
    setActiveChatId(chatId);
    setActiveOtherId(otherId);
    setDrawerVisible(true);
  };

  const renderPost = ({ item }: { item: any }) => {
    const isCreator = currentUser.uid === item.creatorId;
    const already = item.interestedUsers?.includes(currentUser.uid);
    const name = creatorNames[item.creatorId] || 'Loading...';

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={40} color="#777" />
          <View style={styles.headerText}>
            <Text style={styles.username}>{name}</Text>
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>

        {/* Body */}
        <Text
          style={styles.bodyText}
          numberOfLines={5}
          ellipsizeMode="tail"
        >
          {item.description}
        </Text>

        {/* Footer: Accept / Interested */}
        <View style={styles.footer}>
          {isCreator ? (
            <Text style={styles.count}>
              {item.interestedUsers?.length || 0} interested
            </Text>
          ) : (
            <TouchableOpacity
              style={[styles.button, already && styles.buttonDisabled]}
              disabled={already}
              onPress={() =>
                handleAccept(item.id, item.interestedUsers || [])
              }
            >
              <Ionicons
                name={already ? 'checkmark-circle' : 'heart-outline'}
                size={20}
                color={already ? '#4CAF50' : '#555'}
              />
              <Text
                style={[
                  styles.buttonText,
                  already && styles.buttonTextDisabled,
                ]}
              >
                {already ? 'Accepted' : 'Accept'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Message button under “Accepted” */}
        {!isCreator && already && (
          <View style={styles.messageRow}>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => openChat(item.creatorId)}
            >
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4C8BF5" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          ListEmptyComponent={<Text style={styles.empty}>No posts yet.</Text>}
        />
      )}

      {drawerVisible && activeChatId && activeOtherId && (
        <ChatDrawer
          chatId={activeChatId}
          otherUserId={activeOtherId}
          onClose={() => setDrawerVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f5' },
  list: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' },

  card: {
    width: CARD_WIDTH,
    minHeight: CARD_MIN_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },

  header: { flexDirection: 'row', marginBottom: 12 },
  headerText: { marginLeft: 12, justifyContent: 'center' },
  username: { fontSize: 16, fontWeight: '600', color: '#333' },
  time: { fontSize: 12, color: '#777', marginTop: 4 },

  bodyText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  button: { flexDirection: 'row', alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { marginLeft: 6, color: '#555', fontSize: 14 },
  buttonTextDisabled: { color: '#4CAF50' },

  count: { fontSize: 12, color: '#777' },

  messageRow: {
    marginTop: 8,
    paddingHorizontal: 16,   // match card padding
    alignItems: 'flex-start',
  },
  messageButton: {
    backgroundColor: '#4C8BF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  messageText: {
    color: '#fff',
    fontWeight: '600',
  },
});
