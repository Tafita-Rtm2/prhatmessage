// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDbP-yKWXD4L1HowJt3ZSyEpMUMrzJZjI",
  authDomain: "tafitafaceboot.firebaseapp.com",
  databaseURL: "https://tafitafaceboot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tafitafaceboot",
  storageBucket: "tafitafaceboot.firebasestorage.app",
  messagingSenderId: "893787639070",
  appId: "1:893787639070:web:e5dd2798f3cb2b6fa24d0f",
  measurementId: "G-H64J1YYPYE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };
