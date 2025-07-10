const express = require('express');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const router = express.Router();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

router.get('/:filename', async (req, res) => {
  const filename = req.params.filename;
  const ext = filename.split('.').pop().toLowerCase();

  const contentType = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm'
  }[ext] || 'application/octet-stream';

  try {
    const { data } = await octokit.repos.getContent({
      owner: process.env.GH_OWNER,
      repo: process.env.GH_REPO,
      path: `uploads/${filename}`,
      ref: process.env.GH_BRANCH
    });

    const buffer = Buffer.from(data.content, 'base64');
    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (err) {
    res.status(404).send('File not found.');
  }
});

module.exports = router;
