// routes/list.js

const express = require('express');
const router = express.Router();
const { Octokit } = require('octokit');

const GH_TOKEN = process.env.GH_TOKEN;
const GH_OWNER = process.env.GH_OWNER;
const GH_REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || 'main';

const octokit = new Octokit({ auth: GH_TOKEN });

router.get('/api/list', async (req, res) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GH_OWNER,
      repo: GH_REPO,
      path: 'uploads',
      ref: BRANCH
    });

    const files = (Array.isArray(data) ? data : []).filter(f => f.type === 'file').map(f => {
      const [timestamp, ...rest] = f.name.split('-');
      const fileName = rest.join('-');
      const fileDate = new Date(Number(timestamp));

      return {
        name: fileName,
        url: f.download_url,
        isImage: /\.(jpe?g|png|webp|gif)$/i.test(f.name),
        isVideo: /\.(mp4|webm|mov)$/i.test(f.name),
        date: isNaN(fileDate) ? null : fileDate.toISOString()
      };
    });

    res.json({ ok: true, files });
  } catch (error) {
    console.error('❌ Error fetching file list:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch file list' });
  }
});

module.exports = router;
