# ใช้ Node.js เวอร์ชัน 18 บน Alpine Linux เป็น base image (ขนาดเล็ก ประหยัดพื้นที่)
FROM node:18-alpine

# ตั้ง working directory ภายใน container เป็น /app
WORKDIR /app

# คัดลอกไฟล์ package.json ไปยัง working directory ใน container
COPY package.json ./

# ติดตั้ง dependencies ที่ระบุไว้ใน package.json โดยใช้ npm
RUN npm install

# คัดลอกไฟล์ทั้งหมดจากโปรเจกต์บน host (เครื่องเรา) เข้าไปใน container
COPY . .

# คำสั่งที่จะรันเมื่อ container เริ่มต้นทำงาน (รัน server.js ด้วย Node.js)
CMD ["node", "server.js"]
