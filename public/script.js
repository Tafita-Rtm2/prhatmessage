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

let currentUser = null;
let chatId = null;

// Créer un compte
document.getElementById('signupBtn').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;

  const result = await auth.createUserWithEmailAndPassword(email, password);
  await db.collection("users").doc(result.user.uid).set({
    uid: result.user.uid,
    name: username,
    email: email
  });
  alert("Compte créé !");
};

// Connexion
document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const result = await auth.signInWithEmailAndPassword(email, password);
  currentUser = result.user;
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";
  document.getElementById("current-user").innerText = "Connecté en tant que : " + currentUser.email;
};

// Recherche d'utilisateur par email
document.getElementById('searchBtn').onclick = async () => {
  const searchEmail = document.getElementById('searchEmail').value;
  const q = await db.collection("users").where("email", "==", searchEmail).get();
  
  if (!q.empty) {
    const user = q.docs[0].data();
    document.getElementById("foundUser").innerHTML = `<p>${user.name}</p><button onclick="startChat('${user.uid}')">Discuter</button>`;
  } else {
    document.getElementById("foundUser").innerHTML = "Utilisateur non trouvé.";
  }
};

// Démarrer un chat
window.startChat = async (receiverId) => {
  const uid = currentUser.uid;
  chatId = uid < receiverId ? uid + "_" + receiverId : receiverId + "_" + uid;

  db.collection("chats").doc(chatId).collection("messages").orderBy("timestamp")
    .onSnapshot(snapshot => {
      document.getElementById("messages").innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const align = msg.sender === uid ? "right" : "left";
        document.getElementById("messages").innerHTML += `<p style="text-align:${align};">${msg.text}</p>`;
      });
    });
};

// Envoyer un message
document.getElementById('sendBtn').onclick = async () => {
  const msg = document.getElementById('messageInput').value;
  if (!msg || !chatId) return;

  await db.collection("chats").doc(chatId).collection("messages").add({
    sender: currentUser.uid,
    text: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById('messageInput').value = "";
};
