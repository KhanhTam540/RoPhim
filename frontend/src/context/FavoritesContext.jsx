// src/context/FavoritesContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { favoriteApi } from '../api/auth'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const FavoritesContext = createContext()

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  // Load favorites khi đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites()
    } else {
      setFavorites([])
      setFavoriteIds(new Set())
    }
  }, [isAuthenticated])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await favoriteApi.getFavorites({ limit: 100 })
      const movies = response.data?.movies || []
      setFavorites(movies)
      setFavoriteIds(new Set(movies.map(m => m.id)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFavorite = async (movieId) => {
    try {
      await favoriteApi.addFavorite(movieId)
      await loadFavorites() // Reload để cập nhật
      toast.success('Đã thêm vào danh sách yêu thích')
    } catch (error) {
      console.error('Error adding favorite:', error)
      toast.error('Không thể thêm vào yêu thích')
    }
  }

  const removeFavorite = async (movieId) => {
    try {
      await favoriteApi.removeFavorite(movieId)
      setFavorites(prev => prev.filter(m => m.id !== movieId))
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(movieId)
        return newSet
      })
      toast.success('Đã xóa khỏi danh sách yêu thích')
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Không thể xóa khỏi yêu thích')
    }
  }

  const toggleFavorite = async (movieId) => {
    if (favoriteIds.has(movieId)) {
      await removeFavorite(movieId)
    } else {
      await addFavorite(movieId)
    }
  }

  const isFavorite = (movieId) => favoriteIds.has(movieId)

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      reloadFavorites: loadFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  )
} 