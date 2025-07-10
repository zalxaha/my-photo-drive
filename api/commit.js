const express = require('express');
const { Octokit } = require('@octokit/rest');

const app = express();
app.use(express.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.post(async (req, res) => {
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GH_OWNER,
      repo: process.env.GH_REPO,
      path: `uploads/${name}`,
      message: `Upload ${name}`,
      content,
      branch: process.env.GH_BRANCH || 'main',
      committer: {
        name: 'Upload Bot',
        email: 'bot@example.com'
      }
    });

    res.json({ ok: true, message: `Upload ${name} berhasil` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
