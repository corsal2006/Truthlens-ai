// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this line

const firebaseConfig = {
  apiKey: "AIzaSyAJEz3SAK6MdmCkUB8V-yZQ0j-jDWjnXt8",
  authDomain: "truthlens-ai-5df9e.firebaseapp.com",
  projectId: "truthlens-ai-5df9e",
  storageBucket: "truthlens-ai-5df9e.firebasestorage.app",
  messagingSenderId: "299185999669",
  appId: "1:299185999669:web:723195d35177509ebc867c"
};;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // Add this line