"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_AUTH = void 0;
exports.createTestApp = createTestApp;
/**
 * Shared test helper for route tests.
 * Creates a minimal Express app with mocked auth middleware and JSON body parser.
 */
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.TEST_AUTH = {
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
function createTestApp(path, router, options = {}) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    if (!options.skipAuth) {
        // Inject fake auth on every request
        app.use((req, _res, next) => {
            req.auth = { ...exports.TEST_AUTH };
            next();
        });
    }
    app.use(path, router);
    // Error handler
    app.use((err, _req, res, _next) => {
        res.status(500).json({ error: 'Internal server error' });
    });
    return app;
}
