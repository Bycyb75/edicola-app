console.log("✅ script-admin.js caricato");

async function caricaUtenti() {
  try {
    const res = await fetch('/admin/utenti-pending');
    if (!res.ok) throw new Error("Errore nella richiesta");

    const utenti = await res.json();
    console.log("📦 Utenti ricevuti:", utenti);

    const lista = document.getElementById('listaUtenti');
    lista.innerHTML = '';

    if (utenti.length === 0) {
      lista.innerHTML = '<li>Nessun utente in attesa</li>';
      return;
    }

    utenti.forEach(u => {
      const li = document.createElement('li');
      li.textContent = `${u.username} (${u.email})`;

      const btn = document.createElement('button');
      btn.textContent = '✅ Approva';
      btn.style.marginLeft = '10px';
      btn.onclick = async () => {
        const approva = await fetch('/admin/approva', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u.username })
        });

        if (approva.ok) {
          alert(`Utente "${u.username}" approvato`);
          caricaUtenti(); // aggiorna la lista
        } else {
          alert('Errore nell’approvazione');
        }
      };

      li.appendChild(btn);
      lista.appendChild(li);
    });
  } catch (error) {
    console.error('❌ Errore nel caricamento utenti:', error);
    document.getElementById('listaUtenti').innerHTML = '<li>Errore nel caricamento</li>';
  }
}

document.addEventListener('DOMContentLoaded', caricaUtenti);
