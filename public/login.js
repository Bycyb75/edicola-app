document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const messaggio = document.getElementById('messaggio');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };

    console.log("📤 Invio credenziali:", payload);

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Risposta non valida dal server');
      }

      const result = await res.json();
      console.log("📦 Risposta login:", result);

      if (result.success && result.redirect) {
        window.location.href = result.redirect;
      } else {
        messaggio.textContent = result.messaggio || 'Accesso negato';
      }
    } catch (error) {
      console.error('❌ Errore nel login:', error);
      messaggio.textContent = 'Errore di connessione al server';
    }
  });
});