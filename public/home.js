// home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  databaseURL: "VOTRE_DATABASE_URL",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let currentUser = null;
let selectedUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("userName").textContent = user.displayName;
    loadUsers();
  } else {
    window.location.href = "index.html";
  }
});

function loadUsers() {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      if (user.uid !== currentUser.uid) {
        const li = document.createElement("li");
        li.textContent = user.name;
        li.addEventListener("click", () => {
          selectedUser = user;
          document.getElementById("chatWith").textContent = user.name;
          document.getElementById("chatSection").style.display = "block";
          loadMessages();
        });
        usersList.appendChild(li);
      }
    });
  });
}

function loadMessages() {
  const messagesRef = ref(db, `private_chats/${getChatId()}`);
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    const p = document.createElement("p");
    p.textContent = `${message.senderName}: ${message.text}`;
    messagesDiv.appendChild(p);
  });
}

function getChatId() {
  return currentUser.uid < selectedUser.uid
    ? `${currentUser.uid}_${selectedUser.uid}`
    : `${selectedUser.uid}_${currentUser.uid}`;
}

document.getElementById("sendBtn").addEventListener("click", () => {
  const messageInput = document.getElementById("messageInput");
  const text = messageInput.value;
  if (text && selectedUser) {
    const messagesRef = ref(db, `private_chats/${getChatId()}`);
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text,
      timestamp: Date.now()
    });
    messageInput.value = "";
  }
});
