const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// 🔌 Connessione al database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '29011212Fl.',
  database: 'edicola'
});

db.connect(err => {
  if (err) {
    console.error('❌ Errore di connessione al database:', err);
    return;
  }
  console.log('✅ Connessione al database MySQL riuscita');
});

// 📦 Rotta per ottenere tutte le pubblicazioni
app.get('/pubblicazioni', (req, res) => {
  db.query('SELECT * FROM pubblicazioni', (err, results) => {
    if (err) {
      console.error('❌ Errore nella query:', err);
      res.status(500).send('Errore nel recupero dei dati');
      return;
    }
    res.json(results);
  });
});

// ➕ Rotta per aggiungere una nuova pubblicazione
app.post('/pubblicazioni', (req, res) => {
  const { titolo, tipo, editore, prezzo, id_distributore } = req.body;
  const query = `
    INSERT INTO pubblicazioni (titolo, tipo, editore, prezzo, id_distributore)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [titolo, tipo, editore, prezzo, id_distributore], (err, result) => {
    if (err) {
      console.error('❌ Errore nell’inserimento:', err);
      res.status(500).send('Errore nell’inserimento');
      return;
    }
    res.json({ id: result.insertId, messaggio: 'Pubblicazione aggiunta con successo' });
  });
});

// 🚀 Avvio del server
app.listen(3000, () => {
  console.log('🟢 Server avviato su http://localhost:3000');
});
// Ottieni tutti i distributori
app.get('/distributori', (req, res) => {
  db.query('SELECT * FROM distributori', (err, results) => {
    if (err) {
      console.error('Errore nel recupero distributori:', err);
      res.status(500).send('Errore');
      return;
    }
    res.json(results);
  });
});

// Aggiungi un nuovo distributore
app.post('/distributori', (req, res) => {
  const { nome, contatto, telefono } = req.body;
  db.query(
    'INSERT INTO distributori (nome, contatto, telefono) VALUES (?, ?, ?)',
    [nome, contatto, telefono],
    (err, result) => {
      if (err) {
        console.error('Errore nell’inserimento distributore:', err);
        res.status(500).send('Errore');
        return;
      }
      res.json({ id: result.insertId, messaggio: 'Distributore aggiunto' });
    }
  );
});
// Ottieni tutte le edicole
app.get('/edicole', (req, res) => {
  db.query('SELECT * FROM edicole', (err, results) => {
    if (err) {
      console.error('Errore nel recupero edicole:', err);
      res.status(500).send('Errore');
      return;
    }
    res.json(results);
  });
});

// Aggiungi una nuova edicola
app.post('/edicole', (req, res) => {
  const { nome, indirizzo, città, provincia, telefono, email, referente } = req.body;
  db.query(
    'INSERT INTO edicole (nome, indirizzo, città, provincia, telefono, email, referente) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nome, indirizzo, città, provincia, telefono, email, referente],
    (err, result) => {
      if (err) {
        console.error('Errore nell’inserimento edicola:', err);
        res.status(500).send('Errore');
        return;
      }
      res.json({ id: result.insertId, messaggio: 'Edicola aggiunta con successo' });
    }
  );
});



