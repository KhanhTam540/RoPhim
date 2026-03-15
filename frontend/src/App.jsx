// src/App.jsx
import { Routes, Route } from 'react-router-dom' // ✅ Xóa BrowserRouter, chỉ giữ Routes, Route
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

// Public Pages
import HomePage from './pages/HomePage'
import MovieDetail from './pages/MovieDetail'
import MoviesByTypePage from './pages/MoviesByTypePage'
import GenrePage from './pages/GenrePage'
import CountryPage from './pages/CountryPage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// User Pages
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import MovieList from './pages/admin/Movies/MovieList'
import MovieForm from './pages/admin/Movies/MovieForm'
import EpisodeManager from './pages/admin/Movies/EpisodeManager'
import GenreList from './pages/admin/Genres/GenreList'
import GenreForm from './pages/admin/Genres/GenreForm'
import CountryList from './pages/admin/Countries/CountryList'
import CountryForm from './pages/admin/Countries/CountryForm'
import ActorList from './pages/admin/Actors/ActorList'
import ActorForm from './pages/admin/Actors/ActorForm'
import DirectorList from './pages/admin/Directors/DirectorList'
import DirectorForm from './pages/admin/Directors/DirectorForm'
import UserList from './pages/admin/Users/UserList'
import UserDetail from './pages/admin/Users/UserDetail'
import UserForm from './pages/admin/Users/UserForm'
import SliderList from './pages/admin/Sliders/SliderList'
import SliderForm from './pages/admin/Sliders/SliderForm'
import Settings from './pages/admin/Settings/Settings'

function App() {
  return (
    <HelmetProvider>
      {/* ✅ ĐÃ XÓA BrowserRouter - vì main.jsx đã có */}
      <AuthProvider>
        <FavoritesProvider>
          <div className="min-h-screen flex flex-col bg-rophim-bg text-white">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Header />
            
            <main className="flex-grow pt-20 md:pt-24">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/phim/:slug" element={<MovieDetail />} />
                
                {/* Movie Type Routes */}
                <Route path="/:type" element={<MoviesByTypePage />} />
                
                {/* Category Routes */}
                <Route path="/the-loai/:slug" element={<GenrePage />} />
                <Route path="/quoc-gia/:slug" element={<CountryPage />} />
                
                {/* Search */}
                <Route path="/tim-kiem" element={<SearchPage />} />
                
                {/* Auth Routes */}
                <Route path="/dang-nhap" element={<LoginPage />} />
                <Route path="/dang-ky" element={<RegisterPage />} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
                <Route path="/yeu-thich" element={
                  <PrivateRoute>
                    <FavoritesPage />
                  </PrivateRoute>
                } />
                <Route path="/lich-su" element={
                  <PrivateRoute>
                    <HistoryPage />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <PrivateRoute adminOnly>
                    <AdminLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="movies" element={<MovieList />} />
                  <Route path="movies/create" element={<MovieForm />} />
                  <Route path="movies/:id" element={<MovieForm />} />
                  <Route path="movies/:movieId/episodes" element={<EpisodeManager />} />
                  <Route path="genres" element={<GenreList />} />
                  <Route path="genres/create" element={<GenreForm />} />
                  <Route path="genres/:id" element={<GenreForm />} />
                  <Route path="countries" element={<CountryList />} />
                  <Route path="countries/create" element={<CountryForm />} />
                  <Route path="countries/:id" element={<CountryForm />} />
                  <Route path="actors" element={<ActorList />} />
                  <Route path="actors/create" element={<ActorForm />} />
                  <Route path="actors/:id" element={<ActorForm />} />
                  <Route path="directors" element={<DirectorList />} />
                  <Route path="directors/create" element={<DirectorForm />} />
                  <Route path="directors/:id" element={<DirectorForm />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="users/create" element={<UserForm />} />
                  <Route path="users/:id" element={<UserDetail />} />
                  <Route path="sliders" element={<SliderList />} />
                  <Route path="sliders/create" element={<SliderForm />} />
                  <Route path="sliders/:id" element={<SliderForm />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={
                  <div className="container-custom py-20 text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-rophim-textSecondary mb-8">Trang bạn tìm không tồn tại</p>
                    <a href="/" className="btn-primary">Về trang chủ</a>
                  </div>
                } />
              </Routes>
            </main>

            <Footer />
          </div>
        </FavoritesProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App