
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnrREAXP543QiXEVh-I3DMk82BeJr1kkE",
  authDomain: "cappy-eded6.firebaseapp.com",
  projectId: "cappy-eded6",
  storageBucket: "cappy-eded6.appspot.com",
  messagingSenderId: "153091311721",
  appId: "1:153091311721:web:4fac10cfdf76b9e218baf8",
  measurementId: "G-8N9NNEDR7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
