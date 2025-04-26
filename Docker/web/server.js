// นำเข้าโมดูล express เพื่อสร้างและจัดการเซิร์ฟเวอร์ HTTP
const express = require('express');

// นำเข้าโมดูล createClient จาก redis เพื่อเชื่อมต่อกับฐานข้อมูล Redis
const { createClient } = require('redis');

// นำเข้าโมดูล noteRoutes ซึ่งกำหนดเส้นทางการจัดการคำขอเกี่ยวกับโน้ต
const noteRoutes = require('./routes/noteRoutes');

// นำเข้าโมดูล path เพื่อจัดการเส้นทางไฟล์ในระบบ
const path = require('path');

// สร้างอินสแตนซ์ของแอปพลิเคชัน Express
const app = express();

// สร้าง Redis client โดยระบุ URL การเชื่อมต่อ
// URL 'redis://redis:6379' ใช้โฮสต์ 'redis' และพอร์ต 6379
// ค่านี้เหมาะสำหรับสภาพแวดล้อม Docker ที่ชื่อเซอร์วิส Redis คือ 'redis'
const redis = createClient({ url: 'redis://redis:6379' });

// เชื่อมต่อกับเซิร์ฟเวอร์ Redis
redis.connect()
  .then(() => console.log('✅ Connected to Redis')) // บันทึกข้อความเมื่อเชื่อมต่อสำเร็จ
  .catch(err => console.error('❌ Redis connection error:', err)); // บันทึกข้อผิดพลาดหากเชื่อมต่อล้มเหลว

// Middleware สำหรับจัดการข้อมูลฟอร์มและไฟล์สแตติก
// express.urlencoded ใช้เพื่อแปลงข้อมูลจากฟอร์ม HTML (เช่น POST) เป็นอ็อบเจ็กต์
app.use(express.urlencoded({ extended: true }));

// express.static ใช้เพื่อให้บริการไฟล์สแตติก (เช่น CSS, JS, รูปภาพ) จากโฟลเดอร์ 'public'
app.use(express.static(path.join(__dirname, 'public')));

// ตั้งค่า view engine เป็น EJS เพื่อเรนเดอร์เทมเพลต HTML แบบไดนามิก
app.set('view engine', 'ejs');

// กำหนดโฟลเดอร์ 'view' เป็นที่เก็บไฟล์เทมเพลต EJS
app.set('views', path.join(__dirname, 'view'));

// Middleware สำหรับส่ง Redis client ไปยังทุก route handler
// เพิ่ม redis client ใน req.redis เพื่อให้ route handler เข้าถึงได้
app.use((req, res, next) => {
  req.redis = redis;
  next(); // เรียก middleware หรือ handler ถัดไป
});

// ใช้ noteRoutes สำหรับจัดการเส้นทางทั้งหมดที่เริ่มต้นด้วย '/'
app.use('/', noteRoutes);

// Middleware สำหรับจัดการคำขอที่ไม่พบเส้นทาง (404)
app.use((req, res) => {
  res.status(404).send('Page not found'); // ส่งสถานะ 404 และข้อความ
});

// เริ่มเซิร์ฟเวอร์
// กำหนดพอร์ตเป็น 3000
const PORT = 3000;

// เริ่มเซิร์ฟเวอร์และบันทึกข้อความเมื่อเริ่มทำงาน
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});