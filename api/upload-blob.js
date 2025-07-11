const express = require('express');
const multer = require('multer');
const { Octokit } = require('@octokit/rest');
const sanitize = require('sanitize-filename');
require('dotenv').config();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 75 * 1024 * 1024 } });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const { GH_OWNER, GH_REPO } = process.env;
const BRANCH = process.env.GH_BRANCH || 'main';

router.post('/api/upload-blob', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const safeName = `${Date.now()}-${sanitize(req.file.originalname)}`;
    const content = req.file.buffer.toString('base64');

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

module.exports = router;
