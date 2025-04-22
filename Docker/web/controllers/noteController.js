const { v4: uuid } = require('uuid');

// GET: หน้าแรกพร้อมแสดง note ทั้งหมด และรองรับการค้นหา
exports.getAllNotes = async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (q) console.log(`🔍 Search query: "${q}"`);
  const redis = req.redis;

  try {
    const keys = await redis.keys('note:*');
    const notes = [];

    for (let key of keys) {
      const data = await redis.hGetAll(key);
      if (!q || data.title.toLowerCase().includes(q)) {
        notes.push({ id: key.split(':')[1], title: data.title, content: data.content });
      }
    }

    res.render('index', { notes, q });
  } catch (err) {
    console.error('❌ Error fetching notes:', err);
    res.status(500).send('Internal Server Error');
  }
};

// POST: เพิ่ม note ใหม่
exports.addNote = async (req, res) => {
  const redis = req.redis;

  try {
    const id = uuid();
    await redis.hSet(`note:${id}`, {
      title: req.body.title,
      content: req.body.content,
    });
    console.log(`✅ Note added: note:${id}`);
    res.redirect('/');
  } catch (err) {
    console.error('❌ Error adding note:', err);
    res.status(500).send('Failed to add note');
  }
};

// POST: ลบ note ตาม id
exports.deleteNote = async (req, res) => {
  const redis = req.redis;
  const id = req.params.id;

  try {
    await redis.del(`note:${id}`);
    console.log(`🗑️ Note deleted: note:${id}`);
    res.redirect('/');
  } catch (err) {
    console.error('❌ Error deleting note:', err);
    res.status(500).send('Failed to delete note');
  }
};

// GET: แสดงหน้าแก้ไข note
exports.getEditNote = async (req, res) => {
  const redis = req.redis;
  const id = req.params.id;

  try {
    const note = await redis.hGetAll(`note:${id}`);
    res.render('edit', { id, note });
  } catch (err) {
    console.error('❌ Error loading note for edit:', err);
    res.status(500).send('Failed to load note');
  }
};

// POST: อัปเดต note
exports.updateNote = async (req, res) => {
  const redis = req.redis;
  const id = req.params.id;

  try {
    await redis.hSet(`note:${id}`, {
      title: req.body.title,
      content: req.body.content,
    });
    console.log(`✏️ Note updated: note:${id}`);
    res.redirect('/');
  } catch (err) {
    console.error('❌ Error updating note:', err);
    res.status(500).send('Failed to update note');
  }
};