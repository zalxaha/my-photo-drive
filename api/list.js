const express = require('express');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const router = express.Router();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

router.get('/', async (req, res) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: process.env.GH_OWNER,
      repo: process.env.GH_REPO,
      path: 'uploads',
      ref: process.env.GH_BRANCH
    });

    const files = (Array.isArray(data) ? data : []).map(f => ({
      name: f.name,
      url: `/api/media/${f.name}`,
      isImage: f.name.match(/\.(jpg|jpeg|png|webp)$/i),
      isVideo: f.name.match(/\.(mp4|mov|webm)$/i)
    }));

    res.json({ ok: true, files });
  } catch (err) {
    res.json({ ok: false, error: `${err.status} - ${err.response?.data?.documentation_url || err.message}` });
  }
});

module.exports = router;
