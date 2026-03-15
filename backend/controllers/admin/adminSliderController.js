const { Slider, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { deleteFile } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách slider
const getAllSliders = catchAsync(async (req, res) => {
  console.log('📦 Getting all sliders...');
  
  const sliders = await Slider.findAll({
    include: [
      { 
        model: Movie, 
        as: 'movie', 
        attributes: ['id', 'title', 'slug', 'poster', 'backdrop', 'type', 'quality', 'releaseYear', 'ratingAverage']
      }
    ],
    order: [['order', 'ASC'], ['createdAt', 'DESC']]
  });

  console.log(`📦 Found ${sliders.length} sliders`);
  
  successResponse(res, { sliders });
});

// Lấy chi tiết slider
const getSliderById = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;
  
  console.log(`📦 Getting slider with ID: ${sliderId}`);

  const slider = await Slider.findByPk(sliderId, {
    include: [
      { model: Movie, as: 'movie', attributes: ['id', 'title', 'slug', 'poster', 'backdrop'] }
    ]
  });

  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  console.log(`📦 Found slider:`, slider.toJSON());
  
  successResponse(res, { slider });
});

// Tạo slider mới
const createSlider = catchAsync(async (req, res, next) => {
  console.log('📦 Creating new slider...');
  console.log('📦 Body:', req.body);
  console.log('📦 File:', req.file);

  const { title, movieId, link, order, description, buttonText, isActive } = req.body;

  if (!req.file) {
    return next(new AppError('Vui lòng upload ảnh slider', 400));
  }

  // Xử lý đường dẫn ảnh
  const imagePath = req.file.path.replace(/\\/g, '/');
  // Lấy đường dẫn tương đối từ thư mục uploads
  const relativePath = imagePath.includes('uploads') 
    ? imagePath.substring(imagePath.indexOf('uploads'))
    : imagePath;

  console.log('📦 Image path:', relativePath);

  // Kiểm tra movieId nếu có
  if (movieId) {
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      deleteFile(relativePath);
      return next(new AppError('Không tìm thấy phim', 404));
    }
  }

  // Tìm order lớn nhất để đặt order mới nếu không có
  let finalOrder = order;
  if (!finalOrder && finalOrder !== 0) {
    const maxOrder = await Slider.max('order');
    finalOrder = (maxOrder || 0) + 1;
  }

  const slider = await Slider.create({
    title: title || '',
    image: relativePath,
    movieId: movieId || null,
    link: link || '',
    order: parseInt(finalOrder) || 0,
    description: description || '',
    buttonText: buttonText || 'Xem ngay',
    isActive: isActive === 'true' || isActive === true
  });

  console.log('📦 Created slider:', slider.toJSON());

  // Lấy slider với thông tin movie
  const createdSlider = await Slider.findByPk(slider.id, {
    include: [
      { model: Movie, as: 'movie', attributes: ['id', 'title', 'slug', 'poster'] }
    ]
  });

  successResponse(res, { slider: createdSlider }, 'Tạo slider thành công', 201);
});

// Cập nhật slider
const updateSlider = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;
  console.log(`📦 Updating slider ${sliderId}...`);
  console.log('📦 Body:', req.body);
  console.log('📦 File:', req.file);

  const updateData = { ...req.body };

  const slider = await Slider.findByPk(sliderId);
  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  // Xử lý ảnh mới nếu có
  if (req.file) {
    // Xóa ảnh cũ
    if (slider.image) {
      deleteFile(slider.image);
    }
    
    // Xử lý đường dẫn ảnh mới
    const imagePath = req.file.path.replace(/\\/g, '/');
    const relativePath = imagePath.includes('uploads') 
      ? imagePath.substring(imagePath.indexOf('uploads'))
      : imagePath;
    
    updateData.image = relativePath;
  }

  // Kiểm tra movieId nếu có
  if (updateData.movieId) {
    const movie = await Movie.findByPk(updateData.movieId);
    if (!movie) {
      return next(new AppError('Không tìm thấy phim', 404));
    }
  }

  // Xử lý các trường
  if (updateData.order) updateData.order = parseInt(updateData.order);
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
  }

  await slider.update(updateData);

  console.log('📦 Updated slider');

  const updatedSlider = await Slider.findByPk(sliderId, {
    include: [{ model: Movie, as: 'movie', attributes: ['id', 'title', 'slug', 'poster'] }]
  });

  successResponse(res, { slider: updatedSlider }, 'Cập nhật slider thành công');
});

// Xóa slider
const deleteSlider = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;
  console.log(`📦 Deleting slider ${sliderId}...`);

  const slider = await Slider.findByPk(sliderId);
  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  // Xóa file ảnh
  if (slider.image) {
    deleteFile(slider.image);
  }

  await slider.destroy();

  console.log('📦 Deleted slider');
  successResponse(res, null, 'Xóa slider thành công');
});

// Sắp xếp thứ tự slider
const reorderSliders = catchAsync(async (req, res, next) => {
  const { sliders } = req.body;
  console.log('📦 Reordering sliders:', sliders);

  if (!Array.isArray(sliders)) {
    return next(new AppError('Dữ liệu không hợp lệ', 400));
  }

  for (const item of sliders) {
    await Slider.update(
      { order: item.order },
      { where: { id: item.id } }
    );
  }

  console.log('📦 Reordered sliders');
  successResponse(res, null, 'Cập nhật thứ tự thành công');
});

// Kích hoạt/ vô hiệu hóa slider
const toggleSliderStatus = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;
  const { isActive } = req.body;
  
  console.log(`📦 Toggling slider ${sliderId} status to:`, isActive);

  const slider = await Slider.findByPk(sliderId);
  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  slider.isActive = isActive;
  await slider.save();

  console.log('📦 Toggled status');
  successResponse(res, { slider }, isActive ? 'Đã kích hoạt slider' : 'Đã vô hiệu hóa slider');
});

module.exports = {
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
  toggleSliderStatus
};