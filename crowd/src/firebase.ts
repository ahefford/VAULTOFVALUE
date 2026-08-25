import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_ZC_API_KEY,
  authDomain: import.meta.env.VITE_ZC_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_ZC_PROJECT_ID,
  storageBucket: import.meta.env.VITE_ZC_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_ZC_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_ZC_APP_ID,
}

export const EVENT_ID = import.meta.env.VITE_ZC_EVENT_ID || 'vault26'
export const FIREBASE_CONFIGURED = Boolean(firebaseConfig.apiKey && firebaseConfig.appId)

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Auth is constructed lazily, only once we know real config is present.
// Firebase Auth makes an eager network call on getAuth() (to resolve its
// config) that throws auth/invalid-api-key with a blank apiKey — touching
// it at all when unconfigured crashes the app before the "set VITE_ZC_*"
// error screen can even render.
let auth: Auth | null = null

function requireAuth(): Auth {
  if (!FIREBASE_CONFIGURED) throw new Error('Firebase is not configured (missing VITE_ZC_* env vars).')
  if (!auth) auth = getAuth(app)
  return auth
}

export function watchAuth(onChange: (user: User | null) => void): () => void {
  if (!FIREBASE_CONFIGURED) {
    onChange(null)
    return () => {}
  }
  return onAuthStateChanged(requireAuth(), onChange)
}

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(requireAuth(), email, password)
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password)
}

export function signOutUser() {
  return signOut(requireAuth())
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(requireAuth(), email)
}
