require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Kết nối database
connectDB().then(() => {
  // Start server
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server đang chạy trên port ${PORT}`);
    logger.info(`📝 Môi trường: ${process.env.NODE_ENV}`);
    logger.info(`🔗 API: http://localhost:${PORT}/api`);
  });

  // Xử lý unhandled rejections
  process.on('unhandledRejection', (err) => {
    logger.error('❌ UNHANDLED REJECTION:', err);
    server.close(() => process.exit(1));
  });

  // Xử lý SIGTERM
  process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('💤 Process terminated');
    });
  });
});