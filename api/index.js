const app = require('../server/dist-vercel/index.js');

module.exports = app.default || app;
