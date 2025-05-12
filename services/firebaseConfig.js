// services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';
import { getStorage }     from 'firebase/storage';

// 🔑 Your Firebase web config
const firebaseConfig = {
  apiKey: "AIzaSyCnC_hqZHs1zmllOtJr0cDM7JMqGkXRmJo",
  authDomain: "idanda-41983.firebaseapp.com",
  projectId: "idanda-41983",
  storageBucket: "idanda-41983.appspot.com",   // make sure this matches your console
  messagingSenderId: "229236383058",
  appId: "1:229236383058:web:6376cc9a38ec37d22b6e8b",
  measurementId: "G-36JKZG3SDB"
};

// 🔧 Initialize Firebase App only once
const app = initializeApp(firebaseConfig);

// ✅ Export initialized services
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
