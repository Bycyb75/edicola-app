// Carica le pubblicazioni
async function caricaPubblicazioni() {
  const res = await fetch('/pubblicazioni');
  const data = await res.json();
  const lista = document.getElementById('lista');
  lista.innerHTML = '';
  data.forEach(pub => {
    const li = document.createElement('li');
    li.textContent = `${pub.titolo} (${pub.tipo}) - €${pub.prezzo}`;
    lista.appendChild(li);
  });
}

// Invio del modulo
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pubForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      titolo: document.getElementById('titolo').value,
      tipo: document.getElementById('tipo').value,
      editore: document.getElementById('editore').value,
      prezzo: parseFloat(document.getElementById('prezzo').value),
      id_distributore: parseInt(document.getElementById('id_distributore').value)
    };
    await fetch('/pubblicazioni', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    form.reset();
    caricaPubblicazioni();
  });

  caricaPubblicazioni(); // Carica all’avvio
});