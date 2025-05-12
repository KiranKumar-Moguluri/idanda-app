// app/chat/[chatId].tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const router = useRouter();
  const { chatId, postId } = useLocalSearchParams<{ chatId: string; postId: string }>();
  const currentUser = auth.currentUser!;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // subscribe to messages
  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      // scroll to bottom when new messages arrive
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
  }, [chatId]);

  // send a message (only if confirmed)
  const handleSend = async () => {
    if (!text.trim()) return;
    // check confirmation from post
    const postSnap = await getDoc(doc(db, 'posts', postId));
    const confirmed: string[] = postSnap.data()?.confirmedUserIds || [];
    if (!confirmed.includes(currentUser.uid)) {
      return alert('Waiting for confirmation from the post owner.');
    }
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: currentUser.uid,
      text: text.trim(),
      createdAt: Timestamp.now(),
    });
    setText('');
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.senderId === currentUser.uid;
    const containerStyle = isMe ? styles.bubbleRight : styles.bubbleLeft;
    const textStyle = isMe ? styles.textRight : styles.textLeft;
    const time = item.createdAt
      ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <View style={[styles.bubbleContainer, isMe && { justifyContent: 'flex-end' }]}>
        <View style={[styles.bubble, containerStyle]}>
          <Text style={textStyle}>{item.text}</Text>
          <Text style={styles.timestamp}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      {/* MESSAGE LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT FOOTER */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write a message…"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Ionicons name="send" size={22} color="#4C8BF5" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f3f5' },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  closeBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  messageList: { padding: 12, paddingBottom: 0 },

  bubbleContainer: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: '#4C8BF5',
    borderTopRightRadius: 0,
  },
  textLeft: { color: '#333', fontSize: 14 },
  textRight: { color: '#fff', fontSize: 14 },
  timestamp: {
    marginTop: 4,
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 14,
    marginRight: 8,
  },
  sendBtn: {
    padding: 6,
  },
});
