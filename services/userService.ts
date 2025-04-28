// services/userService.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const getUserEmailById = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.email || 'No Email Found';
    }
    return 'Unknown User';
  } catch (error) {
    return 'Error Fetching User';
  }
};
