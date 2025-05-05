// public/script.js
async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const file = document.getElementById("photo").files[0];

  if (!name || !email || !password || !file) return alert("Remplis tous les champs !");

  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;

  const storageRef = storage.ref("users/" + user.uid + ".jpg");
  await storageRef.put(file);
  const photoURL = await storageRef.getDownloadURL();

  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    name,
    email,
    photoURL,
  });

  alert("Compte créé !");
  window.location.href = "chat.html";
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  await auth.signInWithEmailAndPassword(email, password);
  window.location.href = "chat.html";
}
