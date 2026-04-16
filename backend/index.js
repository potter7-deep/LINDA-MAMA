import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import db from './config/database.js'; // Import DB early for health

// Load environment variables
dotenv.config();

console.log('[Startup] Database module loaded');
console.log('[Startup] Environment:', process.env.NODE_ENV);
console.log('[Startup] PORT:', process.env.PORT || 3000);
console.log('[Startup] DB_PATH:', process.env.DB_PATH);
console.log('[Startup] CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Routes imports
import authRoutes from './routes/auth.js';
import pregnancyRoutes from './routes/pregnancy.js';
import nutritionRoutes from './routes/nutrition.js';
import immunizationRoutes from './routes/immunization.js';
import emergencyRoutes from './routes/emergency.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import exerciseRoutes from './routes/exercise.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  skip: (req) => req.path === '/api/health',
});

app.use('/api/', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check FIRST - before any routes/static!
app.get('/api/health', (req, res) => {
  try {
    const dbTest = db.prepare('SELECT 1 as healthy').get();
    res.json({ 
      status: 'healthy', 
      service: 'Linda Mama API',
      dbHealthy: dbTest.healthy === 1
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', dbHealthy: false });
  }
});

console.log('[Startup] All API routes mounting...');

// API Routes (all /api/*)
app.use('/api/auth', authRoutes);
app.use('/api/pregnancy', pregnancyRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/immunization', immunizationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/exercise', exerciseRoutes);

console.log('[Startup] API routes mounted ✅');

// Production: Serve frontend static + SPA catch-all (AFTER API routes!)
if (NODE_ENV === 'production') {
  app.use(express.static('public'));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
    res.sendFile('public/index.html', { root: './' });
  });
}

// 404 for APIs
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║          🏥 Linda Mama Backend Server              ║`);
  console.log(`╠════════════════════════════════════════════════════╣`);
  console.log(`║  Port: ${PORT}                                     ║`);
  console.log(`║  Env: ${NODE_ENV}                                   ║`);
  console.log(`║  Health: http://localhost:${PORT}/api/health      ║`);
  console.log(`╚════════════════════════════════════════════════════╝\n`);
});
