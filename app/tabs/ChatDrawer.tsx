// app/(tabs)/ChatDrawer.tsx
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
  Dimensions,
} from 'react-native';
import { auth, db } from '../../services/firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

interface ChatDrawerProps {
  chatId: string;
  otherUserId: string;
  onClose: () => void;
}

export default function ChatDrawer({ chatId, otherUserId, onClose }: ChatDrawerProps) {
  const user = auth.currentUser!;
  const [otherName, setOtherName] = useState('…');
  const [messages, setMessages]   = useState<any[]>([]);
  const [text, setText]           = useState('');
  const flatRef = useRef<FlatList>(null);

  // 1) Sync chat doc with both participants
  useEffect(() => {
    const uids = chatId.split('_');
    const ref = doc(db, 'chats', chatId);
    setDoc(ref, { participants: uids, updatedAt: serverTimestamp() }, { merge: true });
  }, [chatId]);

  // 2) Lookup other user’s name
  useEffect(() => {
    getDoc(doc(db, 'users', otherUserId))
      .then(snap => {
        if (snap.exists()) {
          const { firstName, lastName } = snap.data();
          setOtherName(`${firstName} ${lastName}`);
        } else setOtherName('Unknown');
      })
      .catch(() => setOtherName('Unknown'));
  }, [otherUserId]);

  // 3) Listen for messages
  useEffect(() => {
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
    if (!text.trim()) return;
    const msgsRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(msgsRef, {
      text: text.trim(),
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'chats', chatId), { updatedAt: serverTimestamp() });
    setText('');
  };

  const { width, height } = Dimensions.get('window');
  const drawerW = Math.min(width * 0.9, 350);
  const drawerH = Math.min(height * 0.7, 500);

  return (
    <View style={[drawerStyles.overlay]}>
      <View style={[drawerStyles.drawer, { width: drawerW, height: drawerH }]}>
        {/* Header */}
        <View style={drawerStyles.headerBar}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={drawerStyles.headerTitle}>{otherName}</Text>
        </View>

        <KeyboardAvoidingView
          style={drawerStyles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={i => i.id}
            contentContainerStyle={drawerStyles.list}
            renderItem={({ item }) => {
              const mine = item.senderId === user.uid;
              return (
                <View style={[drawerStyles.bubble, mine ? drawerStyles.mine : drawerStyles.theirs]}>
                  <Text style={[drawerStyles.msgText, mine && { color: '#fff' }]}>
                    {item.text}
                  </Text>
                </View>
              );
            }}
          />

          <View style={drawerStyles.inputRow}>
            <TextInput
              style={drawerStyles.input}
              placeholder="Type a message…"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={drawerStyles.sendBtn} onPress={sendMessage}>
              <Text style={drawerStyles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    // backdrop:
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
  },
  drawer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  flex: { flex: 1 },
  list: { padding: 12, backgroundColor: '#f2f3f5', flexGrow: 1 },
  bubble: { marginVertical: 4, padding: 8, borderRadius: 8, maxWidth: '80%' },
  mine: { backgroundColor: '#4C8BF5', alignSelf: 'flex-end' },
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
    paddingHorizontal: 12,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#4C8BF5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600' },
});
