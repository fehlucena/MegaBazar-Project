import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Removido o escopo do Google Calendar para evitar a tela de "App não verificado"
// googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (token) {
      sessionStorage.setItem('google_access_token', token);
    }
    
    const user = result.user;
    
    // Check if user exists in db
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Voluntário',
        role: 'volunteer',
        createdAt: serverTimestamp()
      });
    }
    return token;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithoutGoogle = async () => {
  try {
    const result = await signInAnonymously(auth);
    const user = result.user;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: null,
        name: 'Voluntário Anônimo',
        role: 'volunteer',
        createdAt: serverTimestamp()
      });
    }
    return user;
  } catch (error) {
    console.error("Error signing in anonymously", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
