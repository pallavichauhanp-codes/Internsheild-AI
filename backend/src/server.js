import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import scanRoutes from './routes/scanRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import authRoutes from './routes/authRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import analyzeRoutes from './routes/analyzeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with flexible localhost CORS for dev
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health & Database Diagnostics Endpoint
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'online',
    service: 'InternShield AI Backend API',
    database: {
      connected: isDbConnected,
      name: process.env.DB_NAME || 'internshield_ai'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);         // POST /api/auth/register, /api/auth/login
app.use('/api/scans', scanRoutes);       // POST /api/scans/analyze
app.use('/api/reports', reportRoutes);   // GET/POST /api/reports
app.use('/api/saved', savedRoutes);       // POST /api/saved, GET /api/saved/:userId
app.use('/api/verify', verifyRoutes);     // GET /api/verify/domain
app.use('/api/analyze', analyzeRoutes);   // Legacy POST /api/analyze

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
  console.log(`🛡️  Database Target: ${process.env.DB_NAME || 'internshield_ai'}`);
  console.log(`🛡️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  =================================================\n`);
  
  // Test MySQL connection asynchronously on boot
  await testConnection();
});
