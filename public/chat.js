
import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { collection, query, where, getDocs, onSnapshot, orderBy, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

// DOM
const sidebar    = document.getElementById('sidebar');
const chatArea   = document.getElementById('chatArea');
const backBtn    = document.getElementById('backBtn');
const usersList  = document.getElementById('usersList');
const searchInput= document.getElementById('searchUser');
const myAvatar   = document.getElementById('myAvatar');
const myName     = document.getElementById('myName');
const logoutBtn  = document.getElementById('logoutBtn');
const chatWithEl = document.getElementById('chatWith');
const messagesEl = document.getElementById('messages');
const msgInput   = document.getElementById('msgInput');
const sendBtn    = document.getElementById('sendBtn');
const fileInput  = document.getElementById('fileInput');

let currentUser, currentChatId, unsubscribeChat;

// Logout
logoutBtn.onclick = () => { signOut(auth); sessionStorage.clear(); location.href='index.html'; };

// Auth listener
onAuthStateChanged(auth, async user => {
  if (!user) { location.href='index.html'; return; }
  currentUser = user;
  myName.innerText = user.displayName;
  myAvatar.src = user.photoURL || 'default-avatar.png';
  loadUsers();
  searchInput.oninput = () => loadUsers(searchInput.value);
});

// Load users
async function loadUsers(filter='') {
  usersList.innerHTML = '';
  const usersCol = collection(db,'users');
  let q;
  if (filter) {
    q = query(usersCol, where('name','>=',filter), where('name','<=',filter+'\uf8ff'));
  } else q = usersCol;
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const u = docSnap.data();
    if (u.uid === currentUser.uid) return;
    const li = document.createElement('li');
    li.innerHTML = `<img src="${u.photoURL||'default-avatar.png'}"><span>${u.name}</span>`;
    li.onclick = () => selectUser(u);
    usersList.appendChild(li);
  });
}

// Sélectionner un ami
function selectUser(user) {
  chatWithEl.innerText = user.name;
  const ids = [currentUser.uid, user.uid].sort().join('_');
  currentChatId = ids;
  // mobile : afficher chat, masquer sidebar
  if (window.innerWidth < 768) {
    sidebar.classList.add('hidden');
    chatArea.classList.remove('hidden');
  }
  // unsubscribe previous
  if (unsubscribeChat) unsubscribeChat();
  const messagesCol = collection(db,'chats',currentChatId,'messages');
  const q = query(messagesCol, orderBy('timestamp'));
  unsubscribeChat = onSnapshot(q, snap => {
    messagesEl.innerHTML = '';
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement('div');
      div.className = 'message ' + (m.sender===currentUser.uid?'me':'other');
      if (m.type==='text') div.textContent = m.text;
      else if (m.type==='image') {
        const img = document.createElement('img'); img.src=m.url; img.style.maxWidth='200px'; div.appendChild(img);
      }
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// Back to user list
backBtn.onclick = () => {
  chatArea.classList.add('hidden');
  sidebar.classList.remove('hidden');
};

// Envoi message
sendBtn.onclick = async () => {
  if (!currentChatId) return;
  // fichier
  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const sref = sRef(storage, `chats/${currentChatId}/${Date.now()}_${file.name}`);
    await uploadBytes(sref,file);
    const url = await getDownloadURL(sref);
    await addDoc(collection(db,'chats',currentChatId,'messages'),{ sender:currentUser.uid, type:'image', url, timestamp:serverTimestamp() });
    fileInput.value='';
  }
  // texte
  const text = msgInput.value.trim();
  if (text) {
    await addDoc(collection(db,'chats',currentChatId,'messages'),{ sender:currentUser.uid, type:'text', text, timestamp:serverTimestamp() });
    msgInput.value='';
  }
};
