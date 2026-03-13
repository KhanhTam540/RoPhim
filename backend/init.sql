-- =====================================================
-- DATABASE: rophim_db
-- =====================================================
DROP DATABASE IF EXISTS rophim_db;
CREATE DATABASE rophim_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rophim_db;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'uploads/avatars/default-avatar.png',
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME,
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    email_verify_token VARCHAR(255),
    email_verify_expire DATETIME,
    preferences JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert users data
INSERT INTO users (username, email, password, full_name, avatar, role, email_verified, is_active) VALUES
('admin', 'admin@rophim.is', '$2a$10$YourHashedPasswordHere', N'Quản Trị Viên', 'uploads/avatars/admin.jpg', 'admin', TRUE, TRUE),
('nguyenvanA', 'nguyenvana@email.com', '$2a$10$YourHashedPasswordHere', N'Nguyễn Văn Anh', 'uploads/avatars/user1.jpg', 'user', TRUE, TRUE),
('tranthib', 'tranthib@email.com', '$2a$10$YourHashedPasswordHere', N'Trần Thị Bình', 'uploads/avatars/user2.jpg', 'user', TRUE, TRUE),
('lehoangc', 'lehoangc@email.com', '$2a$10$YourHashedPasswordHere', N'Lê Hoàng Cường', 'uploads/avatars/user3.jpg', 'user', TRUE, TRUE),
('phamthid', 'phamthid@email.com', '$2a$10$YourHashedPasswordHere', N'Phạm Thị Dung', 'uploads/avatars/user4.jpg', 'user', TRUE, TRUE),
('vovanE', 'vovane@email.com', '$2a$10$YourHashedPasswordHere', N'Võ Văn Em', 'uploads/avatars/user5.jpg', 'user', TRUE, TRUE);

-- =====================================================
-- TABLE: genres
-- =====================================================
CREATE TABLE genres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name NVARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    meta_title NVARCHAR(255),
    meta_description NVARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert genres data
INSERT INTO genres (name, slug, description, icon, meta_title) VALUES
(N'Hành Động', 'hanh-dong', N'Phim hành động kịch tính, gay cấn với những pha đánh đấm mãn nhãn', 'action-icon.png', N'Phim Hành Động'),
(N'Tình Cảm', 'tinh-cam', N'Phim tình cảm lãng mạn, sâu lắng về tình yêu đôi lứa', 'romance-icon.png', N'Phim Tình Cảm'),
(N'Hài Hước', 'hai-huoc', N'Phim hài hước vui nhộn, giải trí', 'comedy-icon.png', N'Phim Hài Hước'),
(N'Kinh Dị', 'kinh-di', N'Phim kinh dị rùng rợn, ma quái', 'horror-icon.png', N'Phim Kinh Dị'),
(N'Viễn Tưởng', 'vien-tuong', N'Phim khoa học viễn tưởng, tương lai', 'sci-fi-icon.png', N'Phim Viễn Tưởng'),
(N'Hoạt Hình', 'hoat-hinh', N'Phim hoạt hình dành cho mọi lứa tuổi', 'animation-icon.png', N'Phim Hoạt Hình'),
(N'Cổ Trang', 'co-trang', N'Phim cổ trang, lịch sử', 'historical-icon.png', N'Phim Cổ Trang'),
(N'Tâm Lý', 'tam-ly', N'Phim tâm lý xã hội sâu sắc', 'drama-icon.png', N'Phim Tâm Lý'),
(N'Hình Sự', 'hinh-su', N'Phim hình sự, tội phạm', 'crime-icon.png', N'Phim Hình Sự'),
(N'Chiến Tranh', 'chien-tranh', N'Phim chiến tranh, lịch sử', 'war-icon.png', N'Phim Chiến Tranh'),
(N'Phiêu Lưu', 'phieu-luu', N'Phim phiêu lưu mạo hiểm', 'adventure-icon.png', N'Phim Phiêu Lưu'),
(N'Võ Thuật', 'vo-thuat', N'Phim võ thuật hồng kông', 'martial-arts-icon.png', N'Phim Võ Thuật');

-- =====================================================
-- TABLE: countries
-- =====================================================
CREATE TABLE countries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name NVARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    flag VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert countries data
INSERT INTO countries (name, code, slug, flag) VALUES
(N'Việt Nam', 'VN', 'viet-nam', 'flags/vietnam.png'),
(N'Hàn Quốc', 'KR', 'han-quoc', 'flags/korea.png'),
(N'Nhật Bản', 'JP', 'nhat-ban', 'flags/japan.png'),
(N'Trung Quốc', 'CN', 'trung-quoc', 'flags/china.png'),
(N'Thái Lan', 'TH', 'thai-lan', 'flags/thailand.png'),
(N'Mỹ', 'US', 'my', 'flags/usa.png'),
(N'Anh', 'GB', 'anh', 'flags/uk.png'),
(N'Pháp', 'FR', 'phap', 'flags/france.png'),
(N'Ấn Độ', 'IN', 'an-do', 'flags/india.png'),
(N'Đài Loan', 'TW', 'dai-loan', 'flags/taiwan.png'),
(N'Hồng Kông', 'HK', 'hong-kong', 'flags/hongkong.png'),
(N'Đan Mạch', 'DK', 'dan-mach', 'flags/denmark.png'),
(N'Thụy Điển', 'SE', 'thuy-dien', 'flags/sweden.png'),
(N'Na Uy', 'NO', 'na-uy', 'flags/norway.png');

-- =====================================================
-- TABLE: actors
-- =====================================================
CREATE TABLE actors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name NVARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    original_name NVARCHAR(255),
    bio TEXT,
    birth_date DATE,
    death_date DATE,
    nationality VARCHAR(100),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert actors data
INSERT INTO actors (name, slug, original_name, bio, birth_date, nationality, avatar) VALUES
(N'Lý Liên Kiệt', 'ly-lien-kiet', 'Jet Li', N'Lý Liên Kiệt là võ sư, diễn viên võ thuật nổi tiếng người Trung Quốc', '1963-04-26', 'Trung Quốc', 'actors/jet-li.jpg'),
(N'Thành Long', 'thanh-long', 'Jackie Chan', N'Thành Long là diễn viên, đạo diễn, nhà sản xuất phim nổi tiếng', '1954-04-07', 'Hồng Kông', 'actors/jackie-chan.jpg'),
(N'Châu Tinh Trì', 'chau-tinh-tri', 'Stephen Chow', N'Châu Tinh Trì là diễn viên hài, đạo diễn nổi tiếng', '1962-06-22', 'Hồng Kông', 'actors/stephen-chow.jpg'),
(N'Lưu Đức Hoa', 'luu-duc-hoa', 'Andy Lau', N'Lưu Đức Hoa là ca sĩ, diễn viên nổi tiếng', '1961-09-27', 'Hồng Kông', 'actors/andy-lau.jpg'),
(N'Lương Triều Vỹ', 'luong-trieu-vi', 'Tony Leung', N'Lương Triều Vỹ là diễn viên nổi tiếng', '1962-06-27', 'Hồng Kông', 'actors/tony-leung.jpg'),
(N'Trương Mạn Ngọc', 'truong-man-ngoc', 'Maggie Cheung', N'Trương Mạn Ngọc là nữ diễn viên nổi tiếng', '1964-09-20', 'Hồng Kông', 'actors/maggie-cheung.jpg'),
(N'Thang Duy', 'tang-duy', 'Tang Wei', N'Thang Duy là nữ diễn viên nổi tiếng', '1979-10-07', 'Trung Quốc', 'actors/tang-wei.jpg'),
(N'Tống Huệ Kiều', 'tong-hue-kieu', 'Song Hye-kyo', N'Tống Huệ Kiều là nữ diễn viên nổi tiếng Hàn Quốc', '1981-11-22', 'Hàn Quốc', 'actors/song-hye-kyo.jpg'),
(N'Kim Soo Hyun', 'kim-soo-hyun', 'Kim Soo-hyun', N'Kim Soo Hyun là nam diễn viên nổi tiếng Hàn Quốc', '1988-02-16', 'Hàn Quốc', 'actors/kim-soo-hyun.jpg'),
(N'Jun Ji Hyun', 'jun-ji-hyun', 'Jun Ji-hyun', N'Jun Ji Hyun là nữ diễn viên nổi tiếng Hàn Quốc', '1981-10-30', 'Hàn Quốc', 'actors/jun-ji-hyun.jpg'),
(N'Lê Minh', 'le-minh', 'Lê Minh', N'Lê Minh là ca sĩ, diễn viên nổi tiếng', '1966-12-11', 'Hồng Kông', 'actors/leon-lai.jpg'),
(N'Lý Minh Khởi', 'ly-minh-khoi', 'Lee Min-ho', N'Lý Minh Khởi là nam diễn viên nổi tiếng Hàn Quốc', '1987-06-22', 'Hàn Quốc', 'actors/lee-min-ho.jpg');

-- =====================================================
-- TABLE: directors
-- =====================================================
CREATE TABLE directors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name NVARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    original_name NVARCHAR(255),
    bio TEXT,
    birth_date DATE,
    death_date DATE,
    nationality VARCHAR(100),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert directors data
INSERT INTO directors (name, slug, original_name, bio, birth_date, nationality, avatar) VALUES
(N'Lý An', 'ly-an', 'Ang Lee', N'Đạo diễn từng đoạt Oscar với các phim "Brokeback Mountain", "Life of Pi"', '1954-10-23', 'Đài Loan', 'directors/ang-lee.jpg'),
(N'Trương Nghệ Mưu', 'truong-nghe-muu', 'Zhang Yimou', N'Đạo diễn nổi tiếng với các phim "Anh Hùng", "Thập Diện Mai Phục"', '1950-04-02', 'Trung Quốc', 'directors/zhang-yimou.jpg'),
(N'Phùng Tiểu Cương', 'phung-tieu-cuong', 'Feng Xiaogang', N'Đạo diễn, diễn viên nổi tiếng', '1958-03-18', 'Trung Quốc', 'directors/feng-xiaogang.jpg'),
(N'Vương Gia Vệ', 'vuong-gia-ve', 'Wong Kar-wai', N'Đạo diễn nghệ thuật nổi tiếng với phong cách điện ảnh độc đáo', '1958-07-17', 'Hồng Kông', 'directors/wong-kar-wai.jpg'),
(N'Park Chan-wook', 'park-chan-wook', 'Park Chan-wook', N'Đạo diễn Hàn Quốc nổi tiếng với "Oldboy"', '1963-08-23', 'Hàn Quốc', 'directors/park-chan-wook.jpg'),
(N'Bong Joon-ho', 'bong-joon-ho', 'Bong Joon-ho', N'Đạo diễn từng đoạt Oscar với "Parasite"', '1969-09-14', 'Hàn Quốc', 'directors/bong-joon-ho.jpg'),
(N'Christopher Nolan', 'christopher-nolan', 'Christopher Nolan', N'Đạo diễn thiên tài với "Inception", "Interstellar"', '1970-07-30', 'Anh', 'directors/nolan.jpg'),
(N'Quentin Tarantino', 'quentin-tarantino', 'Quentin Tarantino', N'Đạo diễn với phong cách độc đáo "Pulp Fiction"', '1963-03-27', 'Mỹ', 'directors/tarantino.jpg');

-- =====================================================
-- TABLE: movies
-- =====================================================
CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title NVARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    original_title NVARCHAR(255),
    description TEXT,
    poster VARCHAR(255),
    backdrop VARCHAR(255),
    release_year INT,
    duration INT,
    type ENUM('single', 'series') DEFAULT 'single',
    status ENUM('ongoing', 'completed', 'upcoming') DEFAULT 'ongoing',
    quality VARCHAR(50),
    language VARCHAR(50),
    subtitle BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    trailer_url VARCHAR(500),
    video_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title NVARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    created_by INT,
    updated_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert movies data
INSERT INTO movies (title, slug, original_title, description, poster, backdrop, release_year, duration, type, status, quality, language, subtitle, view_count, rating_average, rating_count, trailer_url, video_url, is_featured) VALUES
(N'Ký Sinh Trùng', 'ky-sinh-trung', 'Parasite', N'Câu chuyện về hai gia đình, một giàu một nghèo, và mối quan hệ đầy bất ngờ giữa họ. Phim đã giành giải Oscar cho Phim hay nhất.', 'movies/parasite-poster.jpg', 'movies/parasite-backdrop.jpg', 2019, 132, 'single', 'completed', 'Full HD', N'Tiếng Hàn', TRUE, 1500000, 4.8, 25000, 'https://youtube.com/parasite', 'https://example.com/parasite.mp4', TRUE),
(N'Chạy Đi Chờ Chi', 'chay-di-cho-chi', 'Train to Busan', N'Đoàn tàu cao tốc từ Seoul đến Busan trở thành địa ngục khi đại dịch thây ma bùng phát. Hành khách phải chiến đấu để sinh tồn.', 'movies/train-to-busan-poster.jpg', 'movies/train-to-busan-backdrop.jpg', 2016, 118, 'single', 'completed', 'Full HD', N'Tiếng Hàn', TRUE, 2500000, 4.7, 35000, 'https://youtube.com/train-to-busan', 'https://example.com/train-to-busan.mp4', TRUE),
(N'Người Nhện: Không Còn Nhà', 'nguoi-nhen-khong-con-nha', 'Spider-Man: No Way Home', N'Sau khi danh tính bị lộ, Người Nhện phải nhờ đến Doctor Strange để giúp đỡ, nhưng mọi chuyện trở nên tồi tệ hơn.', 'movies/spiderman-poster.jpg', 'movies/spiderman-backdrop.jpg', 2021, 148, 'single', 'completed', '4K UHD', N'Tiếng Anh', TRUE, 3500000, 4.6, 45000, 'https://youtube.com/spiderman', 'https://example.com/spiderman.mp4', TRUE),
(N'Avengers: Hồi Kết', 'avengers-hoi-ket', 'Avengers: Endgame', N'Sau sự kiện Infinity War, các Avengers còn lại phải tập hợp để đánh bại Thanos và khôi phục lại vũ trụ.', 'movies/avengers-poster.jpg', 'movies/avengers-backdrop.jpg', 2019, 181, 'single', 'completed', '4K UHD', N'Tiếng Anh', TRUE, 5000000, 4.9, 80000, 'https://youtube.com/avengers', 'https://example.com/avengers.mp4', TRUE),
(N'Joker', 'joker', 'Joker', N'Câu chuyện về nguồn gốc của kẻ thù không đội trời chung của Batman - Joker, một người đàn ông bị xã hội ruồng bỏ.', 'movies/joker-poster.jpg', 'movies/joker-backdrop.jpg', 2019, 122, 'single', 'completed', 'Full HD', N'Tiếng Anh', TRUE, 2800000, 4.8, 55000, 'https://youtube.com/joker', 'https://example.com/joker.mp4', TRUE),
(N'Em Là Bà Nội Của Anh', 'em-la-ba-noi-cua-anh', 'Em Là Bà Nội Của Anh', N'Cô gái trẻ bỗng dưng có linh hồn của bà cụ 70 tuổi. Phim hài hước và cảm động.', 'movies/em-la-ba-noi-poster.jpg', 'movies/em-la-ba-noi-backdrop.jpg', 2015, 137, 'single', 'completed', 'Full HD', N'Tiếng Việt', FALSE, 1800000, 4.5, 28000, 'https://youtube.com/em-la-ba-noi', 'https://example.com/em-la-ba-noi.mp4', TRUE),
(N'Bố Già', 'bo-gia', 'The Godfather', N'Câu chuyện về gia đình mafia Corleone ở New York sau Thế chiến II, do Marlon Brando và Al Pacino thủ vai.', 'movies/godfather-poster.jpg', 'movies/godfather-backdrop.jpg', 1972, 175, 'single', 'completed', 'HD', N'Tiếng Anh', TRUE, 3200000, 4.9, 70000, 'https://youtube.com/godfather', 'https://example.com/godfather.mp4', TRUE),
(N'Đào, Phở Và Piano', 'dao-pho-va-piano', N'Đào, Phở Và Piano', N'Bộ phim về tình yêu và lòng yêu nước trong thời kỳ kháng chiến chống Pháp.', 'movies/dao-pho-piano-poster.jpg', 'movies/dao-pho-piano-backdrop.jpg', 2023, 120, 'single', 'completed', 'Full HD', N'Tiếng Việt', FALSE, 500000, 4.6, 10000, 'https://youtube.com/dao-pho-piano', 'https://example.com/dao-pho-piano.mp4', TRUE),
(N'Vây Hãm', 'vay-ham', 'Squid Game', N'Hàng trăm người chơi nhận lời mời tham gia trò chơi sinh tồn bí ẩn với giải thưởng 45,6 tỷ won.', 'movies/squid-game-poster.jpg', 'movies/squid-game-backdrop.jpg', 2021, NULL, 'series', 'completed', '4K UHD', N'Tiếng Hàn', TRUE, 5000000, 4.7, 60000, 'https://youtube.com/squid-game', NULL, TRUE),
(N'Chúng Ta Của 8 Năm Sau', 'chung-ta-cua-8-nam-sau', N'Chúng Ta Của 8 Năm Sau', N'Bộ phim tình cảm Hàn Quốc về tình yêu và sự chia ly sau 8 năm.', 'movies/chung-ta-poster.jpg', 'movies/chung-ta-backdrop.jpg', 2024, NULL, 'series', 'ongoing', 'Full HD', N'Tiếng Hàn', TRUE, 800000, 4.5, 15000, 'https://youtube.com/chung-ta', NULL, TRUE),
(N'Lật Mặt 7', 'lat-mat-7', N'Lật Mặt 7', N'Phim hành động Việt Nam về cuộc chiến chống tội phạm ma túy.', 'movies/lat-mat-7-poster.jpg', 'movies/lat-mat-7-backdrop.jpg', 2024, NULL, 'series', 'ongoing', 'Full HD', N'Tiếng Việt', FALSE, 600000, 4.4, 12000, 'https://youtube.com/lat-mat-7', NULL, TRUE),
(N'Thiếu Niên Và Diệc', 'thieu-nien-va-diec', 'The Boy and the Heron', N'Bộ phim hoạt hình mới nhất của Studio Ghibli, kể về cậu bé Mahito và hành trình kỳ diệu.', 'movies/boy-heron-poster.jpg', 'movies/boy-heron-backdrop.jpg', 2023, 124, 'single', 'completed', 'Full HD', N'Tiếng Nhật', TRUE, 900000, 4.7, 18000, 'https://youtube.com/boy-heron', 'https://example.com/boy-heron.mp4', TRUE),
(N'Dune 2', 'dune-2', 'Dune: Part Two', N'Paul Atreides tiếp tục cuộc chiến trên hành tinh Arrakis để giành lại vương quốc.', 'movies/dune2-poster.jpg', 'movies/dune2-backdrop.jpg', 2024, 166, 'single', 'ongoing', '4K UHD', N'Tiếng Anh', TRUE, 1200000, 4.8, 22000, 'https://youtube.com/dune2', 'https://example.com/dune2.mp4', TRUE),
(N'Tiếng Yêu Này Anh Dịch Được Không?', 'tieng-yeu-nay-anh-dich-duoc-khong', 'Can This Love Be Translated?', N'Phim kể về Joo Ho-jin, một phiên dịch viên đa ngôn ngữ và Cha Mu-hee - minh tinh nổi tiếng.', 'movies/translate-love-poster.jpg', 'movies/translate-love-backdrop.jpg', 2026, NULL, 'series', 'ongoing', 'Full HD', N'Tiếng Hàn', TRUE, 200000, 4.6, 5000, 'https://youtube.com/translate-love', NULL, TRUE),
(N'Hai Người Thân', 'hai-nguoi-than', 'Family by Choice', N'Hai người thân trong gia đình buộc phải cùng nhau nuôi dạy đứa cháu mồ côi.', 'movies/family-choice-poster.jpg', 'movies/family-choice-backdrop.jpg', 2025, NULL, 'series', 'ongoing', 'Full HD', N'Tiếng Hàn', TRUE, 300000, 4.5, 8000, 'https://youtube.com/family-choice', NULL, TRUE),
(N'Phàn Trường Ngọc', 'phan-truong-ngoc', 'The Legend of the Condor Heroes', N'Câu chuyện về Phàn Trường Ngọc và cuộc phiêu lưu trong thế giới võ hiệp.', 'movies/phan-truong-ngoc-poster.jpg', 'movies/phan-truong-ngoc-backdrop.jpg', 2025, NULL, 'series', 'ongoing', 'Full HD', N'Tiếng Trung', TRUE, 400000, 4.5, 9000, 'https://youtube.com/phan-truong-ngoc', NULL, TRUE);

-- =====================================================
-- TABLE: episodes
-- =====================================================
CREATE TABLE episodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    episode_number INT NOT NULL,
    title NVARCHAR(255),
    description TEXT,
    duration INT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(255),
    view_count INT DEFAULT 0,
    release_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_episode (movie_id, episode_number)
);

-- Insert episodes for Squid Game (movie_id = 9)
INSERT INTO episodes (movie_id, episode_number, title, description, duration, video_url, thumbnail, view_count, release_date) VALUES
(9, 1, N'Đèn Đỏ, Đèn Xanh', N'456 người chơi tham gia trò chơi sinh tồn đầu tiên: Đèn đỏ, đèn xanh.', 60, 'https://example.com/squid-game-ep1.mp4', 'episodes/squid-game-ep1.jpg', 500000, '2021-09-17'),
(9, 2, N'Địa Ngục', N'Những người chơi bỏ phiếu để dừng trò chơi, nhưng nhiều người quay lại.', 58, 'https://example.com/squid-game-ep2.mp4', 'episodes/squid-game-ep2.jpg', 480000, '2021-09-17'),
(9, 3, N'Người Đàn Ông Mang Ô', N'Trò chơi thứ hai: Cắt đường. Những người chơi phải chọn hình dạng.', 55, 'https://example.com/squid-game-ep3.mp4', 'episodes/squid-game-ep3.jpg', 470000, '2021-09-17'),
(9, 4, N'Không Muốn Rời Đội', N'Trò chơi kéo co đầy căng thẳng giữa các đội.', 52, 'https://example.com/squid-game-ep4.mp4', 'episodes/squid-game-ep4.jpg', 460000, '2021-09-17'),
(9, 5, N'Thế Giới Công Bằng', N'Trò chơi thứ tư: Bắn bi. Những người chơi phải chọn bạn đồng hành.', 61, 'https://example.com/squid-game-ep5.mp4', 'episodes/squid-game-ep5.jpg', 450000, '2021-09-17'),
(9, 6, N'Gganbu', N'Những cặp đôi phải đối mặt trong trò chơi bắn bi đầy cảm động.', 58, 'https://example.com/squid-game-ep6.mp4', 'episodes/squid-game-ep6.jpg', 490000, '2021-09-17'),
(9, 7, N'Người Phụ Nữ Đen', N'Ba người chơi cuối cùng bước vào trò chơi thứ năm.', 55, 'https://example.com/squid-game-ep7.mp4', 'episodes/squid-game-ep7.jpg', 480000, '2021-09-17'),
(9, 8, N'Lãnh Đạo', N'Vòng chung kết giữa hai người chơi cuối cùng.', 60, 'https://example.com/squid-game-ep8.mp4', 'episodes/squid-game-ep8.jpg', 500000, '2021-09-17'),
(9, 9, N'Một Ngày May Mắn', N'Người chiến thắng trở về với cuộc sống thực, nhưng mọi thứ không như mong đợi.', 62, 'https://example.com/squid-game-ep9.mp4', 'episodes/squid-game-ep9.jpg', 520000, '2021-09-17');

-- Insert episodes for Chúng Ta Của 8 Năm Sau (movie_id = 10)
INSERT INTO episodes (movie_id, episode_number, title, description, duration, video_url, thumbnail, view_count, release_date) VALUES
(10, 1, N'Cuộc Gặp Gỡ Định Mệnh', N'Họ gặp nhau lần đầu tại trường đại học, tình yêu bắt đầu nảy nở.', 70, 'https://example.com/chung-ta-ep1.mp4', 'episodes/chung-ta-ep1.jpg', 80000, '2024-01-15'),
(10, 2, N'Những Ngày Tháng Hạnh Phúc', N'Họ bên nhau, xây dựng những kỷ niệm đẹp.', 68, 'https://example.com/chung-ta-ep2.mp4', 'episodes/chung-ta-ep2.jpg', 75000, '2024-01-22'),
(10, 3, N'Cơn Bão Đầu Tiên', N'Những bất đồng đầu tiên xuất hiện trong mối quan hệ.', 65, 'https://example.com/chung-ta-ep3.mp4', 'episodes/chung-ta-ep3.jpg', 72000, '2024-01-29'),
(10, 4, N'Chia Ly', N'Họ quyết định chia tay sau 5 năm bên nhau.', 66, 'https://example.com/chung-ta-ep4.mp4', 'episodes/chung-ta-ep4.jpg', 85000, '2024-02-05'),
(10, 5, N'Tám Năm Sau', N'Sau 8 năm, họ tình cờ gặp lại nhau.', 70, 'https://example.com/chung-ta-ep5.mp4', 'episodes/chung-ta-ep5.jpg', 90000, '2024-02-12'),
(10, 6, N'Cảm Xúc Xưa', N'Những cảm xúc cũ sống dậy khi họ đối diện với quá khứ.', 68, 'https://example.com/chung-ta-ep6.mp4', 'episodes/chung-ta-ep6.jpg', 88000, '2024-02-19'),
(10, 7, N'Lựa Chọn', N'Họ phải đối mặt với những lựa chọn khó khăn.', 72, 'https://example.com/chung-ta-ep7.mp4', 'episodes/chung-ta-ep7.jpg', 82000, '2024-02-26'),
(10, 8, N'Cơ Hội Thứ Hai', N'Liệu họ có thể cho nhau một cơ hội thứ hai?', 75, 'https://example.com/chung-ta-ep8.mp4', 'episodes/chung-ta-ep8.jpg', 95000, '2024-03-04');

-- Insert episodes for Lật Mặt 7 (movie_id = 11)
INSERT INTO episodes (movie_id, episode_number, title, description, duration, video_url, thumbnail, view_count, release_date) VALUES
(11, 1, N'Cuộc Đột Kích', N'Đội cảnh sát đặc nhiệm thực hiện cuộc đột kích vào hang ổ tội phạm.', 90, 'https://example.com/lat-mat-7-ep1.mp4', 'episodes/lat-mat-7-ep1.jpg', 60000, '2024-03-10'),
(11, 2, N'Kẻ Nội Gián', N'Phát hiện có nội gián trong đội, mọi người bắt đầu nghi ngờ lẫn nhau.', 88, 'https://example.com/lat-mat-7-ep2.mp4', 'episodes/lat-mat-7-ep2.jpg', 58000, '2024-03-17'),
(11, 3, N'Đường Dây Ma Túy', N'Khám phá đường dây ma túy xuyên quốc gia.', 92, 'https://example.com/lat-mat-7-ep3.mp4', 'episodes/lat-mat-7-ep3.jpg', 62000, '2024-03-24'),
(11, 4, N'Trận Chiến Sinh Tử', N'Cuộc đối đầu đầy cam go với trùm ma túy.', 95, 'https://example.com/lat-mat-7-ep4.mp4', 'episodes/lat-mat-7-ep4.jpg', 70000, '2024-03-31'),
(11, 5, N'Sự Thật Phơi Bày', N'Những bí mật đen tối được phơi bày.', 86, 'https://example.com/lat-mat-7-ep5.mp4', 'episodes/lat-mat-7-ep5.jpg', 65000, '2024-04-07');

-- Insert episodes for Tiếng Yêu Này Anh Dịch Được Không? (movie_id = 14)
INSERT INTO episodes (movie_id, episode_number, title, description, duration, video_url, thumbnail, view_count, release_date) VALUES
(14, 1, N'Cuộc Gặp Định Mệnh', N'Joo Ho-jin gặp Cha Mu-hee lần đầu tiên tại sân bay quốc tế.', 65, 'https://example.com/translate-love-ep1.mp4', 'episodes/translate-love-ep1.jpg', 20000, '2026-01-05'),
(14, 2, N'Người Phiên Dịch Riêng', N'Ho-jin trở thành phiên dịch riêng cho Mu-hee trong chương trình thực tế.', 62, 'https://example.com/translate-love-ep2.mp4', 'episodes/translate-love-ep2.jpg', 18000, '2026-01-12'),
(14, 3, N'Nhật Bản', N'Đoàn phim đến Nhật Bản, những hiểu lầm bắt đầu xuất hiện.', 68, 'https://example.com/translate-love-ep3.mp4', 'episodes/translate-love-ep3.jpg', 19000, '2026-01-19'),
(14, 4, N'Canada', N'Những khoảnh khắc đáng nhớ tại Canada, cảm xúc bắt đầu nảy sinh.', 70, 'https://example.com/translate-love-ep4.mp4', 'episodes/translate-love-ep4.jpg', 21000, '2026-01-26'),
(14, 5, N'Ý', N'Ho-jin và Mu-hee có những khoảnh khắc lãng mạn tại Ý.', 72, 'https://example.com/translate-love-ep5.mp4', 'episodes/translate-love-ep5.jpg', 22000, '2026-02-02'),
(14, 6, N'Trái Tim Không Thể Dịch', N'Mặc dù ngôn ngữ có thể dịch, nhưng trái tim thì không.', 66, 'https://example.com/translate-love-ep6.mp4', 'episodes/translate-love-ep6.jpg', 23000, '2026-02-09');

-- Insert episodes for Hai Người Thân (movie_id = 15)
INSERT INTO episodes (movie_id, episode_number, title, description, duration, video_url, thumbnail, view_count, release_date) VALUES
(15, 1, N'Biến Cố Gia Đình', N'Một tai nạn bất ngờ khiến hai người thân phải cùng nhau chăm sóc đứa cháu nhỏ.', 60, 'https://example.com/family-choice-ep1.mp4', 'episodes/family-choice-ep1.jpg', 30000, '2025-03-01'),
(15, 2, N'Dưới Một Mái Nhà', N'Họ buộc phải sống chung và đối mặt với những khác biệt trong cách nuôi dạy trẻ.', 58, 'https://example.com/family-choice-ep2.mp4', 'episodes/family-choice-ep2.jpg', 28000, '2025-03-08'),
(15, 3, N'Những Hiểu Lầm', N'Những hiểu lầm trong quá khứ bắt đầu được hé lộ.', 62, 'https://example.com/family-choice-ep3.mp4', 'episodes/family-choice-ep3.jpg', 27000, '2025-03-15'),
(15, 4, N'Tình Cảm Nảy Sinh', N'Dần dần, tình cảm đặc biệt nảy sinh giữa họ.', 64, 'https://example.com/family-choice-ep4.mp4', 'episodes/family-choice-ep4.jpg', 31000, '2025-03-22'),
(15, 5, N'Thử Thách Mới', N'Họ phải đối mặt với những thử thách mới trong công việc và cuộc sống.', 60, 'https://example.com/family-choice-ep5.mp4', 'episodes/family-choice-ep5.jpg', 29000, '2025-03-29'),
(15, 6, N'Quyết Định', N'Liệu họ có dám vượt qua ranh giới để đến với nhau?', 66, 'https://example.com/family-choice-ep6.mp4', 'episodes/family-choice-ep6.jpg', 32000, '2025-04-05');

-- Insert episodes for Phàn Trường Ngọc (movie_id = 16)
INSERT INTO episodes (movie_id, episode_number, title, description, duration, video_url, thumbnail, view_count, release_date) VALUES
(16, 1, N'Đêm Tuyết Rơi', N'Phàn Trường Ngọc gặp Tạ Chinh trong một đêm tuyết rơi định mệnh.', 75, 'https://example.com/phan-truong-ngoc-ep1.mp4', 'episodes/phan-truong-ngoc-ep1.jpg', 40000, '2025-05-10'),
(16, 2, N'Hôn Nhân Giả', N'Hai người quyết định kết hôn giả để đạt được mục đích riêng.', 72, 'https://example.com/phan-truong-ngoc-ep2.mp4', 'episodes/phan-truong-ngoc-ep2.jpg', 38000, '2025-05-17'),
(16, 3, N'Tình Yêu Thật', N'Từ lợi dụng nhau, họ bắt đầu nảy sinh tình cảm thật sự.', 70, 'https://example.com/phan-truong-ngoc-ep3.mp4', 'episodes/phan-truong-ngoc-ep3.jpg', 39000, '2025-05-24'),
(16, 4, N'Bí Mật Bị Phát Hiện', N'Bí mật thân phận của Tạ Chinh bị phát hiện.', 74, 'https://example.com/phan-truong-ngoc-ep4.mp4', 'episodes/phan-truong-ngoc-ep4.jpg', 41000, '2025-05-31'),
(16, 5, N'Chia Ly', N'Họ buộc phải xa nhau vì thù hận gia tộc.', 68, 'https://example.com/phan-truong-ngoc-ep5.mp4', 'episodes/phan-truong-ngoc-ep5.jpg', 42000, '2025-06-07'),
(16, 6, N'Ra Chiến Trường', N'Phàn Trường Ngọc cầm dao mổ lợn ra chiến trường tìm chồng.', 76, 'https://example.com/phan-truong-ngoc-ep6.mp4', 'episodes/phan-truong-ngoc-ep6.jpg', 45000, '2025-06-14'),
(16, 7, N'Đoàn Tụ', N'Họ gặp lại nhau nơi chiến trường, sát cánh bên nhau.', 72, 'https://example.com/phan-truong-ngoc-ep7.mp4', 'episodes/phan-truong-ngoc-ep7.jpg', 46000, '2025-06-21'),
(16, 8, N'Sự Thật', N'Sự thật đằng sau mối thù 17 năm được hé lộ.', 70, 'https://example.com/phan-truong-ngoc-ep8.mp4', 'episodes/phan-truong-ngoc-ep8.jpg', 44000, '2025-06-28'),
(16, 9, N'Trở Về', N'Họ trở về quê hương, giữ trọn tấm lòng ban đầu.', 78, 'https://example.com/phan-truong-ngoc-ep9.mp4', 'episodes/phan-truong-ngoc-ep9.jpg', 47000, '2025-07-05');

-- =====================================================
-- TABLE: comments
-- =====================================================
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    parent_id INT,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Insert comments data
INSERT INTO comments (user_id, movie_id, content, created_at) VALUES
(2, 1, N'Phim hay quá! Nội dung sâu sắc và ý nghĩa.', '2024-01-15 10:30:00'),
(3, 1, N'Tuyệt vời! Xem mà nghẹn ngào.', '2024-01-15 11:20:00'),
(4, 1, N'Diễn xuất quá đỉnh, xứng đáng giải Oscar.', '2024-01-16 09:15:00'),
(2, 2, N'Căng thẳng từ đầu đến cuối, không thể rời mắt.', '2024-01-20 14:30:00'),
(3, 2, N'Phim zombie hay nhất mình từng xem.', '2024-01-21 08:45:00'),
(5, 2, N'Cảnh cuối xúc động quá!', '2024-01-22 16:20:00'),
(2, 3, N'Người Nhện hay nhất từ trước đến nay!', '2024-02-01 19:30:00'),
(4, 3, N'Khán giả vỗ tay suốt phim.', '2024-02-02 20:15:00'),
(6, 3, N'Cảnh ba người Nhện cùng xuất hiện quá đỉnh!', '2024-02-03 21:00:00'),
(3, 4, N'Avengers: Hồi Kết - kiệt tác của Marvel.', '2024-02-10 22:30:00'),
(5, 4, N'Nước mắt mình rơi ở cảnh cuối.', '2024-02-11 23:15:00'),
(2, 5, N'Joker - vai diễn để đời của Joaquin Phoenix.', '2024-03-01 18:30:00'),
(4, 5, N'Bộ phim tâm lý đen tối nhưng xuất sắc.', '2024-03-02 19:45:00'),
(2, 6, N'Phim Việt Nam hay, hài hước và cảm động.', '2024-03-10 15:30:00'),
(3, 6, N'Xem phim này nhớ về bà nội quá!', '2024-03-11 16:20:00'),
(5, 7, N'Bố Già - kinh điển mọi thời đại.', '2024-03-20 20:00:00'),
(6, 7, N'Marlon Brando diễn quá đỉnh.', '2024-03-21 21:30:00'),
(2, 8, N'Phim Việt ý nghĩa về lòng yêu nước.', '2024-04-01 09:30:00'),
(4, 8, N'Đẹp từng khung hình, cảm động từng câu chuyện.', '2024-04-02 10:15:00'),
(3, 9, N'Squid Game gây nghiện thật sự!', '2024-04-10 22:00:00'),
(5, 9, N'Tập 6 buồn quá đi mất!', '2024-04-11 23:30:00'),
(2, 10, N'Phim tình cảm Hàn Quốc lãng mạn quá!', '2024-05-01 20:30:00'),
(3, 10, N'Đang theo dõi, hay lắm!', '2024-05-02 21:15:00'),
(4, 11, N'Lật Mặt 7 hành động mãn nhãn.', '2024-06-01 19:30:00'),
(5, 11, N'Phim Việt ngày càng chất lượng.', '2024-06-02 20:45:00'),
(2, 12, N'Studio Ghibli không làm mình thất vọng.', '2024-07-01 14:30:00'),
(3, 12, N'Hoạt hình đẹp, nội dung sâu sắc.', '2024-07-02 15:20:00'),
(4, 13, N'Dune 2 hoành tráng hơn phần 1 nhiều!', '2024-08-01 18:30:00'),
(5, 13, N'Visual đẹp mê hồn.', '2024-08-02 19:15:00');

-- Insert replies
INSERT INTO comments (user_id, movie_id, parent_id, content, created_at) VALUES
(4, 1, 1, N'Đồng ý! Phim có nhiều tầng ý nghĩa.', '2024-01-15 12:00:00'),
(2, 1, 2, N'Cảnh cuối thực sự làm mình khóc.', '2024-01-16 10:00:00'),
(5, 2, 4, N'Phim này mình xem 3 lần rồi!', '2024-01-21 09:30:00'),
(3, 3, 7, N'Đúng rồi, cảnh đó khán giả rạp mình vỗ tay om sòm.', '2024-02-02 21:00:00');

-- =====================================================
-- TABLE: ratings
-- =====================================================
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    score INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie_rating (user_id, movie_id),
    CHECK (score >= 1 AND score <= 5)
);

-- Insert ratings data
INSERT INTO ratings (user_id, movie_id, score) VALUES
(2, 1, 5), (3, 1, 5), (4, 1, 4), (5, 1, 5), (6, 1, 5),
(2, 2, 5), (3, 2, 4), (4, 2, 5), (5, 2, 5), (6, 2, 4),
(2, 3, 5), (3, 3, 5), (4, 3, 4), (5, 3, 5), (6, 3, 4),
(2, 4, 5), (3, 4, 5), (4, 4, 5), (5, 4, 4), (6, 4, 5),
(2, 5, 5), (3, 5, 5), (4, 5, 5), (5, 5, 4), (6, 5, 5),
(2, 6, 4), (3, 6, 5), (4, 6, 4), (5, 6, 5), (6, 6, 4),
(2, 7, 5), (3, 7, 5), (4, 7, 5), (5, 7, 5), (6, 7, 5),
(2, 8, 5), (3, 8, 4), (4, 8, 5), (5, 8, 4), (6, 8, 5),
(2, 9, 5), (3, 9, 5), (4, 9, 4), (5, 9, 5), (6, 9, 4),
(2, 10, 4), (3, 10, 5), (4, 10, 4), (5, 10, 4), (6, 10, 5),
(2, 11, 4), (3, 11, 4), (4, 11, 5), (5, 11, 4), (6, 11, 4),
(2, 12, 5), (3, 12, 5), (4, 12, 4), (5, 12, 5), (6, 12, 4),
(2, 13, 5), (3, 13, 5), (4, 13, 4), (5, 13, 5), (6, 13, 5);

-- =====================================================
-- TABLE: favorites
-- =====================================================
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_movie_favorite (user_id, movie_id)
);

-- Insert favorites data
INSERT INTO favorites (user_id, movie_id) VALUES
(2, 1), (2, 3), (2, 5), (2, 7), (2, 9),
(3, 2), (3, 4), (3, 6), (3, 8), (3, 10),
(4, 1), (4, 3), (4, 5), (4, 7), (4, 9),
(5, 2), (5, 4), (5, 6), (5, 8), (5, 10),
(6, 1), (6, 3), (6, 5), (6, 7), (6, 9);

-- =====================================================
-- TABLE: histories
-- =====================================================
CREATE TABLE histories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    episode_id INT,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    CHECK (progress >= 0 AND progress <= 100)
);

-- Insert histories data
INSERT INTO histories (user_id, movie_id, episode_id, progress, completed, watched_at) VALUES
(2, 1, NULL, 100, TRUE, '2024-01-16 20:30:00'),
(2, 2, NULL, 100, TRUE, '2024-01-21 22:15:00'),
(2, 3, NULL, 85, FALSE, '2024-02-05 19:45:00'),
(3, 4, NULL, 100, TRUE, '2024-02-15 21:00:00'),
(3, 5, NULL, 70, FALSE, '2024-03-10 20:30:00'),
(4, 6, NULL, 100, TRUE, '2024-03-15 18:20:00'),
(4, 7, NULL, 50, FALSE, '2024-03-25 19:30:00'),
(5, 8, NULL, 30, FALSE, '2024-04-05 20:00:00'),
(5, 9, 1, 100, TRUE, '2024-04-12 21:30:00'),
(5, 9, 2, 100, TRUE, '2024-04-13 20:15:00'),
(5, 9, 3, 100, TRUE, '2024-04-14 19:45:00'),
(5, 9, 4, 60, FALSE, '2024-04-15 21:00:00'),
(6, 10, 1, 100, TRUE, '2024-05-05 20:30:00'),
(6, 10, 2, 80, FALSE, '2024-05-12 19:15:00'),
(2, 11, 1, 45, FALSE, '2024-06-10 20:00:00'),
(3, 12, NULL, 100, TRUE, '2024-07-05 18:30:00'),
(4, 13, NULL, 20, FALSE, '2024-08-10 21:45:00');

-- =====================================================
-- TABLE: sliders
-- =====================================================
CREATE TABLE sliders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title NVARCHAR(255),
    image VARCHAR(255) NOT NULL,
    movie_id INT,
    link VARCHAR(500),
    `order` INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE SET NULL
);

-- Insert sliders data
INSERT INTO sliders (title, image, movie_id, `order`, description) VALUES
(N'Ký Sinh Trùng - Kiệt Tác Đoạt Oscar', 'sliders/parasite-slider.jpg', 1, 1, N'Phim Hàn Quốc đầu tiên đoạt giải Oscar cho Phim hay nhất'),
(N'Avengers: Hồi Kết - Cuộc Chiến Cuối Cùng', 'sliders/avengers-slider.jpg', 4, 2, N'Bom tấn siêu anh hùng với doanh thu khủng nhất lịch sử'),
(N'Vây Hãm - Trò Chơi Sinh Tồn', 'sliders/squid-game-slider.jpg', 9, 3, N'Series đình đám nhất Netflix với hơn 1 tỷ giờ xem'),
(N'Joker - Vai Diễn Để Đời', 'sliders/joker-slider.jpg', 5, 4, N'Joaquin Phoenix giành Oscar cho vai diễn Joker'),
(N'Chạy Đi Chờ Chi - Thảm Họa Zombie', 'sliders/train-to-busan-slider.jpg', 2, 5, N'Bộ phim zombie hay nhất xứ Hàn');

-- =====================================================
-- JUNCTION TABLES
-- =====================================================

-- Movie - Genres
CREATE TABLE movie_genres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_genre (movie_id, genre_id)
);

-- Insert movie-genre relationships
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 2), (1, 8), (1, 11),  -- Ký Sinh Trùng: Tình cảm, Tâm lý, Phiêu lưu
(2, 1), (2, 8), (2, 11), (2, 12),  -- Chạy Đi Chờ Chi: Hành động, Tâm lý, Phiêu lưu, Kinh dị
(3, 1), (3, 5), (3, 11),  -- Người Nhện: Hành động, Viễn tưởng, Phiêu lưu
(4, 1), (4, 5), (4, 11),  -- Avengers: Hành động, Viễn tưởng, Phiêu lưu
(5, 8), (5, 9),  -- Joker: Tâm lý, Hình sự
(6, 2), (6, 3), (6, 8),  -- Em Là Bà Nội: Tình cảm, Hài hước, Tâm lý
(7, 9), (7, 8),  -- Bố Già: Hình sự, Tâm lý
(8, 2), (8, 8), (8, 7),  -- Đào Phở Piano: Tình cảm, Tâm lý, Cổ trang
(9, 1), (9, 8), (9, 9), (9, 11),  -- Vây Hãm: Hành động, Tâm lý, Hình sự, Phiêu lưu
(10, 2), (10, 8),  -- Chúng Ta Của 8 Năm Sau: Tình cảm, Tâm lý
(11, 1), (11, 9),  -- Lật Mặt 7: Hành động, Hình sự
(12, 6), (12, 11),  -- Thiếu Niên Và Diệc: Hoạt hình, Phiêu lưu
(13, 1), (13, 5), (13, 11),  -- Dune 2: Hành động, Viễn tưởng, Phiêu lưu
(14, 2), (14, 3),  -- Tiếng Yêu Này Anh Dịch Được Không?: Tình cảm, Hài hước
(15, 2), (15, 8),  -- Hai Người Thân: Tình cảm, Tâm lý
(16, 1), (16, 2), (16, 7), (16, 12);  -- Phàn Trường Ngọc: Hành động, Tình cảm, Cổ trang, Võ thuật

-- Movie - Countries
CREATE TABLE movie_countries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    country_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_country (movie_id, country_id)
);

-- Insert movie-country relationships
INSERT INTO movie_countries (movie_id, country_id) VALUES
(1, 2),  -- Ký Sinh Trùng: Hàn Quốc
(2, 2),  -- Chạy Đi Chờ Chi: Hàn Quốc
(3, 6),  -- Người Nhện: Mỹ
(4, 6),  -- Avengers: Mỹ
(5, 6),  -- Joker: Mỹ
(6, 1),  -- Em Là Bà Nội: Việt Nam
(7, 6),  -- Bố Già: Mỹ
(8, 1),  -- Đào Phở Piano: Việt Nam
(9, 2),  -- Vây Hãm: Hàn Quốc
(10, 2), -- Chúng Ta Của 8 Năm Sau: Hàn Quốc
(11, 1), -- Lật Mặt 7: Việt Nam
(12, 3), -- Thiếu Niên Và Diệc: Nhật Bản
(13, 6), -- Dune 2: Mỹ
(14, 2), -- Tiếng Yêu Này Anh Dịch Được Không?: Hàn Quốc
(15, 2), -- Hai Người Thân: Hàn Quốc
(16, 4); -- Phàn Trường Ngọc: Trung Quốc

-- Movie - Actors
CREATE TABLE movie_actors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    actor_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_actor (movie_id, actor_id)
);

-- Insert movie-actor relationships
INSERT INTO movie_actors (movie_id, actor_id) VALUES
(1, 7), (1, 8),  -- Ký Sinh Trùng: Thang Duy, Tống Huệ Kiều
(2, 9), (2, 10),  -- Chạy Đi Chờ Chi: Kim Soo Hyun, Jun Ji Hyun
(3, 1), (3, 2), (3, 3),  -- Người Nhện: Lý Liên Kiệt, Thành Long, Châu Tinh Trì
(4, 4), (4, 5),  -- Avengers: Lưu Đức Hoa, Lương Triều Vỹ
(5, 6),  -- Joker: Trương Mạn Ngọc
(6, 2), (6, 3),  -- Em Là Bà Nội: Thành Long, Châu Tinh Trì
(7, 4), (7, 5), (7, 6),  -- Bố Già: Lưu Đức Hoa, Lương Triều Vỹ, Trương Mạn Ngọc
(8, 1), (8, 7),  -- Đào Phở Piano: Lý Liên Kiệt, Thang Duy
(9, 8), (9, 9), (9, 10),  -- Vây Hãm: Tống Huệ Kiều, Kim Soo Hyun, Jun Ji Hyun
(10, 8), (10, 9),  -- Chúng Ta Của 8 Năm Sau: Tống Huệ Kiều, Kim Soo Hyun
(11, 1), (11, 2),  -- Lật Mặt 7: Lý Liên Kiệt, Thành Long
(12, 3), (12, 4),  -- Thiếu Niên Và Diệc: Châu Tinh Trì, Lưu Đức Hoa
(13, 5), (13, 6),  -- Dune 2: Lương Triều Vỹ, Trương Mạn Ngọc
(14, 8), (14, 9),  -- Tiếng Yêu Này Anh Dịch Được Không?: Tống Huệ Kiều, Kim Soo Hyun
(15, 7), (15, 10), -- Hai Người Thân: Thang Duy, Jun Ji Hyun
(16, 1), (16, 2), (16, 3), (16, 4); -- Phàn Trường Ngọc: Lý Liên Kiệt, Thành Long, Châu Tinh Trì, Lưu Đức Hoa

-- Movie - Directors
CREATE TABLE movie_directors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    director_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (director_id) REFERENCES directors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_movie_director (movie_id, director_id)
);

-- Insert movie-director relationships
INSERT INTO movie_directors (movie_id, director_id) VALUES
(1, 5),  -- Ký Sinh Trùng: Park Chan-wook
(2, 6),  -- Chạy Đi Chờ Chi: Bong Joon-ho
(3, 7),  -- Người Nhện: Christopher Nolan
(4, 8),  -- Avengers: Quentin Tarantino
(5, 7),  -- Joker: Christopher Nolan
(6, 3),  -- Em Là Bà Nội: Phùng Tiểu Cương
(7, 8),  -- Bố Già: Quentin Tarantino
(8, 1),  -- Đào Phở Piano: Lý An
(9, 6),  -- Vây Hãm: Bong Joon-ho
(10, 5), -- Chúng Ta Của 8 Năm Sau: Park Chan-wook
(11, 2), -- Lật Mặt 7: Trương Nghệ Mưu
(12, 4), -- Thiếu Niên Và Diệc: Vương Gia Vệ
(13, 7), -- Dune 2: Christopher Nolan
(14, 5), -- Tiếng Yêu Này Anh Dịch Được Không?: Park Chan-wook
(15, 6), -- Hai Người Thân: Bong Joon-ho
(16, 2); -- Phàn Trường Ngọc: Trương Nghệ Mưu

-- Comment Likes
CREATE TABLE comment_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_comment_user_like (comment_id, user_id)
);

-- Insert comment likes
INSERT INTO comment_likes (comment_id, user_id) VALUES
(1, 3), (1, 4), (1, 5),
(2, 2), (2, 4), (2, 6),
(3, 2), (3, 3), (3, 5),
(4, 3), (4, 5), (4, 6),
(5, 2), (5, 4), (5, 6),
(6, 2), (6, 3), (6, 4),
(7, 3), (7, 5), (7, 6),
(8, 2), (8, 4), (8, 5),
(9, 2), (9, 3), (9, 6),
(10, 3), (10, 4), (10, 5);

-- =====================================================
-- CREATE USER AND GRANT PERMISSIONS
-- =====================================================

-- Create application user
CREATE USER IF NOT EXISTS 'rophim_user'@'%' IDENTIFIED BY 'Rophim@2024';
GRANT ALL PRIVILEGES ON rophim_db.* TO 'rophim_user'@'%';
FLUSH PRIVILEGES;