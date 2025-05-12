// InterestedUsersScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getUserNameById } from '../../services/userService';

export default function InterestedUsersScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const currentUser = auth.currentUser!;
  const [interested, setInterested] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);

  // Listen post document
  useEffect(() => {
    const ref = doc(db, 'posts', postId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const d = snap.data();
        setInterested(d.interestedUsers || []);
        setConfirmed(d.confirmedUserIds || []);
        setLoading(false);
      }
    });
    return unsub;
  }, [postId]);

  // Fetch display names
  useEffect(() => {
    interested.forEach(uid => {
      if (!names[uid]) {
        getUserNameById(uid).then(n =>
          setNames(prev => ({ ...prev, [uid]: n }))
        );
      }
    });
  }, [interested]);

  const confirmUser = async (uid: string) => {
    try {
      const ref = doc(db, 'posts', postId);
      const snap = await getDoc(ref);
      const curr = snap.data()?.confirmedUserIds || [];
      if (!curr.includes(uid)) {
        await updateDoc(ref, { confirmedUserIds: [...curr, uid] });
      }
    } catch {
      Alert.alert('Error', 'Could not confirm user.');
    }
  };

  const startChat = (uid: string) => {
    const chatId = [postId, currentUser.uid, uid].sort().join('_');
    router.push({ pathname: '/chat/[chatId]', params: { chatId, postId } });
  };

  if (loading) return <ActivityIndicator style={{marginTop:50}} />;

  return (
    <FlatList
      data={interested}
      keyExtractor={u => u}
      contentContainerStyle={styles.container}
      renderItem={({ item: uid }) => {
        const isConfirmed = confirmed.includes(uid);
        const label = names[uid] || '…';
        return (
          <View style={styles.row}>
            <Text style={styles.name}>{label}</Text>
            <TouchableOpacity
              style={isConfirmed ? styles.chatBtn : styles.confirmBtn}
              onPress={() => isConfirmed ? startChat(uid) : confirmUser(uid)}
            >
              <Text style={styles.btnText}>
                {isConfirmed ? 'Chat' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={styles.empty}>No one’s interested yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  row:       { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12, borderBottomWidth:1, borderColor:'#eee' },
  name:      { fontSize:16, color:'#333' },
  confirmBtn:{ backgroundColor:'#4CAF50', padding:8, borderRadius:6 },
  chatBtn:   { backgroundColor:'#4C8BF5', padding:8, borderRadius:6 },
  btnText:   { color:'#fff', fontWeight:'600' },
  empty:     { textAlign:'center', color:'#666', marginTop:50 },
});
