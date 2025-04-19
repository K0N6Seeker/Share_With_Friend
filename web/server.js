const express = require('express');
const { createClient } = require('redis');
const noteRoutes = require('./routes/noteRoutes');
const path = require('path');

const app = express();

// สร้าง Redis client
const redis = createClient({ url: 'redis://redis:6379' });

// เชื่อมต่อ Redis
redis.connect()
  .then(() => console.log('✅ Connected to Redis'))
  .catch(err => console.error('❌ Redis connection error:', err));

// Middleware สำหรับ parse form data และ static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ตั้งค่า view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// ส่ง redis client ไปให้ route handler ใช้
app.use((req, res, next) => {
  req.redis = redis;
  next();
});

// ใช้ route
app.use('/', noteRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
