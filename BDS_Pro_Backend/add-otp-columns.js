/**
 * Script thêm cột otp_code và otp_expiry vào bảng users.
 * Chạy: node add-otp-columns.js
 */
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'bds_pro_db',
  });

  console.log('✅ Kết nối DB thành công');

  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS=0');

    // Thêm cột otp_code (nếu chưa có)
    await conn.execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10) NULL AFTER refresh_token_hash
    `);
    console.log('✅ Đã thêm cột otp_code');

    // Thêm cột otp_expiry (nếu chưa có)
    await conn.execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS otp_expiry DATETIME NULL AFTER otp_code
    `);
    console.log('✅ Đã thêm cột otp_expiry');

    await conn.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log('🎉 Hoàn tất! Có thể khởi động lại backend.');
  } catch (err) {
    await conn.execute('SET FOREIGN_KEY_CHECKS=1');
    console.error('❌ Lỗi:', err.message);
  } finally {
    await conn.end();
  }
}

main();
