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

const sidebar    = document.getElementById('sidebar');
const chatArea   = document.getElementById('chatArea');
const backBtn    = document.getElementById('backBtn');
const usersList  = document.getElementById('usersList');
const searchInput= document.getElementById('searchUser');
const myAvatar   = document.getElementById('myAvatar');
const myName     = document.getElementById('myName');
const logoutBtn  = document.getElementById('logoutBtn');
const chatAvatar = document.getElementById('chatAvatar');
const chatWithEl = document.getElementById('chatWith');
const messagesEl = document.getElementById('messages');
const msgInput   = document.getElementById('msgInput');
const sendBtn    = document.getElementById('sendBtn');
const fileInput  = document.getElementById('fileInput');

let currentUser, currentChatId, unsubscribeChat;

logoutBtn.onclick = () => {
  signOut(auth);
  sessionStorage.clear();
  location.href='index.html';
};

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = 'index.html';
    return;
  }
  currentUser = user;
  myName.innerText = user.displayName;
  myAvatar.src   = user.photoURL || 'default-avatar.png';
  loadUsers();
  searchInput.oninput = () => loadUsers(searchInput.value);
});

async function loadUsers(filter='') {
  usersList.innerHTML = '';
  const usersCol = collection(db,'users');
  const q = filter
    ? query(usersCol, where('name','>=',filter), where('name','<=',filter+'\uf8ff'))
    : usersCol;
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

function selectUser(user) {
  chatWithEl.innerText = user.name;
  chatAvatar.src       = user.photoURL || 'default-avatar.png';
  const ids = [currentUser.uid, user.uid].sort().join('_');
  currentChatId = ids;

  if (window.innerWidth < 768) {
    sidebar.classList.add('hidden');
    chatArea.classList.remove('hidden');
  }
  if (unsubscribeChat) unsubscribeChat();

  const messagesCol = collection(db,'chats',currentChatId,'messages');
  const q = query(messagesCol, orderBy('timestamp'));
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

backBtn.onclick = () => {
  chatArea.classList.add('hidden');
  sidebar.classList.remove('hidden');
};

sendBtn.onclick = async () => {
  if (!currentChatId) return;

  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const refStorage = sRef(storage, `chats/${currentChatId}/${Date.now()}_${file.name}`);
    await uploadBytes(refStorage, file);
    const url = await getDownloadURL(refStorage);
    await addDoc(collection(db,'chats',currentChatId,'messages'), {
      sender: currentUser.uid,
      type: 'image',
      url,
      timestamp: serverTimestamp()
    });
    fileInput.value = '';
  }

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
