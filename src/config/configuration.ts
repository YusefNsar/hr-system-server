export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
