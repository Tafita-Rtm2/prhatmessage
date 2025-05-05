import { auth, db, storage } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

const emailEl   = document.getElementById('email');
const passEl    = document.getElementById('password');
const loginBtn  = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const errorEl   = document.getElementById('error');

if (signupBtn) {
  signupBtn.onclick = async () => {
    const name = document.getElementById('displayName').value;
    const email = emailEl.value;
    const pass  = passEl.value;
    const avatarFile = document.getElementById('avatarInput').files[0];
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, pass);
      let photoURL = '';
      if (avatarFile) {
        const storageRef = sRef(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await updateProfile(user, { displayName: name, photoURL });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        photoURL
      });
      sessionStorage.setItem('uid', user.uid);
      location.href = 'chat.html';
    } catch (e) {
      errorEl.innerText = e.message;
    }
  };
}

if (loginBtn) {
  loginBtn.onclick = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, emailEl.value, passEl.value);
      sessionStorage.setItem('uid', cred.user.uid);
      location.href = 'chat.html';
    } catch (e) {
      errorEl.innerText = e.message;
    }
  };
}

// Redirige automatiquement si déjà connecté
onAuthStateChanged(auth, user => {
  if (user && !location.href.endsWith('chat.html')) {
    location.href = 'chat.html';
  }
  if (!user && location.href.endsWith('chat.html')) {
    location.href = 'index.html';
  }
});

export function logout() {
  signOut(auth);
  sessionStorage.clear();
  location.href = 'index.html';
}
