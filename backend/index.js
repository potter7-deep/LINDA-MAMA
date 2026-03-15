import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Force database initialization before routes
import './config/database.js';

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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting - General API
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: { 
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health',
});

// Rate limiting - Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10, // Limit to 10 requests per 15 minutes for auth
  message: { 
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Trust proxy for Render/Cloudflare (rate-limit X-Forwarded-For)
app.set('trust proxy', 1);

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Standardized API response wrapper
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data, ...args) => {
    // Don't wrap if:
    // 1. Response already has success field (already wrapped)
    // 2. Response has error/message (error responses from error handler)
    // 3. Data is an array (lists should not be wrapped)
    // 4. Data is null/undefined
    if (data?.success !== undefined || data?.error || data?.message || Array.isArray(data) || data === null || data === undefined) {
      return originalJson(data, ...args);
    }
    // Wrap successful responses (objects only)
    return originalJson({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }, ...args);
  };
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pregnancy', pregnancyRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/immunization', immunizationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/exercise', exerciseRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'Linda Mama API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    code: 'NOT_FOUND'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    error: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED'
    });
  }
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'Resource already exists or violates database constraints',
      code: 'CONSTRAINT_VIOLATION'
    });
  }

  if (err.message === 'Invalid JSON') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid JSON in request body',
      code: 'INVALID_JSON'
    });
  }
  
  // Default server error
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message,
    code: statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR',
    requestId: req.id
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

app.listen(PORT, '0.0.0.0', () => {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          🏥 Linda Mama Backend Server                               ║
╠════════════════════════════════════════════════════════════════════╣
║  Server running on port: ${PORT}                                    ║
║  Environment: ${mode}                                              ║
║  Health check: http://localhost:${PORT}/api/health                 ║
╚════════════════════════════════════════════════════════════════════╝
  `);
});



