// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeVhhHzolYtWxJZy7rFXKXNxLDuZuNNqE",
  authDomain: "student-health-tracker-vn.firebaseapp.com",
  projectId: "student-health-tracker-vn",
  storageBucket: "student-health-tracker-vn.firebasestorage.app",
  messagingSenderId: "763614727097",
  appId: "1:763614727097:web:ee9dbe257e4067bada4468"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;