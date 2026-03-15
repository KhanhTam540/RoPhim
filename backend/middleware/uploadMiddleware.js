const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Đảm bảo thư mục upload tồn tại
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
const subDirs = ['avatars', 'posters', 'videos', 'sliders']; // THÊM 'sliders'

subDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../../', uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
});

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'others';
    
    // Xác định thư mục dựa vào fieldname
    if (file.fieldname === 'avatar' || file.fieldname === 'avatars') {
      subDir = 'avatars';
    } else if (file.fieldname === 'poster' || file.fieldname === 'posters') {
      subDir = 'posters';
    } else if (file.fieldname === 'backdrop') {
      subDir = 'posters';
    } else if (file.fieldname === 'video' || file.fieldname === 'videos') {
      subDir = 'videos';
    } else if (file.fieldname === 'image') { // THÊM CHO SLIDER
      subDir = 'sliders';
    }
    
    const uploadPath = path.join(__dirname, '../../', uploadDir, subDir);
    console.log(`📁 Uploading to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log(`📁 Filename: ${filename}`);
    cb(null, filename);
  }
});

// Filter file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  console.log(`📁 File type: ${file.mimetype}, ext: ${path.extname(file.originalname)}`);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)', 400));
  }
};

// Khởi tạo upload
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter
});

// Upload single file
const uploadSingle = (fieldName) => upload.single(fieldName);

// Upload multiple files
const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

// Upload fields
const uploadFields = upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
  { name: 'image', maxCount: 1 } // THÊM CHO SLIDER
]);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};