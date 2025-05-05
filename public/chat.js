// public/chat.js
let currentUser = null;
let selectedUser = null;

auth.onAuthStateChanged(async user => {
  if (!user) return window.location.href = "index.html";
  currentUser = user;
  document.getElementById('chatHeader').innerText = "Sélectionnez un utilisateur pour discuter";
});

async function searchUser() {
  const email = document.getElementById("searchInput").value.trim();
  const query = await db.collection("users").where("email", "==", email).get();

  const usersList = document.getElementById("usersList");
  usersList.innerHTML = "";

  if (query.empty) {
    usersList.innerHTML = "Aucun utilisateur trouvé.";
    return;
  }

  query.forEach(doc => {
    const data = doc.data();
    if (data.uid === currentUser.uid) return;
    const div = document.createElement("div");
    div.innerHTML = `${data.name}<br><small>${data.email}</small>`;
    div.onclick = () => openChat(data);
    usersList.appendChild(div);
  });
}

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

function openChat(user) {
  selectedUser = user;
  document.getElementById("chatHeader").innerText = "Chat avec " + user.name;
  loadMessages();
}

function loadMessages() {
  if (!selectedUser) return;
  const chatId = getChatId(currentUser.uid, selectedUser.uid);
  const chatRef = db.collection("chats").doc(chatId).collection("messages").orderBy("timestamp");

  chatRef.onSnapshot(snapshot => {
    const messagesContainer = document.getElementById("chatMessages");
    messagesContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = "message";
      div.style.alignSelf = msg.sender === currentUser.uid ? "flex-end" : "flex-start";
      div.innerText = msg.text;
      messagesContainer.appendChild(div);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

async function sendMessage() {
  const text = document.getElementById("messageInput").value;
  if (!text || !selectedUser) return;

  const chatId = getChatId(currentUser.uid, selectedUser.uid);
  const msgRef = db.collection("chats").doc(chatId).collection("messages");

  await msgRef.add({
    sender: currentUser.uid,
    receiver: selectedUser.uid,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("messageInput").value = "";
}
