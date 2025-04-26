// นำเข้าโมดูล uuid (เวอร์ชัน 4) เพื่อสร้าง ID ที่ไม่ซ้ำกันสำหรับโน้ต
const { v4: uuid } = require('uuid');

// ฟังก์ชัน GET: ดึงโน้ตทั้งหมดและแสดงหน้าแรก พร้อมรองรับการค้นหา
exports.getAllNotes = async (req, res) => {
  // ดึงพารามิเตอร์การค้นหา (query parameter) 'q' จาก URL และแปลงเป็นตัวพิมพ์เล็ก
  // หากไม่มี 'q' จะใช้สตริงว่าง ('')
  const q = (req.query.q || '').toLowerCase();

  // ถ้ามีการค้นหา (q ไม่ว่าง) แสดงข้อความในคอนโซลเพื่อบันทึกการค้นหา
  if (q) console.log(`🔍 Search query: "${q}"`);

  // ดึงอินสแตนซ์ Redis จาก req.redis (สมมติว่าถูกตั้งค่าใน middleware)
  const redis = req.redis;

  try {
    // ดึงคีย์ทั้งหมดที่ตรงกับแพทเทิร์น 'note:*' เช่น 'note:1', 'note:2'
    const keys = await redis.keys('note:*');

    // สร้างอาร์เรย์ว่างเพื่อเก็บข้อมูลโน้ต
    const notes = [];

    // วนลูปผ่านแต่ละคีย์เพื่อดึงข้อมูล
    for (let key of keys) {
      // ดึงข้อมูล hash ทั้งหมดจากคีย์ (เช่น { title: '...', content: '...' })
      const data = await redis.hGetAll(key);

      // ตรวจสอบว่าโน้ตตรงกับคำค้นหาหรไม่ (ถ้ามี q) หรือเก็บโน้ตทั้งหมด (ถ้าไม่มี q)
      // การค้นหาจะเปรียบเทียบหัวข้อ (title) ที่แปลงเป็นตัวพิมพ์เล็ก
      if (!q || data.title.toLowerCase().includes(q)) {
        // เพิ่มโน้ตลงในอาร์เรย์ โดยแยก ID จากคีย์และรวมข้อมูล title, content
        notes.push({ id: key.split(':')[1], title: data.title, content: data.content });
      }
    }

    // แสดงผลหน้า 'index' โดยส่งข้อมูล notes และคำค้นหา (q) ไปยังเทมเพลต
    res.render('index', { notes, q });
  } catch (err) {
    // บันทึกข้อผิดพลาดในคอนโซลหากการดึงข้อมูลล้มเหลว
    console.error('❌ Error fetching notes:', err);

    // ส่งสถานะ HTTP 500 และข้อความข้อผิดพลาดไปยังผู้ใช้
    res.status(500).send('Internal Server Error');
  }
};

// ฟังก์ชัน POST: เพิ่มโน้ตใหม่ลงใน Redis
exports.addNote = async (req, res) => {
  // ดึงอินสแตนซ์ Redis จาก req.redis
  const redis = req.redis;

  try {
    // สร้าง ID ที่ไม่ซ้ำกันสำหรับโน้ตใหม่โดยใช้ uuid
    const id = uuid();

    // สร้างคีย์สำหรับ Redis ในรูปแบบ 'note:<id>'
    const key = `note:${id}`;

    // สร้างอ็อบเจ็กต์ข้อมูลโน้ตจากข้อมูลที่ส่งมาใน body ของคำขอ
    const noteData = {
      title: req.body.title,
      content: req.body.content,
    };

    // เก็บข้อมูลโน้ตใน Redis โดยใช้คำสั่ง hSet เพื่อบันทึก hash
    await redis.hSet(key, noteData);

    // ตั้งค่า TTL (Time To Live) สำหรับคีย์เป็น 1 วัน (86,400 วินาที)
    // หลังจากนี้โน้ตจะถูกลบอัตโนมัติ
    await redis.expire(key, 86400);

    // บันทึกข้อมูลในคอนโซลเมื่อเพิ่มโน้ตสำเร็จ
    console.log(`✅ Note added: ${key}`);
    console.log(`📝 Data: ${JSON.stringify(noteData)}`);

    // เปลี่ยนเส้นทางกลับไปยังหน้าแรก
    res.redirect('/');
  } catch (err) {
    // บันทึกข้อผิดพลาดในคอนโซลหากการเพิ่มโน้ตล้มเหลว
    console.error('❌ Error adding note:', err);

    // ส่งสถานะ HTTP 500 และข้อความข้อผิดพลาด
    res.status(500).send('Failed to add note');
  }
};

// ฟังก์ชัน POST: ลบโน้ตตาม ID
exports.deleteNote = async (req, res) => {
  // ดึงอินสแตนซ์ Redis จาก req.redis
  const redis = req.redis;

  // ดึง ID จากพารามิเตอร์ใน URL
  const id = req.params.id;

  // สร้างคีย์ Redis ในรูปแบบ 'note:<id>'
  const key = `note:${id}`;

  try {
    // ดึงข้อมูล hash เดิมของโน้ตก่อนลบ เพื่อบันทึกในログ
    const oldData = await redis.hGetAll(key);

    // ลบคีย์ออกจาก Redis และรับจำนวนคีย์ที่ถูกลบ (1 หากสำเร็จ, 0 หากคีย์ไม่มีอยู่)
    const wasDeleted = await redis.del(key);

    // ตรวจสอบว่าการลบสำเร็จหรือไม่
    if (wasDeleted) {
      // บันทึกข้อมูลในคอนโซลเมื่อลบสำเร็จ
      console.log(`🗑️ Note deleted: ${key}`);
      console.log(`📦 Data before delete: ${JSON.stringify(oldData)}`);
    } else {
      // บันทึกข้อความเตือนหากคีย์ไม่พบหรือหมดอายุแล้ว
      console.log(`⚠️ Key not found or expired: ${key}`);
    }

    // เปลี่ยนเส้นทางกลับไปยังหน้าแรก
    res.redirect('/');
  } catch (err) {
    // บันทึกข้อผิดพลาดในคอนโซลหากการลบล้มเหลว
    console.error('❌ Error deleting note:', err);

    // ส่งสถานะ HTTP 500 และข้อความข้อผิดพลาด
    res.status(500).send('Failed to delete note');
  }
};

// ฟังก์ชัน GET: แสดงหน้าแก้ไขโน้ตตาม ID
exports.getEditNote = async (req, res) => {
  // ดึงอินสแตนซ์ Redis จาก req.redis
  const redis = req.redis;

  // ดึง ID จากพารามิเตอร์ใน URL
  const id = req.params.id;

  try {
    // ดึงข้อมูล hash ของโน้ตจาก Redis โดยใช้คีย์ 'note:<id>'
    const note = await redis.hGetAll(`note:${id}`);

    // แสดงผลหน้า 'edit' โดยส่ง ID และข้อมูลโน้ตไปยังเทมเพลต
    res.render('edit', { id, note });
  } catch (err) {
    // บันทึกข้อผิดพลาดในคอนโซลหากการโหลดโน้ตล้มเหลว
    console.error('❌ Error loading note for edit:', err);

    // ส่งสถานะ HTTP 500 และข้อความข้อผิดพลาด
    res.status(500).send('Failed to load note');
  }
};

// ฟังก์ชัน POST: อัปเดตโน้ตตาม ID
exports.updateNote = async (req, res) => {
  // ดึงอินสแตนซ์ Redis จาก req.redis
  const redis = req.redis;

  // ดึง ID จากพารามิเตอร์ใน URL
  const id = req.params.id;

  try {
    // อัปเดตข้อมูล hash ใน Redis ด้วยข้อมูลใหม่จาก body ของคำขอ
    await redis.hSet(`note:${id}`, {
      title: req.body.title,
      content: req.body.content,
    });

    // บันทึกข้อมูลในคอนโซลเมื่ออัปเดตสำเร็จ
    console.log(`✏️ Note updated: note:${id}`);

    // เปลี่ยนเส้นทางกลับไปยังหน้าแรก
    res.redirect('/');
  } catch (err) {
    // บันทึกข้อผิดพลาดในคอนโซลหากการอัปเดตล้มเหลว
    console.error('❌ Error updating note:', err);

    // ส่งสถานะ HTTP 500 และข้อความข้อผิดพลาด
    res.status(500).send('Failed to update note');
  }
};