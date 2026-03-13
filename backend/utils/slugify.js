const slugify = (text) => {
  if (!text) return '';

  // Chuyển sang chữ thường
  let slug = text.toLowerCase();

  // Đổi ký tự có dấu thành không dấu
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Đổi ký tự đặc biệt thành dấu gạch ngang
  slug = slug.replace(/[đĐ]/g, 'd');
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  
  // Thay khoảng trắng bằng dấu gạch ngang
  slug = slug.replace(/\s+/g, '-');
  
  // Xóa dấu gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
};

module.exports = slugify;