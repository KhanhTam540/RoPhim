// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import MovieDetail from './pages/MovieDetail'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'

// Import các trang đã tách riêng
import MoviesPage from './pages/MoviesPage'        // Phim lẻ
import SeriesPage from './pages/SeriesPage'        // Phim bộ
import TVShowsPage from './pages/TVShowsPage'      // TV Shows
import TheaterPage from './pages/TheaterPage'      // Phim chiếu rạp
import GenreMoviesPage from './pages/GenreMoviesPage'
import CountryMoviesPage from './pages/CountryMoviesPage'

// Import Admin Pages
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
    <div className="min-h-screen flex flex-col bg-rophim-bg text-white">
      <Helmet defaultTitle="RoPhim - Xem phim miễn phí" />
      
      <Header />
      
      {/* Main content với padding-top để không bị header che */}
      <main className="flex-grow pt-16 md:pt-20">
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/phim/:slug" element={<MovieDetail />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          
          {/* ========== MENU ROUTES ========== */}
          <Route path="/phim-le" element={<MoviesPage />} />
          <Route path="/phim-bo" element={<SeriesPage />} />
          <Route path="/tv-shows" element={<TVShowsPage />} />
          <Route path="/phim-chieu-rap" element={<TheaterPage />} />
          <Route path="/the-loai/:slug" element={<GenreMoviesPage />} />
          <Route path="/quoc-gia/:slug" element={<CountryMoviesPage />} />
          
          {/* ========== PROTECTED ROUTES ========== */}
          <Route path="/ho-so" element={
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
          
          {/* ========== ADMIN ROUTES ========== */}
          <Route path="/admin" element={
            <PrivateRoute>
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

          {/* ========== 404 NOT FOUND ========== */}
          <Route path="*" element={
            <div className="container-custom py-20 text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-xl text-rophim-textSecondary mb-8">
                Trang bạn tìm kiếm không tồn tại
              </p>
              <a href="/" className="btn-primary px-6 py-3">
                Quay về trang chủ
              </a>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App