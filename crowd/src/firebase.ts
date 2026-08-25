import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from 'firebase/auth'
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
let authReady: Promise<User> | null = null

export function ensureSignedIn(): Promise<User> {
  if (!FIREBASE_CONFIGURED) return Promise.reject(new Error('Firebase is not configured (missing VITE_ZC_* env vars).'))
  if (authReady) return authReady
  if (!auth) auth = getAuth(app)
  const a = auth
  authReady = new Promise((resolvePromise, reject) => {
    const unsub = onAuthStateChanged(
      a,
      (user) => {
        if (user) {
          unsub()
          resolvePromise(user)
        }
      },
      reject,
    )
    signInAnonymously(a).catch((err) => {
      unsub()
      reject(err)
    })
  })
  return authReady
}
