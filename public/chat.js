let currentUser;
let selectedUser;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadContacts();
  } else {
    window.location.href = "index.html";
  }
});

function searchUser() {
  const email = document.getElementById("searchUser").value;
  db.collection("users").where("email", "==", email).get().then(snapshot => {
    const list = document.getElementById("userList");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.uid !== currentUser.uid) {
        const li = document.createElement("li");
        li.textContent = data.name;
        li.onclick = () => selectUser(data);
        list.appendChild(li);
      }
    });
  });
}

function selectUser(user) {
  selectedUser = user;
  document.getElementById("chatHeader").textContent = `Discussion avec ${user.name}`;
  loadMessages();
}

function loadMessages() {
  const convoId = [currentUser.uid, selectedUser.uid].sort().join("_");
  db.collection("messages").doc(convoId).collection("chats")
    .orderBy("timestamp").onSnapshot(snapshot => {
      const messagesDiv = document.getElementById("messages");
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const p = document.createElement("p");
        p.textContent = `${msg.senderName}: ${msg.text}`;
        messagesDiv.appendChild(p);
      });
    });
}

function sendMessage() {
  const text = document.getElementById("messageInput").value;
  if (!text || !selectedUser) return;

  const convoId = [currentUser.uid, selectedUser.uid].sort().join("_");
  db.collection("messages").doc(convoId).collection("chats").add({
    text,
    senderId: currentUser.uid,
    senderName: currentUser.displayName || currentUser.email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById("messageInput").value = "";
}

function loadContacts() {
  // Optionnel : tu peux améliorer ici plus tard pour montrer la liste de contacts
}
