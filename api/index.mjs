// Vercel serverless entry — dynamic import to load ESM server
export default async function handler(req, res) {
  const { default: app } = await import('../server/src/index.js');
  return app(req, res);
}
