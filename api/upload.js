const multer = require('multer');
const sanitize = require('sanitize-filename');
const express = require('express');
const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter(_, file, cb) {
    const ok = /image\/|video\//.test(file.mimetype);
    cb(ok ? null : new Error('Hanya gambar/video'), ok);
  }
});

app.post(upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file' });

  const safeName = `${Date.now()}-${sanitize(req.file.originalname)}`;
  const base64 = req.file.buffer.toString('base64');

  // ✅ Balas duluan agar tidak timeout
  res.json({ status: 'proses', filename: safeName });

  // ⏳ Upload ke GitHub secara async
  fetch(`${process.env.APP_URL}/api/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: safeName, content: base64 })
  }).catch(console.error);
});

module.exports = app;
