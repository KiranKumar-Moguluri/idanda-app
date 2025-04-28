// services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCnC_hqZHs1zmllOtJr0cDM7JMqGkXRmJo',
  authDomain: 'idanda-41983.firebaseapp.com',
  projectId: 'idanda-41983',
  storageBucket: 'idanda-41983.firebasestorage.app',
  messagingSenderId: '229236383058',
  appId: '1:229236383058:web:6376cc9a38ec37d22b6e8b',
  measurementId: 'G-36JKZG3SDB',
};

// ✅ Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// ✅ Auth and Firestore
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ✅ No Analytics needed on mobile
export { firebaseApp, auth, db };
