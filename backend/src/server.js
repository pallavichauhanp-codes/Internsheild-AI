import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import analyzeRoutes from './routes/analyzeRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with flexible localhost CORS for dev
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or localhost
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'InternShield AI Backend API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/scans', scanRoutes);       // POST /api/scans/analyze
app.use('/api/analyze', analyzeRoutes);   // Legacy POST /api/analyze
app.use('/api/verify', verifyRoutes);     // GET /api/verify/domain
app.use('/api/reports', reportRoutes);   // GET/POST /api/reports

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🛡️  =================================================`);
  console.log(`🛡️  InternShield AI Backend running on port ${PORT}`);
  console.log(`🛡️  Scans Endpoint: http://localhost:${PORT}/api/scans/analyze`);
  console.log(`🛡️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  =================================================\n`);
  
  // Test MySQL connection asynchronously on boot
  await testConnection();
});
