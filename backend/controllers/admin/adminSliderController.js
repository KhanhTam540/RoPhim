const { Slider, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { deleteFile } = require('../../utils/helpers');

// Lấy danh sách slider
const getAllSliders = catchAsync(async (req, res) => {
  const sliders = await Slider.findAll({
    include: [
      { 
        model: Movie, 
        as: 'movie', 
        attributes: ['id', 'title', 'slug', 'poster']
      }
    ],
    order: [['order', 'ASC']]
  });

  successResponse(res, { sliders });
});

// Lấy chi tiết slider
const getSliderById = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;

  const slider = await Slider.findByPk(sliderId, {
    include: [
      { model: Movie, as: 'movie', attributes: ['id', 'title', 'slug'] }
    ]
  });

  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  successResponse(res, { slider });
});

// Tạo slider mới
const createSlider = catchAsync(async (req, res, next) => {
  const { title, movieId, link, order, description } = req.body;

  if (!req.file) {
    return next(new AppError('Vui lòng upload ảnh slider', 400));
  }

  const imagePath = req.file.path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');

  // Kiểm tra movieId nếu có
  if (movieId) {
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      deleteFile(imagePath);
      return next(new AppError('Không tìm thấy phim', 404));
    }
  }

  const slider = await Slider.create({
    title,
    image: imagePath,
    movieId: movieId || null,
    link: link || '',
    order: order || 0,
    description
  });

  successResponse(res, { slider }, 'Tạo slider thành công', 201);
});

// Cập nhật slider
const updateSlider = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;
  const updateData = req.body;

  const slider = await Slider.findByPk(sliderId);
  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  if (req.file) {
    if (slider.image) deleteFile(slider.image);
    updateData.image = req.file.path.replace(/\\/g, '/').replace(/^.*?uploads/, 'uploads');
  }

  if (updateData.movieId) {
    const movie = await Movie.findByPk(updateData.movieId);
    if (!movie) {
      return next(new AppError('Không tìm thấy phim', 404));
    }
  }

  await slider.update(updateData);

  const updatedSlider = await Slider.findByPk(sliderId, {
    include: [{ model: Movie, as: 'movie', attributes: ['id', 'title', 'slug'] }]
  });

  successResponse(res, { slider: updatedSlider }, 'Cập nhật slider thành công');
});

// Xóa slider
const deleteSlider = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;

  const slider = await Slider.findByPk(sliderId);
  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  if (slider.image) deleteFile(slider.image);
  await slider.destroy();

  successResponse(res, null, 'Xóa slider thành công');
});

// Sắp xếp thứ tự slider
const reorderSliders = catchAsync(async (req, res, next) => {
  const { sliders } = req.body; // [{ id, order }]

  if (!Array.isArray(sliders)) {
    return next(new AppError('Dữ liệu không hợp lệ', 400));
  }

  for (const item of sliders) {
    await Slider.update(
      { order: item.order },
      { where: { id: item.id } }
    );
  }

  successResponse(res, null, 'Cập nhật thứ tự thành công');
});

// Kích hoạt/ vô hiệu hóa slider
const toggleSliderStatus = catchAsync(async (req, res, next) => {
  const { sliderId } = req.params;
  const { isActive } = req.body;

  const slider = await Slider.findByPk(sliderId);
  if (!slider) {
    return next(new AppError('Không tìm thấy slider', 404));
  }

  slider.isActive = isActive;
  await slider.save();

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