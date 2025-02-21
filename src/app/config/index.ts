import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT,
  db_url: process.env.DB_URL,
  bcrypt_salt_round: Number(process.env.BCRYPT_SALT_ROUND),
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_secret_expirein: process.env.JWT_ACCESS_EXPIREIN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIREIN,
  node_env: process.env.NODE_ENV,
  smtp_mail: process.env.SMTP_Mail,
  smtp_password: process.env.SMTP_PASSWORD,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloud_api_key: process.env.CLOUDINARY_API_KEY,
  cloud_api_secret: process.env.CLOUDINARY_API_SECRET,
};
