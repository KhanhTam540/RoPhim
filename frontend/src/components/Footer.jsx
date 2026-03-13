import { Link } from 'react-router-dom'
import { FaFacebook, FaYoutube, FaTwitter, FaInstagram } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-rophim-card border-t border-rophim-border mt-12">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">RoPhim</h3>
            <p className="text-rophim-textSecondary text-sm">
              Xem phim online miễn phí chất lượng cao, cập nhật nhanh nhất. 
              Kho phim đa dạng với nhiều thể loại hấp dẫn.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-rophim-textSecondary hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/phim-moi" className="text-rophim-textSecondary hover:text-white">
                  Phim mới
                </Link>
              </li>
              <li>
                <Link to="/phim-hot" className="text-rophim-textSecondary hover:text-white">
                  Phim hot
                </Link>
              </li>
              <li>
                <Link to="/the-loai" className="text-rophim-textSecondary hover:text-white">
                  Thể loại
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-rophim-textSecondary hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-rophim-textSecondary hover:text-white">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-rophim-textSecondary hover:text-white">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-rophim-textSecondary hover:text-white">
                  Bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold mb-4">Kết nối</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-rophim-textSecondary hover:text-white">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-rophim-textSecondary hover:text-white">
                <FaYoutube size={24} />
              </a>
              <a href="#" className="text-rophim-textSecondary hover:text-white">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-rophim-textSecondary hover:text-white">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-rophim-border text-center text-rophim-textSecondary text-sm">
          <p>&copy; 2024 RoPhim. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer