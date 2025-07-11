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

    const files = data
      .filter(f => f.type === 'file')
      .map(f => {
        const [timestamp, ...rest] = f.name.split('-');
        const name = rest.join('-');
        const date = new Date(Number(timestamp));
        return {
          name,
          url: `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${BRANCH}/uploads/${f.name}`,
          isImage: f.name.match(/\.(png|jpe?g|gif|webp)$/i),
          isVideo: f.name.match(/\.(mp4|webm|mov)$/i),
          date: date.toISOString()
        };
      });

    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
