// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCWZN1KbrMTSo0XSmETldqd-3KAh4Xrbtk",
  authDomain: "proposeio.firebaseapp.com",
  databaseURL: "https://proposeio-default-rtdb.firebaseio.com",
  projectId: "proposeio",
  storageBucket: "proposeio.appspot.com", // ← CORRECTED HERE
  messagingSenderId: "382695733911",
  appId: "1:382695733911:web:6228f89c4afd32b7d7c7d2",
  measurementId: "G-L2DT77RCM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
