const { Octokit } = require('@octokit/rest');
const sanitize = require('sanitize-filename');
const formidable = require('formidable-serverless');
const fs = require('fs');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const { GH_OWNER, GH_REPO } = process.env;
const BRANCH = process.env.GH_BRANCH || 'main';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = new formidable.IncomingForm();
  form.maxFileSize = 10 * 1024 * 1024;

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) return res.status(400).json({ error: err.message });

      const file = files.file;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });

      const buffer = fs.readFileSync(file.path);
      const base64 = buffer.toString('base64');
      const safeName = `${Date.now()}-${sanitize(file.name)}`;

      await octokit.repos.createOrUpdateFileContents({
        owner: GH_OWNER,
        repo: GH_REPO,
        path: `uploads/${safeName}`,
        message: `upload ${safeName}`,
        content: base64,
        branch: BRANCH,
        committer: { name: 'Upload Bot', email: 'bot@example.com' }
      });

      res.status(200).json({
        ok: true,
        url: `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${BRANCH}/uploads/${safeName}`
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
};
