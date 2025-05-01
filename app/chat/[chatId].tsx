import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Redirect, useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { chatId, postId } =
    useLocalSearchParams<{ chatId: string; postId: string }>();
  const router = useRouter();
  const user = auth.currentUser;
  if (!user) return <Redirect href="/login" />;

  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherName, setOtherName]     = useState('…');
  const [messages, setMessages]       = useState<any[]>([]);
  const [text, setText]               = useState('');
  const flatRef = useRef<FlatList>(null);

  // 1) Ensure chat doc exists & set both participants
  useEffect(() => {
    if (!chatId) return;
    const uids = chatId.split('_');
    const other = uids.find(uid => uid !== user.uid) || null;
    setOtherUserId(other);

    const chatRef = doc(db, 'chats', chatId);
    setDoc(
      chatRef,
      {
        postId,
        participants: uids,
        updatedAt: serverTimestamp(),
      },
      { merge: true } // merge so we don’t overwrite messages
    );
  }, [chatId]);

  // 2) Lookup the other user’s name
  useEffect(() => {
    if (!otherUserId) return;
    getDoc(doc(db, 'users', otherUserId))
      .then(snap => {
        if (snap.exists()) {
          const { firstName, lastName } = snap.data();
          setOtherName(`${firstName} ${lastName}`);
        } else {
          setOtherName('Unknown');
        }
      })
      .catch(() => setOtherName('Unknown'));
  }, [otherUserId]);

  // 3) Subscribe to messages
  useEffect(() => {
    if (!chatId) return;
    const msgsRef = collection(db, 'chats', chatId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const arr: any[] = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setMessages(arr);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
    });
    return unsub;
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;
    const msgsRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(msgsRef, {
      text: text.trim(),
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'chats', chatId), {
      updatedAt: serverTimestamp(),
    });
    setText('');
  };

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherName}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mine = item.senderId === user.uid;
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.msgText, mine && { color: '#fff' }]}>
                  {item.text}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: '#f2f3f5' },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },

  list: { padding: 12 },
  bubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  mine:   { backgroundColor: '#4C8BF5', alignSelf: 'flex-end' },
  theirs: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  msgText: { color: '#333' },

  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#4C8BF5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600' },
});
