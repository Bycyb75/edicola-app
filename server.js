const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'edicola-super-segreto',
  resave: false,
  saveUninitialized: true
}));

// Connessione MySQL
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

// LOGIN UTENTE
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM utenti WHERE username = ? AND password = ? AND approvato = true',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('❌ Errore nella query di login:', err);
        return res.status(500).json({ success: false, messaggio: 'Errore interno al server' });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, messaggio: 'Accesso negato o utente non approvato' });
      }

      const utente = results[0];
      req.session.utente = utente;

      db.query('SELECT * FROM edicole WHERE id_utente = ?', [utente.id], (err2, edicole) => {
        if (err2) {
          console.error('❌ Errore nella verifica attività:', err2);
          return res.status(500).json({ success: false, messaggio: 'Errore nella verifica attività' });
        }

        const redirect = edicole.length > 0 ? 'gestionale.html' : 'registrazione-attivita.html';
        res.json({ success: true, redirect });
      });
    }
  );
});

// GESTIONALE DINAMICO
app.get('/gestionale.html', (req, res) => {
  const idUtente = req.session.utente?.id;

  if (!idUtente) {
    return res.redirect('/index.html');
  }

  db.query('SELECT nome FROM edicole WHERE id_utente = ?', [idUtente], (err, results) => {
    if (err || results.length === 0) {
      return res.send('<h2>Benvenuto nel gestionale</h2>');
    }

    const nomeAttivita = results[0].nome;

    res.send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Gestionale Edicola</title>
        <link rel="stylesheet" href="style.css">
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(to right, #e3f2fd, #bbdefb);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 90%;
          }
          h1 {
            font-size: 28px;
            color: #1565c0;
            margin-bottom: 10px;
          }
          .sottotitolo {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
          }
          .menu {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }
          .card {
            background-color: #1976d2;
            color: white;
            text-decoration: none;
            padding: 20px 30px;
            border-radius: 8px;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: background-color 0.3s ease, transform 0.2s ease;
          }
          .card:hover {
            background-color: #1565c0;
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📋 Benvenuto, ${nomeAttivita}</h1>
          <p class="sottotitolo">Scegli una sezione per iniziare</p>
          <div class="menu">
            <a href="bolle.html" class="card">📦 Bolle</a>
            <a href="vendite.html" class="card">💰 Vendita</a>
            <a href="edicole.html" class="card">🏪 Gestione edicola</a>
            <a href="magazzino.html" class="card">🗃️ Magazzino</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });
});

// REGISTRAZIONE UTENTE
app.post('/registrazione', (req, res) => {
  const { username, password, nome, email } = req.body;

  db.query(
    'INSERT INTO utenti (username, password, nome, email, approvato) VALUES (?, ?, ?, ?, false)',
    [username, password, nome, email],
    (err, result) => {
      if (err) {
        console.error('❌ Errore nella registrazione:', err);
        return res.status(500).send('Errore nella registrazione');
      }
      res.json({ success: true, messaggio: 'Registrazione inviata. Attendi approvazione.' });
    }
  );
});

// LOGIN ADMIN
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'segreto123') {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, messaggio: 'Credenziali non valide' });
  }
});

// PROTEZIONE PAGINA ADMIN
app.get('/admin.html', (req, res) => {
  if (req.session && req.session.admin) {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.redirect('/admin-login.html');
  }
});

// 🕵️‍♂️ UTENTI IN ATTESA
app.get('/admin/utenti-pending', (req, res) => {
  db.query('SELECT * FROM utenti WHERE approvato = false', (err, results) => {
    if (err) {
      console.error('❌ Errore nel recupero utenti pending:', err);
      return res.status(500).send('Errore');
    }
    res.json(results);
  });
});


// APPROVAZIONE UTENTE
app.post('/admin/approva', (req, res) => {
  const { username } = req.body;
  db.query('UPDATE utenti SET approvato = true WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.error('❌ Errore nell’approvazione utente:', err);
      return res.status(500).send('Errore');
    }
    res.json({ success: true, messaggio: 'Utente approvato' });
  });
});

// PUBBLICAZIONI
app.get('/pubblicazioni', (req, res) => {
  db.query('SELECT * FROM pubblicazioni', (err, results) => {
    if (err) {
      console.error('❌ Errore nella query pubblicazioni:', err);
      return res.status(500).send('Errore');
    }
    res.json(results);
  });
});

app.post('/pubblicazioni', (req, res) => {
  const { titolo, tipo, editore, prezzo, id_distributore } = req.body;
  db.query(
    'INSERT INTO pubblicazioni (titolo, tipo, editore, prezzo, id_distributore) VALUES (?, ?, ?, ?, ?)',
    [titolo, tipo, editore, prezzo, id_distributore],
    (err, result) => {
      if (err) {
        console.error('❌ Errore nell’inserimento pubblicazione:', err);
        return res.status(500).send('Errore');
      }
      res.json({ id: result.insertId, messaggio: 'Pubblicazione aggiunta con successo' });
    }
  );
});

// DISTRIBUTORI
app.get('/distributori', (req, res) => {
  db.query('SELECT * FROM distributori', (err, results) => {
    if (err) {
      console.error('❌ Errore nel recupero distributori:', err);
      return res.status(500).send('Errore');
    }
    res.json(results);
  });
});

app.post('/distributori', (req, res) => {
  const { nome, contatto, telefono } = req.body;
  db.query(
    'INSERT INTO distributori (nome, contatto, telefono) VALUES (?, ?, ?)',
    [nome, contatto, telefono],
    (err, result) => {
      if (err) {
        console.error('❌ Errore nell’inserimento distributore:', err);
        return res.status(500).send('Errore');
      }
      res.json({ id: result.insertId, messaggio: 'Distributore aggiunto' });
    }
  );
});

// REGISTRAZIONE ATTIVITÀ
app.post('/edicole', (req, res) => {
  const { nome, indirizzo, città, provincia, telefono, email, referente } = req.body;
  const idUtente = req.session.utente?.id;

  if (!idUtente) {
    return res.status(401).json({ success: false, messaggio: 'Utente non autenticato' });
  }

  db.query(
    'INSERT INTO edicole (nome, indirizzo, città, provincia, telefono, email, referente, id_utente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, indirizzo, città, provincia, telefono, email, referente, idUtente],
    (err, result) => {
      if (err) {
        console.error('❌ Errore nell’inserimento edicola:', err);
        return res.status(500).send('Errore');
      }
      res.json({ id: result.insertId, messaggio: 'Attività registrata con successo' });
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server avviato su http://localhost:${PORT}`);
});