const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// เส้นทางหลัก
router.get('/', noteController.getAllNotes);

// เพิ่มโน้ต
router.post('/add', noteController.addNote);

// ลบโน้ต
router.post('/delete/:id', noteController.deleteNote);

// แสดงฟอร์มแก้ไข
router.get('/edit/:id', noteController.getEditNote);

// อัปเดตโน้ต
router.post('/edit/:id', noteController.updateNote);

module.exports = router;
