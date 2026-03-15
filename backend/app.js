// backend/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('passport');
require('./config/passport');

const { errorHandler } = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ==================== CORS CONFIGURATION - SỬA QUAN TRỌNG ====================
const allowedOrigins = [
  // Local development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  
  // Production frontend
  'https://rophim-onrender.com',
  'https://www.rophim-onrender.com',
  'http://rophim-onrender.com',
  
  // Backend itself (for health checks)
  'https://rophim.onrender.com',
  'http://rophim.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('🚫 Blocked origin:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Cho phép gửi cookies, authorization headers
  optionsSuccessStatus: 200 // Cho legacy browsers
}));

// Log CORS requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('🌐 Origin:', req.headers.origin);
    console.log('🔑 Method:', req.method);
    console.log('📦 URL:', req.url);
    next();
  });
}

// ==================== RATE LIMITING ====================
if (process.env.NODE_ENV === 'production') {
  // Stricter rate limiting for production
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Tăng lên 300 requests per 15 minutes
    message: { 
      success: false, 
      message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút' 
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);
  
  // Even stricter for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: { 
      success: false, 
      message: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 1 giờ' 
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth', authLimiter);
  
  console.log('✅ Rate limiting enabled in production mode');
} else {
  // Light rate limiting for development
  const devLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
  });
  app.use('/api', devLimiter);
  console.log('⚠️ Rate limiting enabled in development mode (1000 requests/15min)');
}

// ==================== BODY PARSER ====================
app.use(express.json({ limit: '50mb' })); // Tăng limit lên 50mb cho upload ảnh
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== LOGGER ====================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Custom morgan format cho production
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :remote-addr'));
}

// ==================== STATIC FILES ====================
// Phục vụ file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Thêm headers cho static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// ==================== PASSPORT ====================
app.use(passport.initialize());

// ==================== ROUTES ====================
// Public routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/genres', require('./routes/genreRoutes'));
app.use('/api/countries', require('./routes/countryRoutes'));
app.use('/api/actors', require('./routes/actorRoutes'));
app.use('/api/directors', require('./routes/directorRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/home', require('./routes/homeRoutes'));

// Protected routes (require authentication)
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Admin routes
app.use('/api/admin/auth', require('./routes/admin/adminAuthRoutes'));
app.use('/api/admin/movies', require('./routes/admin/adminMovieRoutes'));
app.use('/api/admin/genres', require('./routes/admin/adminGenreRoutes'));
app.use('/api/admin/countries', require('./routes/admin/adminCountryRoutes'));
app.use('/api/admin/actors', require('./routes/admin/adminActorRoutes'));
app.use('/api/admin/directors', require('./routes/admin/adminDirectorRoutes'));
app.use('/api/admin/users', require('./routes/admin/adminUserRoutes'));
app.use('/api/admin/sliders', require('./routes/admin/adminSliderRoutes'));
app.use('/api/admin/stats', require('./routes/admin/adminStatsRoutes'));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin || 'unknown'
    }
  });
});

// Test CORS endpoint
app.options('/test-cors', cors());
app.get('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working',
    origin: req.headers.origin
  });
});

// ==================== 404 HANDLER ====================
app.all('*', (req, res, next) => {
  next(new AppError(`Không tìm thấy đường dẫn ${req.originalUrl}`, 404));
});

// ==================== ERROR HANDLING ====================
app.use(errorHandler);

module.exports = app;