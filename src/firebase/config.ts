import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration — values come from environment variables at build time.
// For local development, create a .env file based on .env.example.
// Hardcoded fallbacks are kept so the app still works without a .env file.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDeVhhHzolYtWxJZy7rFXKXNxLDuZuNNqE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "student-health-tracker-vn.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "student-health-tracker-vn",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "student-health-tracker-vn.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "763614727097",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:763614727097:web:ee9dbe257e4067bada4468",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-6GN173F1XS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;