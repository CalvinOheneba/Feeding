import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOjSwIyHzYLie7PvWa4SyYL2JKVGWCjPE",
  authDomain: "school-feeding-system-97e17.firebaseapp.com",
  projectId: "school-feeding-system-97e17",
  storageBucket: "school-feeding-system-97e17.firebasestorage.app",
  messagingSenderId: "1050453929807",
  appId: "1:1050453929807:web:4c8f1dca728c920dd71f3a",
  measurementId: "G-C165V1T0V0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };