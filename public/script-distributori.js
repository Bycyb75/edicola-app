// Carica distributori
async function caricaDistributori() {
  try {
    const res = await fetch('/distributori');
    const data = await res.json();
    const elenco = document.getElementById('elencoDist');
    elenco.innerHTML = '';
    data.forEach(d => {
      const li = document.createElement('li');
      li.textContent = `${d.nome} - ${d.telefono}`;
      elenco.appendChild(li);
    });
  } catch (error) {
    console.error('Errore nel caricamento dei distributori:', error);
  }
}

// Invio distributore
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('distForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      nome: document.getElementById('nome').value,
      contatto: document.getElementById('contatto').value,
      telefono: document.getElementById('telefono').value
    };
    try {
      await fetch('/distributori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      form.reset();
      caricaDistributori();
    } catch (error) {
      console.error('Errore nell’invio del distributore:', error);
    }
  });

  caricaDistributori(); // Carica all’avvio
});