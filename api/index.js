const express = require('express');
const app = express();
app.set('trust proxy', 1); // For Vercel proxy headers

const upload = require('./upload');
const list = require('./list');
const media = require('./media');

app.use('/api/upload', upload);
app.use('/api/list', list);
app.use('/api/media', media);
app.use(express.static('public'));

module.exports = app;
