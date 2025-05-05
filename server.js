import express from 'express';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getDatabase, ref, set, push, onValue } from 'firebase/database';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Firebase config
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  databaseURL: process.env.DATABASE_URL
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.post('/send', (req, res) => {
  const { from, to, text } = req.body;
  const msgData = {
    from,
    to,
    text,
    timestamp: Date.now()
  };
  const newMsgRef = push(ref(db, 'messages'));
  set(newMsgRef, msgData);
  res.send({ success: true });
});

app.get('/messages/:uid', (req, res) => {
  const uid = req.params.uid;
  const messagesRef = ref(db, 'messages');
  onValue(messagesRef, (snapshot) => {
    const msgs = snapshot.val() || {};
    const filtered = Object.values(msgs).filter(msg => msg.from === uid || msg.to === uid);
    res.send(filtered);
  }, { onlyOnce: true });
});

// Auth API: Google Auth
app.post('/login', (req, res) => {
  const { token } = req.body;
  signInWithCustomToken(auth, token)
    .then(userCredential => {
      res.send({ uid: userCredential.user.uid });
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
});

// Listen on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
