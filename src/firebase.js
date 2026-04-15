// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Aapki Firebase Keys
const firebaseConfig = {
  apiKey: "AIzaSyDQRioNwq7-DAycsXVCDIFpwBcPD2nrSYE",
  authDomain: "rfm-wedding.firebaseapp.com",
  projectId: "rfm-wedding",
  storageBucket: "rfm-wedding.firebasestorage.app",
  messagingSenderId: "900786904310",
  appId: "1:900786904310:web:58e18a0db2be03baf0a0d7"
};

// Firebase ko chalu karna
const app = initializeApp(firebaseConfig);

// Tools jo hum use karenge (Login, Database, aur Image Storage)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);