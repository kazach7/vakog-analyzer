// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBYAWHwk0fwL0CfEfodXkRrDlSdFZMJers",

  authDomain: "vakog-analyzer-mobile.firebaseapp.com",

  databaseURL:
    "https://vakog-analyzer-mobile-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "vakog-analyzer-mobile",

  storageBucket: "vakog-analyzer-mobile.appspot.com",

  messagingSenderId: "127018479076",

  appId: "1:127018479076:web:ffb63c4d8ed0271413ebf1",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore(app);

export { auth, db };
