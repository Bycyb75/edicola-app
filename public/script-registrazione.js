console.log("✅ script-registrazione.js caricato");
document.getElementById('regForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value
  };
  const res = await fetch('/registrazione', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    alert('Registrazione inviata. Attendi approvazione.');
    window.location.href = 'index.html';
  }
});