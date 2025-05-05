import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDbP-yKWXD4L1HowJt3ZSyEpMUMrzJZjI",
  authDomain: "tafitafaceboot.firebaseapp.com",
  projectId: "tafitafaceboot",
  storageBucket: "tafitafaceboot.appspot.com",
  messagingSenderId: "893787639070",
  appId: "1:893787639070:web:e5dd2798f3cb2b6fa24d0f",
  measurementId: "G-H64J1YYPYE",
  databaseURL: "https://tafitafaceboot-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

window.signup = function () {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => window.location.href = "/chat")
    .catch(err => document.getElementById('error').innerText = err.message);
};

window.login = function () {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => window.location.href = "/chat")
    .catch(err => document.getElementById('error').innerText = err.message);
};

onAuthStateChanged(auth, user => {
  if (location.pathname.endsWith("chat.html") && user) {
    document.getElementById('username').innerText = user.email;
    if (user.photoURL) document.getElementById('pdp').src = user.photoURL;

    const messagesRef = ref(db, 'messages/' + user.uid);
    onChildAdded(messagesRef, snapshot => {
      const msg = snapshot.val();
      const div = document.createElement("div");
      div.className = "message " + (msg.sender === user.uid ? "me" : "notMe");
      div.innerHTML = msg.type === "text" ? msg.text : `<img src="${msg.url}" width="200">`;
      document.getElementById("messages").appendChild(div);
    });
  }
});

window.logout = function () {
  signOut(auth).then(() => window.location.href = "/");
};

window.sendMsg = function () {
  const msg = document.getElementById("msgTxt").value;
  const user = auth.currentUser;
  if (msg) {
    const chatRef = ref(db, 'messages/' + user.uid);
    push(chatRef, { text: msg, sender: user.uid, type: "text" });
    document.getElementById("msgTxt").value = "";
  }
};

window.uploadPDP = function (e) {
  const file = e.target.files[0];
  const user = auth.currentUser;
  const storageRef = sRef(storage, "pdp/" + user.uid);
  uploadBytes(storageRef, file).then(() => {
    getDownloadURL(storageRef).then(url => {
      updateProfile(user, { photoURL: url });
      document.getElementById("pdp").src = url;
    });
  });
};

window.sendImage = function (e) {
  const file = e.target.files[0];
  const user = auth.currentUser;
  const storageRef = sRef(storage, "images/" + Date.now());
  uploadBytes(storageRef, file).then(() => {
    getDownloadURL(storageRef).then(url => {
      const chatRef = ref(db, 'messages/' + user.uid);
      push(chatRef, { url, sender: user.uid, type: "image" });
    });
  });
};
