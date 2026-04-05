// Vercel serverless entry point — CJS wrapper with dynamic import for ESM server
let appPromise;

module.exports = async (req, res) => {
  if (!appPromise) {
    appPromise = import('../server/dist/index.js').then(m => m.default);
  }
  const app = await appPromise;
  return app(req, res);
};
