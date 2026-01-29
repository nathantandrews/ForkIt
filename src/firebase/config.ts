import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore`
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_APP_ID!,
};

// Prevent re-initialization during fast refresh
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth (React Native persistence)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Auth already initialized
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
