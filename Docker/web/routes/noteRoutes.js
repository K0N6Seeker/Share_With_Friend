// นำเข้าโมดูล express
const express = require('express');
// สร้าง router ใหม่จาก express
const router = express.Router();
// นำเข้า noteController ซึ่งเป็นไฟล์ที่มีฟังก์ชันสำหรับจัดการโน้ต
const noteController = require('../controllers/noteController');

// เส้นทางหลัก: เมื่อมีการเรียก GET ที่ '/' จะเรียกใช้ฟังก์ชัน getAllNotes ใน noteController
router.get('/', noteController.getAllNotes);

// เส้นทางสำหรับเพิ่มโน้ต: เมื่อมีการเรียก POST ที่ '/add' จะเรียกใช้ฟังก์ชัน addNote ใน noteController
router.post('/add', noteController.addNote);

// เส้นทางสำหรับลบโน้ต: เมื่อมีการเรียก POST ที่ '/delete/:id' จะเรียกใช้ฟังก์ชัน deleteNote ใน noteController โดยที่ :id คือ ID ของโน้ตที่ต้องการลบ
router.post('/delete/:id', noteController.deleteNote);

// เส้นทางสำหรับแสดงฟอร์มแก้ไขโน้ต: เมื่อมีการเรียก GET ที่ '/edit/:id' จะเรียกใช้ฟังก์ชัน getEditNote ใน noteController โดยที่ :id คือ ID ของโน้ตที่ต้องการแก้ไข
router.get('/edit/:id', noteController.getEditNote);

// เส้นทางสำหรับอัปเดตโน้ต: เมื่อมีการเรียก POST ที่ '/edit/:id' จะเรียกใช้ฟังก์ชัน updateNote ใน noteController โดยที่ :id คือ ID ของโน้ตที่ต้องการอัปเดต
router.post('/edit/:id', noteController.updateNote);

// ส่งออก router เพื่อให้สามารถนำไปใช้ในไฟล์อื่นได้
module.exports = router;