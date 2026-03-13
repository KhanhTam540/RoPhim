import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { commentApi } from '../api/auth'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FaHeart, FaRegHeart, FaReply, FaTrash, FaEdit } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Loading from './Loading'

const CommentSection = ({ movieId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadComments()
  }, [movieId, page])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await commentApi.getComments(movieId, { page, limit: 10 })
      const { comments: newComments, pagination } = response.data
      
      setComments(prev => page === 1 ? newComments : [...prev, ...newComments])
      setHasMore(page < pagination.pages)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận')
      return
    }

    if (!newComment.trim()) return

    try {
      const data = { content: newComment }
      if (replyTo) {
        data.parentId = replyTo.id
      }

      const response = await commentApi.addComment(movieId, data)
      
      if (replyTo) {
        // Add reply to parent comment
        setComments(prev => prev.map(c => 
          c.id === replyTo.id 
            ? { ...c, replies: [...(c.replies || []), response.data.comment] }
            : c
        ))
      } else {
        // Add new comment to top
        setComments(prev => [response.data.comment, ...prev])
      }
      
      setNewComment('')
      setReplyTo(null)
      toast.success('Đã đăng bình luận')
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    try {
      const response = await commentApi.likeComment(commentId)
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, likeCount: response.data.likeCount, isLiked: response.data.isLiked }
          : c
      ))
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return

    try {
      await commentApi.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Đã xóa bình luận')
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await commentApi.updateComment(commentId, { content })
      setComments(prev => prev.map(c => 
        c.id === commentId ? response.data.comment : c
      ))
      setEditingComment(null)
      toast.success('Đã cập nhật bình luận')
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
      <div className="bg-rophim-card rounded-lg p-4">
        {/* User info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            {comment.user?.avatar ? (
              <img
                src={`${import.meta.env.VITE_IMAGE_URL}/${comment.user.avatar}`}
                alt={comment.user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {comment.user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{comment.user?.fullName}</p>
              <p className="text-xs text-rophim-textSecondary">
                {formatDistanceToNow(new Date(comment.createdAt), { 
                  addSuffix: true,
                  locale: vi 
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          {user?.id === comment.userId && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingComment(comment)}
                className="text-gray-400 hover:text-white"
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {editingComment?.id === comment.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleEditComment(comment.id, formData.get('content'))
            }}
            className="mt-2"
          >
            <textarea
              name="content"
              defaultValue={comment.content}
              className="input-field"
              rows="2"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="px-3 py-1 text-sm bg-gray-600 rounded"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 rounded"
              >
                Lưu
              </button>
            </div>
          </form>
        ) : (
          <p className="text-rophim-textSecondary mt-2">{comment.content}</p>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 mt-3">
          <button
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center space-x-1 ${
              comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            {comment.isLiked ? <FaHeart /> : <FaRegHeart />}
            <span className="text-sm">{comment.likeCount || 0}</span>
          </button>
          
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white"
            >
              <FaReply size={14} />
              <span className="text-sm">Trả lời</span>
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  )

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Bình luận</h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          {replyTo && (
            <div className="flex items-center justify-between bg-rophim-card p-2 rounded-t-lg">
              <p className="text-sm">
                Đang trả lời <span className="text-blue-500">{replyTo.user?.fullName}</span>
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? 'Viết trả lời...' : 'Viết bình luận...'}
            className="input-field"
            rows="3"
          />
          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={!newComment.trim()}
          >
            {replyTo ? 'Gửi trả lời' : 'Gửi bình luận'}
          </button>
        </form>
      ) : (
        <p className="text-center text-rophim-textSecondary py-4">
          Vui lòng <Link to="/dang-nhap" className="text-blue-500">đăng nhập</Link> để bình luận
        </p>
      )}

      {/* Comments list */}
      {loading && page === 1 ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary w-full"
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Xem thêm bình luận'}
            </button>
          )}

          {!comments.length && (
            <p className="text-center text-rophim-textSecondary py-8">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CommentSection