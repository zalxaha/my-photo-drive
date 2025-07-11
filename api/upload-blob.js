const { Octokit } = require('@octokit/rest');
const sanitize = require('sanitize-filename');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GH_OWNER = process.env.GH_OWNER;
const GH_REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || 'main';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, content, mimetype } = req.body;

    if (!filename || !content || !mimetype) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const MAX_BASE64_SIZE = 100 * 1024 * 1024;
    if (content.length > MAX_BASE64_SIZE) {
      return res.status(413).json({ error: 'Base64 terlalu besar (maks ~75MB file asli)' });
    }

    const safeName = `${Date.now()}-${sanitize(filename)}`;

    await octokit.repos.createOrUpdateFileContents({
      owner: GH_OWNER,
      repo: GH_REPO,
      path: `uploads/${safeName}`,
      message: `upload ${safeName}`,
      content,
      branch: BRANCH,
      committer: {
        name: 'Upload Bot',
        email: 'bot@example.com'
      }
    });

    const fileUrl = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${BRANCH}/uploads/${safeName}`;
    res.status(200).json({ ok: true, url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
