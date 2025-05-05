import { auth, db, storage } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// DOM
const usersList   = document.getElementById('usersList');
const searchInput = document.getElementById('searchUser');
const myAvatar    = document.getElementById('myAvatar');
const myName      = document.getElementById('myName');
const logoutBtn   = document.getElementById('logoutBtn');
const chatWithEl  = document.getElementById('chatWith');
const messagesEl  = document.getElementById('messages');
const msgInput    = document.getElementById('msgInput');
const sendBtn     = document.getElementById('sendBtn');
const fileInput   = document.getElementById('fileInput');

let currentUser, currentChatId, currentChatRefUnsub;

// Déconnexion
logoutBtn.onclick = () => {
  signOut(auth);
  sessionStorage.clear();
  location.href = 'index.html';
};

// Vérifie l’authentification
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'index.html';
    return;
  }
  currentUser = user;
  // Affiche profil
  myName.innerText   = user.displayName;
  myAvatar.src       = user.photoURL || 'default-avatar.png';

  // Charge la liste des utilisateurs
  await loadUsers();

  // Recherche par nom
  searchInput.oninput = () => loadUsers(searchInput.value);

});

// Charge et affiche les utilisateurs
async function loadUsers(filter = '') {
  usersList.innerHTML = '';
  const q = filter
    ? query(collection(db, 'users'), where('name', '>=', filter), where('name', '<=', filter+'\uf8ff'))
    : collection(db, 'users');
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const u = docSnap.data();
    if (u.uid === currentUser.uid) return;
    const li = document.createElement('li');
    li.innerHTML = `<img src="${u.photoURL||'default-avatar.png'}"><span>${u.name}</span>`;
    li.onclick = () => openChatWith(u);
    usersList.appendChild(li);
  });
}

// Ouvre un chat privé
function openChatWith(user) {
  chatWithEl.innerText = user.name;
  messagesEl.innerHTML = '';
  // Détermine ID du chat : uid1_uid2 (ordre alphabétique)
  const ids = [currentUser.uid, user.uid].sort();
  currentChatId = ids.join('_');
  // Désabonnement éventuel
  if (currentChatRefUnsub) currentChatRefUnsub();
  // Écoute les messages
  const colRef = collection(db, 'chats', currentChatId, 'messages');
  const q = query(colRef, orderBy('timestamp'));
  currentChatRefUnsub = onSnapshot(q, snap => {
    messagesEl.innerHTML = '';
    snap.forEach(docSnap => {
      const m = docSnap.data();
      const div = document.createElement('div');
      div.className = 'message ' + (m.sender === currentUser.uid ? 'me' : 'other');
      if (m.type === 'text') {
        div.textContent = m.text;
      } else if (m.type === 'image') {
        const img = document.createElement('img');
        img.src = m.url;
        img.style.maxWidth = '200px';
        div.appendChild(img);
      }
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// Envoi de message texte
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  if (!currentChatId || (!text && !fileInput.files.length)) return;
  // Si image/fichier
  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const storageRef = sRef(storage, `chats/${currentChatId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await addDoc(
      collection(db, 'chats', currentChatId, 'messages'),
      {
        sender: currentUser.uid,
        type: 'image',
        url,
        timestamp: serverTimestamp()
      }
    );
    fileInput.value = '';
  }
  // Si texte
  if (text) {
    await addDoc(
      collection(db, 'chats', currentChatId, 'messages'),
      {
        sender: currentUser.uid,
        type: 'text',
        text,
        timestamp: serverTimestamp()
      }
    );
    msgInput.value = '';
  }
};
