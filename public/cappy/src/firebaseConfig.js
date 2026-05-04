import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Added Firestore
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDnrREAXP543QiXEVh-I3DMk82BeJr1kkE",
  authDomain: "cappy-eded6.firebaseapp.com",
  projectId: "cappy-eded6",
  storageBucket: "cappy-eded6.appspot.com",
  messagingSenderId: "153091311721",
  appId: "1:153091311721:web:4fac10cfdf76b9e218baf8",
  measurementId: "G-8N9NNEDR7E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export the database instance
export const analytics = getAnalytics(app);
