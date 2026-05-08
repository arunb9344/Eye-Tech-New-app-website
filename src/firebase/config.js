import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCulatllFqrC4DKb_641mAKttZu6iYPR1c",
  authDomain: "eye-tech-app.firebaseapp.com",
  projectId: "eye-tech-app",
  storageBucket: "eye-tech-app.firebasestorage.app",
  messagingSenderId: "521515928870",
  appId: "1:521515928870:web:2c06d4ffbfa87162b505e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
