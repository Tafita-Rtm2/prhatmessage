function signUp() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const profilePic = document.getElementById("profilePic").value;

  auth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
    const user = userCredential.user;
    return db.collection("users").doc(user.uid).set({
      uid: user.uid,
      name,
      email,
      profilePic
    });
  }).then(() => {
    window.location.href = "chat.html";
  }).catch((error) => {
    alert(error.message);
  });
}

function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password).then(() => {
    window.location.href = "chat.html";
  }).catch((error) => {
    alert(error.message);
  });
}
