require('dotenv').config();
const { sequelize, User } = require('./models');

const testDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    const users = await User.findAll();
    console.log(`📊 Tổng số users: ${users.length}`);
    
    if (users.length > 0) {
      console.log('📊 User đầu tiên:', users[0].toJSON());
    } else {
      console.log('⚠️ Không tìm thấy users nào');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

testDB();