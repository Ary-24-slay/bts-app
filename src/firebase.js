// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA-ThFBK5yGlGDSTU1xNaU0lQ2jwCr98nc",
  authDomain: "gift-card-app-18f43.firebaseapp.com",
  projectId: "gift-card-app-18f43",
  storageBucket: "gift-card-app-18f43.firebasestorage.app",
  messagingSenderId: "411062681496",
  appId: "1:411062681496:web:9456078ee21c2aebddb5ed"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
