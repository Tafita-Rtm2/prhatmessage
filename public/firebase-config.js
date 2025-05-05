const firebaseConfig = {
  apiKey: "AIzaSyCDbP-yKWXD4L1HowJt3ZSyEpMUMrzJZjI",
  authDomain: "tafitafaceboot.firebaseapp.com",
  projectId: "tafitafaceboot",
  storageBucket: "tafitafaceboot.appspot.com",
  messagingSenderId: "893787639070",
  appId: "1:893787639070:web:e5dd2798f3cb2b6fa24d0f",
  measurementId: "G-H64J1YYPYE"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
