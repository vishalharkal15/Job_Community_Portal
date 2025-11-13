// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOtlzEj_3LVXT_K2jpyLxB4mULQywAWTE",
  authDomain: "jobcommunityportal.firebaseapp.com",
  projectId: "jobcommunityportal",
  storageBucket: "jobcommunityportal.firebasestorage.app",
  messagingSenderId: "452206552998",
  appId: "1:452206552998:web:9b743758cc0b390ce79167",
  measurementId: "G-NX8K2X2PGJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);