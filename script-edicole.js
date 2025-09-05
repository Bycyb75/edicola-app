// Carica edicole
async function caricaEdicole() {
  const res = await fetch('/edicole');
  const data = await res.json();
  const lista = document.getElementById('listaEdicole');
  lista.innerHTML = '';
  data.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.nome} (${e.città}, ${e.provincia}) - ${e.telefono}`;
    lista.appendChild(li);
  });
}

// Invio edicola
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edicolaForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      nome: document.getElementById('nomeEdicola').value,
      indirizzo: document.getElementById('indirizzo').value,
      città: document.getElementById('città').value,
      provincia: document.getElementById('provincia').value,
      telefono: document.getElementById('telefonoEdicola').value,
      email: document.getElementById('emailEdicola').value,
      referente: document.getElementById('referente').value
    };
    await fetch('/edicole', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    form.reset();
    caricaEdicole();
  });

  caricaEdicole(); // Carica all’avvio
});