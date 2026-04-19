// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // EKLENDİ
import { getFirestore } from "firebase/firestore"; // EKLENDİ

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "tinylottie-afbda.firebaseapp.com",
  projectId: "tinylottie-afbda",
  storageBucket: "tinylottie-afbda.firebasestorage.app",
  messagingSenderId: "71470859311",
  appId: "1:71470859311:web:8bf8546689fd03d4e0b2da",
  measurementId: "G-QH7EKS2GH0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// DIŞARIYA AÇTIĞIMIZ (EXPORT ETTİĞİMİZ) KISIMLAR
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { app, analytics };
