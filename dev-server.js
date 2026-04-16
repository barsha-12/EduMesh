import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3010;

// Standard Vercel-like middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Dynamically routes requests to files in the api/ directory
 */
app.use('/api', async (req, res) => {
  const relPath = req.path.replace(/^\//, '');
  const possiblePaths = [
    path.join(__dirname, 'api', relPath + '.js'),
    path.join(__dirname, 'api', relPath, 'index.js'),
    path.join(__dirname, 'api', relPath)
  ];

  let filePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    console.log(`[API] 404 - Not Found: ${req.path}`);
    return res.status(404).json({ error: `Not Found: ${req.path}` });
  }

  try {
    // Force cache bust to ensure fresh code on every request in dev
    const modulePath = `file://${filePath}?update=${Date.now()}`;
    const { default: handler } = await import(modulePath);

    if (typeof handler !== 'function') {
      throw new Error(`The file at ${relPath} does not export a default function.`);
    }

    console.log(`[API] ${req.method} ${req.path}`);
    
    // Call the Vercel-style handler
    await handler(req, res);
  } catch (err) {
    console.error(`[API] Error in ${req.path}:`, err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`
  🚀 EduMesh API Mock Server
  -------------------------
  Listening on: http://localhost:${PORT}
  Mapping: /api/* -> ./api/*.js
  `);
});
