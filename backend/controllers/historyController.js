const { History, Movie, Episode } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { formatMoviesResponse, getPagination } = require('../utils/helpers');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

// Lấy lịch sử xem
const getHistory = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: histories } = await History.findAndCountAll({
    where: { userId: req.user.id },
    include: [
      { 
        model: Movie, 
        as: 'movie',
        where: { isActive: true },
        include: ['genres']
      },
      { 
        model: Episode, 
        as: 'episode',
        attributes: ['id', 'episodeNumber', 'title']
      }
    ],
    order: [['watchedAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  const historyList = histories
    .filter(h => h.movie)
    .map(h => ({
      id: h.id,
      movie: formatMoviesResponse([h.movie], req)[0],
      episode: h.episode,
      progress: h.progress,
      completed: h.completed,
      watchedAt: h.watchedAt
    }));

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    history: historyList,
    pagination
  });
});

// Thêm vào lịch sử
const addToHistory = catchAsync(async (req, res, next) => {
  const { movieId, episodeId, progress, completed } = req.body;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  // Tìm bản ghi cũ
  let history = await History.findOne({
    where: {
      userId: req.user.id,
      movieId,
      ...(episodeId && { episodeId })
    }
  });

  if (history) {
    // Cập nhật
    history.watchedAt = new Date();
    if (progress !== undefined) history.progress = progress;
    if (completed !== undefined) history.completed = completed;
    await history.save();
  } else {
    // Tạo mới
    await History.create({
      userId: req.user.id,
      movieId,
      episodeId: episodeId || null,
      progress: progress || 0,
      completed: completed || false
    });
  }

  successResponse(res, null, 'Đã cập nhật lịch sử xem');
});

// Xóa một item khỏi lịch sử
const removeFromHistory = catchAsync(async (req, res, next) => {
  const { historyId } = req.params;

  const result = await History.destroy({
    where: { id: historyId, userId: req.user.id }
  });

  if (result === 0) {
    return next(new AppError('Không tìm thấy lịch sử', 404));
  }

  successResponse(res, null, 'Đã xóa khỏi lịch sử');
});

// Xóa toàn bộ lịch sử
const clearHistory = catchAsync(async (req, res) => {
  await History.destroy({ where: { userId: req.user.id } });
  successResponse(res, null, 'Đã xóa toàn bộ lịch sử');
});

module.exports = {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory
};