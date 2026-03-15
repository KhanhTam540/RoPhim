// backend/controllers/historyController.js
const { History, Movie, Episode, sequelize } = require('../models');
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

  console.log('📦 Getting history for user:', req.user.id);

  const { count, rows: histories } = await History.findAndCountAll({
    where: { user_id: req.user.id },
    include: [
      { 
        model: Movie, 
        as: 'movie',
        where: { is_active: true },
        required: false,
        include: [{ model: sequelize.models.Genre, as: 'genres' }]
      },
      { 
        model: Episode, 
        as: 'episode',
        attributes: ['id', 'episode_number', 'title'],
        required: false
      }
    ],
    order: [['watched_at', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  const historyList = histories
    .filter(h => h.movie)
    .map(h => ({
      id: h.id,
      movie: formatMoviesResponse([h.movie], req)[0],
      episode: h.episode ? {
        id: h.episode.id,
        episodeNumber: h.episode.episode_number,
        title: h.episode.title
      } : null,
      progress: h.progress,
      completed: h.completed,
      watchedAt: h.watched_at
    }));

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    history: historyList,
    pagination
  });
});

// Thêm vào lịch sử - UPSERT
const addToHistory = catchAsync(async (req, res, next) => {
  const { movieId, episodeId, progress, completed } = req.body;

  console.log('📝 Adding to history:', { userId: req.user.id, movieId, episodeId, progress, completed });

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  if (episodeId) {
    const episode = await Episode.findOne({
      where: { id: episodeId, movie_id: movieId }
    });
    if (!episode) {
      return next(new AppError('Không tìm thấy tập phim', 404));
    }
  }

  // Tìm bản ghi cũ
  let history = await History.findOne({
    where: {
      user_id: req.user.id,
      movie_id: movieId,
      ...(episodeId && { episode_id: episodeId })
    }
  });

  if (history) {
    // CẬP NHẬT - nếu đã tồn tại
    history.watched_at = new Date();
    if (progress !== undefined) history.progress = progress;
    if (completed !== undefined) history.completed = completed;
    await history.save();
    console.log('✅ Updated existing history:', history.id);
  } else {
    // TẠO MỚI - nếu chưa có
    history = await History.create({
      user_id: req.user.id,
      movie_id: movieId,
      episode_id: episodeId || null,
      progress: progress || 0,
      completed: completed || false,
      watched_at: new Date()
    });
    console.log('✅ Created new history:', history.id);
  }

  successResponse(res, {
    history: {
      id: history.id,
      progress: history.progress,
      completed: history.completed,
      watchedAt: history.watched_at
    }
  }, 'Đã cập nhật lịch sử xem');
});

// Xóa một item khỏi lịch sử
const removeFromHistory = catchAsync(async (req, res, next) => {
  const { historyId } = req.params;

  console.log('🗑️ Removing history:', historyId, 'for user:', req.user.id);

  const result = await History.destroy({
    where: { id: historyId, user_id: req.user.id }
  });

  if (result === 0) {
    return next(new AppError('Không tìm thấy lịch sử', 404));
  }

  successResponse(res, null, 'Đã xóa khỏi lịch sử');
});

// Xóa toàn bộ lịch sử
const clearHistory = catchAsync(async (req, res) => {
  console.log('🗑️ Clearing all history for user:', req.user.id);

  await History.destroy({ 
    where: { user_id: req.user.id }
  });
  
  successResponse(res, null, 'Đã xóa toàn bộ lịch sử');
});

module.exports = {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory
};