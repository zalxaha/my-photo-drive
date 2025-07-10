const express  = require('express');
const multer   = require('multer');
const { Octokit } = require('@octokit/rest');
const sanitize = require('sanitize-filename');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ⬇️ beri tahu Express soal proxy
app.set('trust proxy', 1);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },    // 10 MB
  fileFilter(_, file, cb) {
    const ok = /image\/|video\//.test(file.mimetype);
    cb(ok ? null : new Error('File type not allowed'), ok);
  }
});

// Rate-limiter
app.use(rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
}));

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const { GH_OWNER, GH_REPO } = process.env;
const BRANCH = process.env.GH_BRANCH || 'main';

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const safeName = `${Date.now()}-${sanitize(req.file.originalname)}`;
    const content  = req.file.buffer.toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: GH_OWNER,
      repo: GH_REPO,
      path: `uploads/${safeName}`,
      message: `upload ${safeName}`,
      content,
      branch: BRANCH,
      committer: { name: 'Upload Bot', email: 'bot@example.com' }
    });

    res.json({
      ok: true,
      url: `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${BRANCH}/uploads/${safeName}`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// daftar file
const listRoute = require('./list');
app.use(listRoute);

module.exports = app;
