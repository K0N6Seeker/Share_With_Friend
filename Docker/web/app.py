from flask import Flask, request, redirect, render_template_string
import redis
import uuid

app = Flask(__name__)
r = redis.Redis(host='redis', port=6379, decode_responses=True)

TEMPLATE = '''
<h2>📝 บันทึกข้อความ</h2>
<form method="POST" action="/add">
    <input name="title" placeholder="หัวข้อ" required>
    <textarea name="content" placeholder="เนื้อหา" required></textarea>
    <button type="submit">เพิ่ม</button>
</form>

<ul>
{% for key, memo in memos.items() %}
    <li>
        <b>{{ memo['title'] }}</b>: {{ memo['content'] }}
        <form method="POST" action="/delete/{{ key }}" style="display:inline;">
            <button type="submit">ลบ</button>
        </form>
        <form method="GET" action="/edit/{{ key }}" style="display:inline;">
            <button type="submit">แก้ไข</button>
        </form>
    </li>
{% endfor %}
</ul>
'''

EDIT_TEMPLATE = '''
<h2>🛠️ แก้ไขบันทึก</h2>
<form method="POST">
    <input name="title" value="{{ memo['title'] }}" required>
    <textarea name="content" required>{{ memo['content'] }}</textarea>
    <button type="submit">บันทึก</button>
</form>
'''

@app.route('/')
def index():
    keys = r.keys('memo:*')
    memos = {key: r.hgetall(key) for key in keys}
    return render_template_string(TEMPLATE, memos=memos)

@app.route('/add', methods=['POST'])
def add():
    memo_id = str(uuid.uuid4())
    r.hset(f'memo:{memo_id}', mapping={
        'title': request.form['title'],
        'content': request.form['content']
    })
    return redirect('/')

@app.route('/delete/<key>', methods=['POST'])
def delete(key):
    r.delete(key)
    return redirect('/')

@app.route('/edit/<key>', methods=['GET', 'POST'])
def edit(key):
    if request.method == 'POST':
        r.hset(key, mapping={
            'title': request.form['title'],
            'content': request.form['content']
        })
        return redirect('/')
    memo = r.hgetall(key)
    return render_template_string(EDIT_TEMPLATE, memo=memo)
