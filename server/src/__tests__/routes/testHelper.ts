/**
 * Shared test helper for route tests.
 * Creates a minimal Express app with mocked auth middleware and JSON body parser.
 */
import express from 'express';
import cookieParser from 'cookie-parser';

export const TEST_AUTH = {
  accountId: 1,
  tenantSchemaName: 'usr_1_a1b2c3',
  sessionId: 42,
  selector: 'aabbccddee11',
};

/**
 * Creates a test Express app with:
 *  - JSON body parser
 *  - Cookie parser
 *  - Mocked auth (injected via middleware)
 *  - The given router mounted at the given path
 *
 * @param path  Mount path (e.g. '/api/entries')
 * @param router  Express router to mount
 * @param options.skipAuth  If true, don't inject req.auth (for testing public routes)
 */
export function createTestApp(
  path: string,
  router: express.Router,
  options: { skipAuth?: boolean } = {},
) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  if (!options.skipAuth) {
    // Inject fake auth on every request
    app.use((req, _res, next) => {
      req.auth = { ...TEST_AUTH };
      next();
    });
  }

  app.use(path, router);

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
