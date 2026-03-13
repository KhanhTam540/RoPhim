const { Comment, User, Movie, CommentLike } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const { getPagination } = require('../utils/helpers');
const { Op } = require('sequelize');

// Lấy bình luận của phim
const getComments = catchAsync(async (req, res) => {
  const { movieId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: comments } = await Comment.findAndCountAll({
    where: { movieId, isActive: true, parentId: null },
    include: [
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'username', 'fullName', 'avatar'] 
      },
      { 
        model: Comment,
        as: 'replies',
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'username', 'fullName', 'avatar'] 
          }
        ],
        where: { isActive: true },
        required: false
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  // Đếm lượt thích cho mỗi comment
  const commentsWithLikes = await Promise.all(
    comments.map(async (comment) => {
      const commentData = comment.toJSON();
      
      // Đếm lượt thích
      const likeCount = await CommentLike.count({
        where: { commentId: comment.id }
      });

      // Kiểm tra user đã like chưa
      let isLiked = false;
      if (req.user) {
        const like = await CommentLike.findOne({
          where: { commentId: comment.id, userId: req.user.id }
        });
        isLiked = !!like;
      }

      // Đếm replies
      const replyCount = await Comment.count({
        where: { parentId: comment.id, isActive: true }
      });

      return {
        ...commentData,
        likeCount,
        isLiked,
        replyCount
      };
    })
  );

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    comments: commentsWithLikes,
    pagination
  });
});

// Thêm bình luận
const addComment = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const { content, parentId } = req.body;

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return next(new AppError('Không tìm thấy phim', 404));
  }

  // Kiểm tra parent comment nếu có
  if (parentId) {
    const parentComment = await Comment.findByPk(parentId);
    if (!parentComment) {
      return next(new AppError('Bình luận gốc không tồn tại', 404));
    }
  }

  const comment = await Comment.create({
    userId: req.user.id,
    movieId,
    content,
    parentId: parentId || null
  });

  await comment.reload({
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'avatar'] }
    ]
  });

  successResponse(res, { 
    comment
  }, 'Bình luận thành công', 201);
});

// Sửa bình luận
const updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findOne({
    where: { id: commentId, userId: req.user.id }
  });

  if (!comment) {
    return next(new AppError('Không tìm thấy bình luận hoặc bạn không có quyền sửa', 404));
  }

  comment.content = content;
  comment.isEdited = true;
  await comment.save();

  successResponse(res, { comment }, 'Cập nhật bình luận thành công');
});

// Xóa bình luận
const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findOne({
    where: { id: commentId, userId: req.user.id }
  });

  if (!comment) {
    return next(new AppError('Không tìm thấy bình luận hoặc bạn không có quyền xóa', 404));
  }

  // Xóa tất cả replies và likes liên quan
  await Comment.destroy({ where: { parentId: commentId } });
  await CommentLike.destroy({ where: { commentId } });
  await comment.destroy();

  successResponse(res, null, 'Xóa bình luận thành công');
});

// Thích/ bỏ thích bình luận
const likeComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    return next(new AppError('Không tìm thấy bình luận', 404));
  }

  const existingLike = await CommentLike.findOne({
    where: { commentId, userId: req.user.id }
  });

  if (existingLike) {
    // Bỏ thích
    await existingLike.destroy();
  } else {
    // Thêm thích
    await CommentLike.create({ commentId, userId: req.user.id });
  }

  // Đếm số lượt thích
  const likeCount = await CommentLike.count({ where: { commentId } });

  successResponse(res, { 
    likeCount,
    isLiked: !existingLike
  }, existingLike ? 'Đã bỏ thích' : 'Đã thích');
});

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment
};