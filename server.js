const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const uploadHandler = require('./api/upload');
const listHandler = require('./api/list');

const app = express();
const PORT = process.env.PORT || 3000;

// Ganti sesuai keinginan
const USERNAME = process.env.LOGIN_USER || 'vinx';
const PASSWORD = process.env.LOGIN_PASS || '123456';

// Session setup
app.use(session({
  secret: 'rahasia-sesi-anda',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Middleware proteksi login
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  if (req.path === '/login' || req.path === '/login.html' || req.path === '/logout') return next();
  return res.redirect('/login.html');
}

// Route login (GET form)
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route login (POST proses login)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;
    return res.redirect('/');
  }
  return res.send('Login gagal. <a href="/login.html">Coba lagi</a>');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Lindungi semua route setelah ini
app.use(requireLogin);

// API routes
app.use('/api/upload', uploadHandler);
app.use('/api/list', listHandler);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
