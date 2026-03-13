require('dotenv').config();
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rophim.is';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Check if admin exists
    const existingAdmin = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [
          { email: adminEmail },
          { username: 'admin' }
        ]
      } 
    });

    if (existingAdmin) {
      console.log('⚠️ Admin đã tồn tại');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      username: 'admin',
      email: adminEmail,
      password: adminPassword,
      fullName: 'Administrator',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    console.log('✅ Tạo admin thành công:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: admin`);
    console.log(`   Password: ${adminPassword}`);
    console.log('⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo admin:', error);
    process.exit(1);
  }
};

createAdmin();