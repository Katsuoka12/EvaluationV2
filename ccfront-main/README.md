# ระบบประเมินผลการปฏิบัติงานบุคลากร (Staff Evaluation System - Frontend)

เว็บแอปพลิเคชันส่วนหน้า (Frontend) สำหรับระบบประเมินผลการปฏิบัติงานและตัวชี้วัด (KPIs) ของบุคลากรในองค์กร พัฒนาด้วย **Nuxt 3** และ **Tailwind CSS** เชื่อมต่อกับ Backend API (**Express.js / MySQL**) ในโฟลเดอร์ `ccontest-main`

---

## 🚀 เทคโนโลยีหลัก (Tech Stack)

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3 Composition API, Script Setup, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) พร้อมชุดสี Modern Slate & Brand Gradient, Glassmorphism UI
- **State & Auth**: Nuxt Composables (`useCookie`, `useState`), JWT Token Authentication
- **Icons**: SVG Icon Component แบบแยกส่วน รองรับไอคอนระบบครบถ้วน (`AppIcon.vue`)
- **Backend API**: Node.js Express REST API (`http://localhost:3333/api`)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
ccfront-main/
├── assets/
│   └── css/
│       └── main.css               # สไตล์ส่วนกลาง, Custom Gradients, Animations
├── components/
│   └── AppIcon.vue                # Custom SVG Icon Component
├── composables/
│   ├── useApi.ts                  # HTTP Fetch wrapper พร้อมจัดการ Token & Base URL
│   ├── useAuth.ts                 # จัดการ Login, Register, Profile, สิทธิ์การใช้งาน (Roles)
│   └── useEvaluation.ts           # จัดการ API รอบประเมิน, เกณฑ์ KPI, คะแนน, การจับคู่ตำแหน่ง
├── layouts/
│   └── default.vue                # Main Dashboard Layout (Responsive Sidebar, Header, User Menu)
├── middleware/
│   └── auth.global.ts             # Route Protection & Role-based Access Control
├── pages/
│   ├── index.vue                  # แดชบอร์ดภาพรวม สถิติ และทางลัดการใช้งาน
│   ├── login.vue                  # หน้าเข้าสู่ระบบและลงทะเบียน พร้อมปุ่ม Demo Account
│   ├── profile.vue                # จัดการข้อมูลส่วนตัวและตำแหน่งงาน
│   ├── evaluation/
│   │   ├── index.vue              # หน้ารายการประเมินทั้งหมด (สำหรับ Assessor / Admin)
│   │   ├── [id].vue               # หน้าตรวจให้คะแนนรายบุคคล (สำหรับผู้ประเมิน)
│   │   └── my-eval.vue            # หน้าทำแบบประเมินตนเอง (สำหรับบุคลากร Staff)
│   └── admin/
│       ├── periods.vue            # จัดการรอบการประเมิน (สร้าง/เปิด-ปิดรอบ)
│       ├── criteria.vue           # จัดการเกณฑ์หลักและตัวชี้วัดย่อย (KPIs)
│       └── positions.vue          # กำหนดและผูกเกณฑ์ตามตำแหน่งงานและรายชื่อบุคลากร
├── nuxt.config.ts                 # การตั้งค่า Nuxt, Tailwind CSS, Runtime Config
├── tailwind.config.js             # ธีมสี ส่วนขยาย Typography, Animations
└── tsconfig.json                  # TypeScript Configuration
```

---

## 👥 ระบบสิทธิ์และบทบาทผู้ใช้งาน (User Roles)

ระบบรองรับ 3 บทบาทหลัก โดยมีการตรวจสอบสิทธิ์ผ่าน Global Middleware:

| บทบาท (Role) | สิทธิ์การเข้าถึงและการทำงาน |
|---|---|
| **ผู้ใช้งานทั่วไป / บุคลากร (`user`)** | - เข้าถึงแดชบอร์ดภาพรวม<br>- ทำแบบประเมินผลการปฏิบัติงานของตนเอง (`/evaluation/my-eval`)<br>- อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์ (`/profile`) |
| **ผู้ประเมินผล / หัวหน้างาน (`assessor`)** | - ดูรายการผู้รับการประเมินทั้งหมด (`/evaluation`)<br>- ตรวจสอบและให้คะแนนการประเมินรายบุคคล (`/evaluation/[id]`)<br>- ดูผลคะแนนเปรียบเทียบระหว่างตนเองประเมินและผู้รับการประเมิน |
| **ผู้ดูแลระบบ (`admin`)** | - จัดการรอบการประเมิน (`/admin/periods`)<br>- จัดการหัวข้อเกณฑ์หลักและตัวชี้วัดย่อย (`/admin/criteria`)<br>- มอบหมายเกณฑ์ให้แต่ละตำแหน่งงานและบุคลากร (`/admin/positions`)<br>- สิทธิ์เข้าถึงทุกฟังก์ชันในระบบ |

---

## 🛠️ ขั้นตอนการรันระบบ (Getting Started)

### 1. เริ่มการทำงานของ MySQL Database
เปิด **XAMPP Control Panel** (`D:\XamppF\xampp-control.exe`) และกด **Start** ที่โมดูล **MySQL** (พอร์ต 3306)

### 2. รัน Backend API (`ccontest-main`)
```bash
cd d:\ALLwork\EvaluationV1-main\ccontest-main
npm install
npm run dev
```
> เซิร์ฟเวอร์ API จะเปิดให้บริการที่ `http://localhost:3333`

### 3. รัน Frontend (`ccfront-main`)
```bash
cd d:\ALLwork\EvaluationV1-main\ccfront-main
npm install
npm run dev
```
> หน้าเว็บแอปพลิเคชันจะเปิดที่ `http://localhost:3000`

---

## 🔑 บัญชีทดสอบในระบบ (Demo Accounts)

สามารถกดเลือกทดสอบได้ทันทีจากหน้า เข้าสู่ระบบ (`/login`):

- **ผู้ดูแลระบบ (Admin)**: `test` / `1234`
- **ผู้ประเมิน (Assessor)**: `testUser` / `1234`
- **บุคลากร (Staff/User)**: `user` / `1234` (หรือสมัครบัญชีใหม่ผ่านหน้าเว็บ)

---

## ⚙️ Environment Configuration

สามารถกำหนดค่า Base URL ของ API ได้ในไฟล์ `.env` ของ `ccfront-main`:
```env
NUXT_PUBLIC_API_BASE=http://localhost:3333/api
```
