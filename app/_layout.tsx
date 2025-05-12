// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const [init, setInit] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (init) {
        // first time: just finish loading
        setInit(false);
      } else {
        // thereafter: redirect on login/logout
        if (user && user.emailVerified) {
          router.replace('/tabs/home');
        } else {
          router.replace('/login');
        }
      }
    });
    return unsub;
  }, [init, router]);

  if (init) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="large" color="#4C8BF5" />
      </View>
    );
  }

  return <Slot />;
}
