import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformContent } from './services/GeminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serving static files from the built React app in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Multer setup for file uploads (in-memory for Cloud Run ephemeral storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Transformation Endpoint
app.post('/api/transform', upload.single('file'), async (req, res) => {
  try {
    const { profile } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const parsedProfile = JSON.parse(profile);
    const result = await transformContent(file, parsedProfile);
    
    res.json(result);
  } catch (err) {
    console.error('[AdaptiveEd Server] Transformation Error:', err);
    res.status(500).json({ error: err.message || 'Transformation failed' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fallback to React app for SPA routing in production
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AdaptiveEd Server] Listening on port ${PORT}`);
});
