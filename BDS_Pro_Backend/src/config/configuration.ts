/**
 * Cấu hình tập trung, đọc từ biến môi trường.
 * Được nạp qua @nestjs/config (ConfigModule).
 */
export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'bds_pro_db',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
    logging: (process.env.DB_LOGGING ?? 'false') === 'true',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },

  ai: {
    apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
    model: process.env.AI_MODEL ?? 'openai/gpt-4o-mini',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? 'sx2gr72m',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '795245948955748',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? 'sA45pdd_SbwTxE5lF_QKhXx9KZQ',
  },
});
