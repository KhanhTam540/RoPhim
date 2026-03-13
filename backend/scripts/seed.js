require('dotenv').config();
const { sequelize, Genre, Country, User, Actor, Director } = require('../models');
const bcrypt = require('bcryptjs');
const slugify = require('../utils/slugify');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Đồng bộ database thành công');

    // Seed genres
    const genres = await Genre.bulkCreate([
      { name: 'Hành động', description: 'Phim hành động kịch tính' },
      { name: 'Tình cảm', description: 'Phim tình cảm lãng mạn' },
      { name: 'Hài hước', description: 'Phim hài hước vui nhộn' },
      { name: 'Kinh dị', description: 'Phim kinh dị rùng rợn' },
      { name: 'Viễn tưởng', description: 'Phim khoa học viễn tưởng' },
      { name: 'Hoạt hình', description: 'Phim hoạt hình' },
      { name: 'Cổ trang', description: 'Phim cổ trang' },
      { name: 'Tâm lý', description: 'Phim tâm lý xã hội' },
      { name: 'Hình sự', description: 'Phim hình sự' },
      { name: 'Chiến tranh', description: 'Phim chiến tranh' }
    ]);
    console.log('✅ Đã tạo genres');

    // Seed countries
    const countries = await Country.bulkCreate([
      { name: 'Việt Nam', code: 'VN', slug: slugify('Việt Nam') },
      { name: 'Hàn Quốc', code: 'KR', slug: slugify('Hàn Quốc') },
      { name: 'Nhật Bản', code: 'JP', slug: slugify('Nhật Bản') },
      { name: 'Trung Quốc', code: 'CN', slug: slugify('Trung Quốc') },
      { name: 'Thái Lan', code: 'TH', slug: slugify('Thái Lan') },
      { name: 'Mỹ', code: 'US', slug: slugify('Mỹ') },
      { name: 'Anh', code: 'GB', slug: slugify('Anh') },
      { name: 'Pháp', code: 'FR', slug: slugify('Pháp') },
      { name: 'Ấn Độ', code: 'IN', slug: slugify('Ấn Độ') },
      { name: 'Đài Loan', code: 'TW', slug: slugify('Đài Loan') }
    ]);
    console.log('✅ Đã tạo countries');

    // Seed actors
    const actors = await Actor.bulkCreate([
      { name: 'Lý Liên Kiệt', nationality: 'Trung Quốc', bio: 'Diễn viên võ thuật nổi tiếng' },
      { name: 'Thành Long', nationality: 'Trung Quốc', bio: 'Diễn viên, đạo diễn nổi tiếng' },
      { name: 'Châu Tinh Trì', nationality: 'Trung Quốc', bio: 'Diễn viên hài, đạo diễn' }
    ]);
    console.log('✅ Đã tạo actors');

    // Seed directors
    const directors = await Director.bulkCreate([
      { name: 'Lý An', nationality: 'Đài Loan', bio: 'Đạo diễn từng đoạt Oscar' },
      { name: 'Trương Nghệ Mưu', nationality: 'Trung Quốc', bio: 'Đạo diễn nổi tiếng' },
      { name: 'Phùng Tiểu Cương', nationality: 'Trung Quốc', bio: 'Đạo diễn, diễn viên' }
    ]);
    console.log('✅ Đã tạo directors');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@rophim.is',
      password: adminPassword,
      fullName: 'Administrator',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    console.log('✅ Đã tạo admin user');

    console.log('🎉 Seed database thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed database:', error);
    process.exit(1);
  }
};

seedDatabase();