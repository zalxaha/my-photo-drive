const express = require('express');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const router = express.Router();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GH_OWNER = process.env.GH_OWNER;
const GH_REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || 'main';

// GET /api/list — menampilkan file di folder uploads
router.get('/api/list', async (req, res) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GH_OWNER,
      repo: GH_REPO,
      path: 'uploads',
      ref: BRANCH
    });

    const files = await Promise.all(data
      .filter(f => f.type === 'file')
      .map(async f => {
        const commit = await octokit.repos.listCommits({
          owner: GH_OWNER,
          repo: GH_REPO,
          path: `uploads/${f.name}`,
          per_page: 1
        });

        return {
          name: f.name,
          url: `/api/image/${f.name}`, // pakai proxy
          isImage: f.name.match(/\.(png|jpe?g|gif|webp)$/i),
          isVideo: f.name.match(/\.(mp4|webm|mov)$/i),
          date: commit.data[0]?.commit?.committer?.date || null
        };
      }));

    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/image/:name — proxy untuk tampilkan file dari repo private
router.get('/api/image/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const { data } = await octokit.repos.getContent({
      owner: GH_OWNER,
      repo: GH_REPO,
      path: `uploads/${name}`,
      ref: BRANCH
    });

    const buffer = Buffer.from(data.content, 'base64');
    const ext = name.split('.').pop().toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
