// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVfT5dVUY037O7EPIEp_H1I1tbhUYqbNw",
  authDomain: "student-forum-745c4.firebaseapp.com",
  projectId: "student-forum-745c4",
  storageBucket: "student-forum-745c4.firebasestorage.app",
  messagingSenderId: "925986199492",
  appId: "1:925986199492:web:fb5be5e61c546934b2b691",
  measurementId: "G-65VQ5F32BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };