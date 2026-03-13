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

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/genres', require('./routes/genreRoutes'));
app.use('/api/countries', require('./routes/countryRoutes'));
app.use('/api/actors', require('./routes/actorRoutes'));
app.use('/api/directors', require('./routes/directorRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/home', require('./routes/homeRoutes'));

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Không tìm thấy đường dẫn ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;