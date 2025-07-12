const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const uploadHandler = require('./api/upload');
const listHandler = require('./api/list');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const USERNAME = process.env.LOGIN_USER || 'vinx';
const PASSWORD = process.env.LOGIN_PASS || '123456';

// Basic Auth middleware
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return unauthorized(res);

  const [scheme, base64] = auth.split(' ');
  if (scheme !== 'Basic') return unauthorized(res);

  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
  if (user === USERNAME && pass === PASSWORD) return next();

  return unauthorized(res);
});

function unauthorized(res) {
  res.set('WWW-Authenticate', 'Basic realm="Login Required"');
  return res.status(401).send('Authentication required.');
}

// API routes
app.use('/api/upload', uploadHandler);
app.use('/api/list', listHandler);

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
});
