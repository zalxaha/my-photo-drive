const express = require('express');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const router = express.Router();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GH_OWNER = process.env.GH_OWNER;
const GH_REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || 'main';

router.get('/api/list', async (req, res) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GH_OWNER,
      repo: GH_REPO,
      path: 'uploads',
      ref: BRANCH
    });

    const files = await Promise.all(
      data
        .filter(f => f.type === 'file')
        .map(async (f) => {
          const [timestamp, ...rest] = f.name.split('-');
          const name = rest.join('-') || f.name;
          const tsNumber = Number(timestamp);
          const isValid = !isNaN(tsNumber) && tsNumber > 1e12;

          // Buat URL file dari GitHub API dengan header Authorization nanti di fetch frontend
          const apiUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/uploads/${f.name}?ref=${BRANCH}`;

          return {
            name,
            url: apiUrl,
            isImage: f.name.match(/\.(png|jpe?g|gif|webp)$/i),
            isVideo: f.name.match(/\.(mp4|webm|mov)$/i),
            date: isValid ? new Date(tsNumber).toISOString() : null
          };
        })
    );

    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
