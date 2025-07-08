// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWZN1KbrMTSo0XSmETldqd-3KAh4Xrbtk",
  authDomain: "proposeio.firebaseapp.com",
  projectId: "proposeio",
  storageBucket: "proposeio.firebasestorage.app",
  messagingSenderId: "382695733911",
  appId: "1:382695733911:web:6228f89c4afd32b7d7c7d2",
  measurementId: "G-L2DT77RCM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);