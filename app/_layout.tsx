import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      // wait one tick so Slot is mounted
      setTimeout(() => {
        if (user && user.emailVerified) {
          router.replace({ pathname: '/tabs/home' });
        } else {
          router.replace({ pathname: '/login' });
        }
      }, 0);
    });
    return unsub;
  }, []);

  return <Slot />;
}
