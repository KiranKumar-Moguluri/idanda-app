// services/userService.ts

import { auth, db, storage } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UserProfile {
  firstName: string;
  lastName:  string;
  phone?:     string;
  address?:   string;
  email:      string;
}

/**
 * After you createUserWithEmailAndPassword, call this to:
 *  • write first/last/phone/etc to Firestore under users/{uid}
 *  • set auth.currentUser.displayName to “First Last”
 */
export async function createUserProfile(
  uid: string,
  profile: UserProfile
): Promise<void> {
  await setDoc(doc(db, 'users', uid), profile);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: `${profile.firstName} ${profile.lastName}`,
    });
  }
}

/**
 * Fetch the entire profile document from Firestore (or null)
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Returns “First Last” or “Unknown”
 */
export async function getUserNameById(uid: string): Promise<string> {
  const profile = await getUserProfile(uid);
  if (profile) return `${profile.firstName} ${profile.lastName}`;
  if (auth.currentUser?.uid === uid && auth.currentUser.displayName) {
    return auth.currentUser.displayName;
  }
  return 'Unknown';
}

/**
 * NEW ➞ Returns the user’s email (from Firestore user doc or Auth state)
 */
export async function getUserEmailById(uid: string): Promise<string> {
  const profile = await getUserProfile(uid);
  if (profile?.email) return profile.email;
  if (auth.currentUser?.uid === uid && auth.currentUser.email) {
    return auth.currentUser.email;
  }
  return 'Unknown';
}

/**
 * Uploads a local image URI to Firebase Storage and returns its download URL
 */
export async function uploadProfileImageAsync(fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const blob     = await response.blob();

  const uid = auth.currentUser!.uid;
  const path = `profile_pictures/${uid}/${Date.now()}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

/**
 * Save the profile picture URL both in Firestore (users/{uid}.photoURL)
 * and in the Firebase Auth user record (auth.currentUser.photoURL)
 */
export async function saveUserProfilePicture(url: string) {
  const uid = auth.currentUser!.uid;
  await updateDoc(doc(db, 'users', uid), { photoURL: url });
  await updateProfile(auth.currentUser!, { photoURL: url });
}
