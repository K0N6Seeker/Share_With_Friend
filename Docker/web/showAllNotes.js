// นำเข้าโมดูล createClient จากไลบรารี Redis เพื่อใช้เชื่อมต่อกับ Redis
const { createClient } = require('redis');

// ประกาศฟังก์ชันแบบ asynchronous เพื่อดึงและแสดงโน้ตทั้งหมดจาก Redis
async function showAllNotes() {
  // สร้างอินสแตนซ์ของ Redis client โดยเชื่อมต่อกับเซิร์ฟเวอร์ Redis
  // URL 'redis://redis:6379' ระบุโฮสต์ ('redis') และพอร์ต (6379)
  // ค่านี้มักใช้ในสภาพแวดล้อม Docker ที่ชื่อเซอร์วิสคือ 'redis'
  const redis = createClient({ url: 'redis://redis:6379' });

  // เชื่อมต่อกับเซิร์ฟเวอร์ Redis
  // การใช้ await ช่วยให้มั่นใจว่าการเชื่อมต่อสำเร็จก่อนดำเนินการต่อ
  await redis.connect();

  // ดึงคีย์ทั้งหมดใน Redis ที่ตรงกับแพทเทิร์น 'note:*'
  // แพทเทิร์น 'note:*' จะจับคู่คีย์เช่น 'note:1', 'note:2' เป็นต้น
  // สมมติว่าโน็ตถูกจัดเก็บด้วยรูปแบบคีย์นี้
  const keys = await redis.keys('note:*');

  // แสดงจำนวนโน้ตทั้งหมดที่พบ โดยใช้ความยาวของอาร์เรย์ keys
  // อิโมจิ (📋) ช่วยเพิ่มความสวยงามให้กับผลลัพธ์ในคอนโซล
  console.log(`📋 พบทั้งหมด ${keys.length} โน้ต\n`);

  // วนลูปผ่านแต่ละคีย์ในอาร์เรย์ keys
  for (const key of keys) {
    // ดึงข้อมูลทั้งหมดจาก hash ที่จัดเก็บในคีย์ปัจจุบัน
    // คำสั่ง hGetAll ส่งคืนอ็อบเจ็กต์ที่มีคู่ key-value เช่น { title: '...', content: '...' }
    const data = await redis.hGetAll(key);

    // แยก ID ของโน้ตจากคีย์ โดยแยกด้วย ':' และเลือกส่วนที่สอง
    // เช่น 'note:1' จะได้ ID เป็น '1'
    const id = key.split(':')[1];

    // แสดงรายละเอียดของโน้ตในคอนโซลด้วยรูปแบบที่จัดระเบียบ
    // รวมถึง ID, หัวข้อ, และเนื้อหา พร้อมอิโมจิเพื่อความชัดเจน
    console.log(`📝 Note ID: ${id}`);
    console.log(`   Title  : ${data.title}`);
    console.log(`   Content: ${data.content}`);
    console.log('-----------------------------------\n');
  }

  // ปิดการเชื่อมต่อ Redis อย่างถูกต้อง
  // เพื่อให้แน่ใจว่าทรัพยากรถูกปล่อยและการเชื่อมต่อสิ้นสุดลง
  await redis.quit();
}

// เรียกใช้งานฟังก์ชัน showAllNotes
// เนื่องจากเป็นฟังก์ชันแบบ async การเรียกนี้จะเริ่มดึงและแสดงโน้ต
showAllNotes();