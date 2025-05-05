const uid = crypto.randomUUID();
document.getElementById("myId").textContent = uid;

function refreshMessages() {
  fetch(`/messages/${uid}`)
    .then(res => res.json())
    .then(data => {
      const box = document.getElementById("messages");
      box.innerHTML = "";
      data.forEach(msg => {
        const p = document.createElement("p");
        p.textContent = `${msg.from === uid ? "Moi" : msg.from}: ${msg.text}`;
        box.appendChild(p);
      });
    });
}

document.getElementById("send").onclick = () => {
  const target = document.getElementById("target").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!target || !message) return;

  fetch("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: uid, to: target, text: message })
  }).then(() => {
    document.getElementById("message").value = "";
    refreshMessages();
  });
};

setInterval(refreshMessages, 2000);
refreshMessages();
