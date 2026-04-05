// Vercel serverless entry — dynamic import for ESM compatibility
export default async function handler(req, res) {
  const appModule = await import('../server/src/index.js');
  const app = appModule.default;
  return app(req, res);
}
