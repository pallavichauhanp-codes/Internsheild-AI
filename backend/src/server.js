import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Modules
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import analyzeRoutes from './routes/analyzeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Secure CORS Configuration
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests with no origin, or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Body & Cookie Parsing Middlewares
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// 3. Rate Limiting Middleware
app.use('/api/', generalLimiter);

// 4. Health Check & Diagnostics Endpoint
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'online',
    service: 'InternShield AI Backend API',
    database: {
      connected: isDbConnected,
      name: process.env.DB_NAME || 'internshield_ai'
    },
    aiProvider: {
      configured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
      model: 'gemini-1.5-flash',
      fallbackReady: true
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 5. Mount Application Endpoints
app.use('/api/auth', authRoutes);         // Authentication: register, login, logout, me
app.use('/api/scans', scanRoutes);       // Scans: analyze, history, :id, delete
app.use('/api/reports', reportRoutes);   // Reports: create, list, :id, update, delete
app.use('/api/dashboard', dashboardRoutes); // Dashboard: stats
app.use('/api/admin', adminRoutes);       // Admin: stats, reports, :id/status
app.use('/api/verify', verifyRoutes);     // Domain verification lookup
app.use('/api/saved', savedRoutes);       // Saved bookmarks
app.use('/api/analyze', analyzeRoutes);   // Legacy scan compatibility

// 6. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`
  });
});

// 7. Centralized Error Handling Middleware
app.use(errorHandler);

// 8. Server Boot
app.listen(PORT, async () => {
  console.log(`\n🛡️  =================================================`);
  console.log(`🛡️  InternShield AI Backend running on port ${PORT}`);
  console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  =================================================\n`);
  
  // Asynchronously test MySQL connection on boot
  await testConnection();
});

export default app;
