import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

// Use in-memory storage for tests
process.env.NODE_ENV = 'test';
// Provide a dummy DATABASE_URL to satisfy db initialization
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
// Provide dummy Replit domains for auth setup
process.env.REPLIT_DOMAINS = 'example.com';
process.env.SESSION_SECRET = 'secret';

// Import storage using test environment
const { storage } = await import('./storage');
// Switch to development to avoid auth network calls
process.env.NODE_ENV = 'development';
const { registerRoutes } = await import('./routes');

test('GET /api/documents/:documentId/characters uses document\'s project', async () => {
  const app = express();
  app.use(express.json());
  await registerRoutes(app);
  const server = app.listen(0);
  const port = (server.address() as any).port;

  // Create a character for the default project's chapter
  await storage.createCharacter({
    name: 'Test Character',
    projectId: 'default-project',
    role: null,
    age: null,
    appearance: null,
    traits: null,
    relationships: null,
    lastMentioned: null,
  });

  const res = await fetch(`http://127.0.0.1:${port}/api/documents/default-chapter/characters`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.length, 1);
  assert.equal(body[0].name, 'Test Character');

  await new Promise(resolve => server.close(resolve));
});

test('GET /api/documents/:documentId/characters returns 404 for unknown document', async () => {
  const app = express();
  app.use(express.json());
  await registerRoutes(app);
  const server = app.listen(0);
  const port = (server.address() as any).port;

  const res = await fetch(`http://127.0.0.1:${port}/api/documents/missing/characters`);
  assert.equal(res.status, 404);

  await new Promise(resolve => server.close(resolve));
});
