// Configuration de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDbP-yKWXD4L1HowJt3ZSyEpMUMrzJZjI",
    authDomain: "tafitafaceboot.firebaseapp.com",
    projectId: "tafitafaceboot",
    storageBucket: "tafitafaceboot.firebasestorage.app",
    messagingSenderId: "893787639070",
    appId: "1:893787639070:web:e5dd2798f3cb2b6fa24d0f",
    measurementId: "G-H64J1YYPYE"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const usersRef = db.collection("users");
const messagesRef = db.collection("messages");

// Éléments HTML
const loginPage = document.getElementById("loginPage");
const searchPage = document.getElementById("searchPage");
const chatPage = document.getElementById("chatPage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const searchEmailInput = document.getElementById("searchEmail");
const searchResultsDiv = document.getElementById("userResults");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const chatWithUserDiv = document.getElementById("chatWithUser");

// Fonction pour afficher les pages
function showPage(page) {
    loginPage.style.display = "none";
    searchPage.style.display = "none";
    chatPage.style.display = "none";
    page.style.display = "block";
}

// Fonction d'inscription
document.getElementById("signupBtn").onclick = () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            usersRef.doc(user.uid).set({
                email: user.email,
                name: email.split('@')[0] // Utilisation du nom avant le '@' comme pseudonyme
            }).then(() => {
                alert("Compte créé avec succès !");
                showPage(searchPage);
            });
        })
        .catch((error) => {
            alert(error.message);
        });
};

// Fonction de connexion
document.getElementById("loginBtn").onclick = () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Connecté avec succès !");
            showPage(searchPage);
        })
        .catch((error) => {
            alert(error.message);
        });
};

// Recherche d'utilisateur
document.getElementById("searchBtn").onclick = () => {
    const emailToSearch = searchEmailInput.value;

    usersRef.where("email", "==", emailToSearch).get()
        .then((querySnapshot) => {
            searchResultsDiv.innerHTML = "";
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    const userDiv = document.createElement("div");
                    userDiv.textContent = userData.email;
                    userDiv.onclick = () => openChat(userData.email, doc.id);
                    searchResultsDiv.appendChild(userDiv);
                });
            } else {
                searchResultsDiv.textContent = "Aucun utilisateur trouvé.";
            }
        });
};

// Ouvrir la discussion avec un utilisateur
function openChat(userEmail, userId) {
    chatWithUserDiv.textContent = `Chat avec ${userEmail}`;
    showPage(chatPage);

    // Afficher les messages
    messagesRef.where("participants", "array-contains", userId).get()
        .then((querySnapshot) => {
            messagesDiv.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const message = doc.data();
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${message.sender}: ${message.content}`;
                messageDiv.classList.add(message.sender === auth.currentUser.email ? "sent" : "received");
                messagesDiv.appendChild(messageDiv);
            });
        });
}

// Envoyer un message
document.getElementById("sendMessageBtn").onclick = () => {
    const messageContent = messageInput.value;
    const currentUser = auth.currentUser;

    if (messageContent) {
        const recipientEmail = chatWithUserDiv.textContent.split('Chat avec ')[1];

        // Sauvegarder le message
        messagesRef.add({
            sender: currentUser.email,
            content: messageContent,
            participants: [currentUser.uid, recipientEmail],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            messageInput.value = "";
            openChat(recipientEmail, currentUser.uid);
        });
    }
};

// Déconnexion
document.getElementById("logoutBtn").onclick = () => {
    auth.signOut().then(() => {
        showPage(loginPage);
    });
};

// Afficher la page de connexion au début
showPage(loginPage);
