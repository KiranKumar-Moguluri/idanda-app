// app/tabs/_layout.tsx

import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

export default function TabLayout() {
  const router = useRouter();
  const path = usePathname();

  const [userName, setUserName] = useState<string>('Profile');

  useEffect(() => {
    // subscribe to auth changes
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setUserName('Profile');
        return;
      }

      // 1) first, see if auth.displayName is set
      if (user.displayName) {
        setUserName(user.displayName);
        return;
      }

      // 2) otherwise fall back to your Firestore profile doc
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const { firstName, lastName } = snap.data() as {
            firstName: string;
            lastName: string;
          };
          setUserName(`${firstName} ${lastName}`);
        } else {
          setUserName('Profile');
        }
      } catch {
        setUserName('Profile');
      }
    });

    return unsub;
  }, []);

  return (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/tabs/home')}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={path === '/tabs/home' ? '#4C8BF5' : '#555'}
          />
          <Text style={[styles.navText, path === '/tabs/home' && styles.activeText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/tabs/createPost')}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={path === '/tabs/createPost' ? '#4C8BF5' : '#555'}
          />
          <Text
            style={[
              styles.navText,
              path === '/tabs/createPost' && styles.activeText,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/tabs/profile')}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={path === '/tabs/profile' ? '#4C8BF5' : '#555'}
          />
          <Text
            style={[
              styles.navText,
              path === '/tabs/profile' && styles.activeText,
            ]}
          >
            {userName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/tabs/dashboard')}
        >
          <Ionicons
            name="speedometer-outline"
            size={24}
            color={path === '/tabs/dashboard' ? '#4C8BF5' : '#555'}
          />
          <Text
            style={[
              styles.navText,
              path === '/tabs/dashboard' && styles.activeText,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  activeText: {
    color: '#4C8BF5',
    fontWeight: 'bold',
  },
});
