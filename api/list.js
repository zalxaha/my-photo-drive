const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GH_OWNER = process.env.GH_OWNER;
const GH_REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || 'main';

module.exports = async (req, res) => {
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
        const name = rest.join('-') || f.name;
        const tsNumber = Number(timestamp);
        const isValid = !isNaN(tsNumber) && tsNumber > 1e12;

        return {
          name,
          url: `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${BRANCH}/uploads/${f.name}`,
          isImage: f.name.match(/\.(png|jpe?g|gif|webp)$/i),
          isVideo: f.name.match(/\.(mp4|webm|mov)$/i),
          date: isValid ? new Date(tsNumber).toISOString() : null
        };
      });

    res.status(200).json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
