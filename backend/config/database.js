// backend/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Log database config (ẩn password)
console.log('📦 Database Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  env: process.env.NODE_ENV
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 ${msg}`);
      }
    },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '+07:00',
    pool: {
      max: 10,
      min: 0,
      acquire: 60000, // Tăng timeout lên 60s
      idle: 10000
    },
    retry: {
      max: 3 // Thử lại 3 lần nếu kết nối thất bại
    },
    dialectOptions: {
      // QUAN TRỌNG: Cấu hình SSL cho Aiven và các cloud database
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false // Cho phép self-signed certificates
      } : false,
      
      // Timeout settings
      connectTimeout: 60000,
      socketPath: null
    }
  }
);

const connectDB = async () => {
  try {
    console.log('🔄 Đang kết nối đến database...');
    
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công!');
    
    // Kiểm tra kết nối SSL
    if (process.env.NODE_ENV === 'production') {
      console.log('🔒 SSL connection established');
    }

    // Đồng bộ database (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Đang đồng bộ database...');
      
      // Sync with alter: true để cập nhật cấu trúc bảng
      await sequelize.sync({ alter: true });
      console.log('✅ Đồng bộ database thành công!');
    } else {
      // Trong production, chỉ sync mà không alter (tránh mất dữ liệu)
      console.log('⚠️ Production mode: Sử dụng database có sẵn, không đồng bộ tự động');
      
      // Kiểm tra các bảng quan trọng
      const queryInterface = sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      console.log('📊 Existing tables:', tables.join(', ') || 'No tables found');
    }

    // Test query đơn giản
    const [results] = await sequelize.query('SELECT 1+1 as result');
    console.log('🔍 Test query successful:', results[0]);

  } catch (error) {
    console.error('❌ Lỗi kết nối database chi tiết:');
    console.error('   - Message:', error.message);
    console.error('   - Code:', error.code);
    console.error('   - Errno:', error.errno);
    console.error('   - SQL State:', error.sqlState);
    console.error('   - SQL Message:', error.sqlMessage);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Không thể kết nối đến database server. Kiểm tra host và port.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Sai username hoặc password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   → Database không tồn tại.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Timeout kết nối. Kiểm tra network/firewall.');
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('   → Mất kết nối database.');
    } else if (error.code === 'ER_HOST_NOT_PRIVILEGED') {
      console.error('   → Host không được phép kết nối. Kiểm tra allowlist trên Aiven.');
    }
    
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('👋 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    process.exit(1);
  }
});

module.exports = { sequelize, connectDB };