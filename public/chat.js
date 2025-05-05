import { auth, db, storage } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// DOM elements
const sidebar     = document.getElementById('sidebar');
const chatArea    = document.getElementById('chatArea');
const backBtn     = document.getElementById('backBtn');
const usersList   = document.getElementById('usersList');
const searchInput = document.getElementById('searchUser');
const searchBtn   = document.getElementById('searchBtn');
const myAvatar    = document.getElementById('myAvatar');
const myName      = document.getElementById('myName');
const logoutBtn   = document.getElementById('logoutBtn');
const chatAvatar  = document.getElementById('chatAvatar');
const chatWithEl  = document.getElementById('chatWith');
const messagesEl  = document.getElementById('messages');
const msgInput    = document.getElementById('msgInput');
const sendBtn     = document.getElementById('sendBtn');
const fileInput   = document.getElementById('fileInput');

let currentUser, currentChatId, unsubscribeChat;

// Déconnexion
logoutBtn.onclick = () => {
  signOut(auth);
  sessionStorage.clear();
  location.href = 'index.html';
};

// Recherche au clic
searchBtn.onclick = () => {
  loadUsers(searchInput.value.trim());
};
// Recherche à Enter
searchInput.onkeypress = e => {
  if (e.key === 'Enter') loadUsers(searchInput.value.trim());
};

// Auth listener
onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'index.html';
    return;
  }
  currentUser = user;
  myName.innerText = user.displayName;
  myAvatar.src = user.photoURL || 'default-avatar.png';
  await loadUsers('');  // charge tous les utilisateurs au démarrage
});

// Charge et affiche les utilisateurs (avec filtre optionnel)
async function loadUsers(filter = '') {
  usersList.innerHTML = '';
  const colRef = collection(db, 'users');
  let q;
  if (filter) {
    q = query(colRef,
      where('name', '>=', filter),
      where('name', '<=', filter + '\uf8ff')
    );
  } else {
    q = colRef;  // pas de filtre → tous
  }
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const u = docSnap.data();
    if (u.uid === currentUser.uid) return;
    const li = document.createElement('li');
    li.innerHTML = `<img src="${u.photoURL || 'default-avatar.png'}"><span>${u.name}</span>`;
    li.onclick = () => selectUser(u);
    usersList.appendChild(li);
  });
}

// Ouvre un chat privé
function selectUser(user) {
  chatWithEl.innerText = user.name;
  chatAvatar.src = user.photoURL || 'default-avatar.png';
  currentChatId = [currentUser.uid, user.uid].sort().join('_');

  // Mobile : bascule vues
  if (window.innerWidth < 768) {
    sidebar.classList.add('hidden');
    chatArea.classList.remove('hidden');
  }

  if (unsubscribeChat) unsubscribeChat();
  const msgCol = collection(db, 'chats', currentChatId, 'messages');
  const q = query(msgCol, orderBy('timestamp'));
  unsubscribeChat = onSnapshot(q, snap => {
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

// Bouton retour mobile
backBtn.onclick = () => {
  chatArea.classList.add('hidden');
  sidebar.classList.remove('hidden');
};

// Envoi de message ou image
sendBtn.onclick = async () => {
  if (!currentChatId) return;

  // Envoi d'image/fichier
  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const sref = sRef(storage, `chats/${currentChatId}/${Date.now()}_${file.name}`);
    await uploadBytes(sref, file);
    const url = await getDownloadURL(sref);
    await addDoc(collection(db,'chats',currentChatId,'messages'), {
      sender: currentUser.uid,
      type: 'image',
      url,
      timestamp: serverTimestamp()
    });
    fileInput.value = '';
  }

  // Envoi de texte
  const text = msgInput.value.trim();
  if (text) {
    await addDoc(collection(db,'chats',currentChatId,'messages'), {
      sender: currentUser.uid,
      type: 'text',
      text,
      timestamp: serverTimestamp()
    });
    msgInput.value = '';
  }
};
