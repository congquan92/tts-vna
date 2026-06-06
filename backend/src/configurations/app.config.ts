export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3001,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT as string, 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: '7d',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT as string, 10) || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, 
    from: process.env.MAIL_FROM,
  },
});