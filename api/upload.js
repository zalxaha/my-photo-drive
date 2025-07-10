const express = require('express');
const multer = require('multer');
const { Octokit } = require('@octokit/rest');
const sanitize = require('sanitize-filename');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const router = express.Router();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const upload = multer({ storage: multer.memoryStorage() });

router.use(rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true
}));

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.json({ ok: false, error: 'No file uploaded' });

  const fileName = sanitize(req.file.originalname);
  const path = `uploads/${fileName}`;

  try {
    const content = req.file.buffer.toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GH_OWNER,
      repo: process.env.GH_REPO,
      path,
      message: `upload ${fileName}`,
      content,
      branch: process.env.GH_BRANCH
    });

    res.json({
      ok: true,
      name: fileName,
      url: `/api/media/${fileName}`
    });
  } catch (err) {
    res.json({ ok: false, error: `${err.status} - ${err.response?.data?.documentation_url || err.message}` });
  }
});

module.exports = router;
