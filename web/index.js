const express = require('express');
const { createClient } = require('redis');
const { v4: uuid } = require('uuid');

const app = express();
const redis = createClient({ url: 'redis://redis:6379' });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

redis.connect().catch(console.error);

app.get('/', async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const keys = await redis.keys('note:*');
  const notes = [];
  for (let key of keys) {
    const data = await redis.hGetAll(key);
    if (!q || data.title.toLowerCase().includes(q)) {
      notes.push({ id: key.split(':')[1], title: data.title, content: data.content });
    }
  }
  res.render('index', { notes, q });
});

app.post('/add', async (req, res) => {
  console.log('📝 Incoming body:', req.body);
  try {
    const id = uuid();
    await redis.hSet(`note:${id}`, {
      title: req.body.title,
      content: req.body.content,
    });
    console.log(`✅ Saved note:${id}`);
    // Redirect back to the homepage, ensure route '/' is defined
    res.redirect('/');
  } catch (err) {
    console.error('❌ Save failed:', err);
    res.status(500).send('Save failed');
  }
});

app.post('/delete/:id', async (req, res) => {
  await redis.del(`note:${req.params.id}`);
  res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
  const note = await redis.hGetAll(`note:${req.params.id}`);
  res.render('edit', { id: req.params.id, note });
});

app.post('/edit/:id', async (req, res) => {
  await redis.hSet(`note:${req.params.id}`, {
    title: req.body.title,
    content: req.body.content,
  });
  res.redirect('/');
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));