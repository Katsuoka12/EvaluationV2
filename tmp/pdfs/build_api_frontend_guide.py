from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, Preformatted, KeepTogether)
from reportlab.lib.colors import HexColor
from xml.sax.saxutils import escape
import os

ROOT = r'D:\ALLwork\EvaluationV1-main'
OUT = os.path.join(ROOT, 'output', 'pdf', 'API_FRONTEND_GUIDE.pdf')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
pdfmetrics.registerFont(TTFont('Thai', r'C:\Windows\Fonts\LeelawUI.ttf'))
pdfmetrics.registerFont(TTFont('Thai-Bold', r'C:\Windows\Fonts\LeelaUIb.ttf'))
pdfmetrics.registerFont(TTFont('Mono', r'C:\Windows\Fonts\consola.ttf'))

NAVY = HexColor('#14263D')
BLUE = HexColor('#2563EB')
LIGHT = HexColor('#EFF6FF')
GRID = HexColor('#D7E0EA')
INK = HexColor('#263445')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleTH', fontName='Thai-Bold', fontSize=23, leading=30, textColor=NAVY, spaceAfter=6))
styles.add(ParagraphStyle(name='SubTH', fontName='Thai', fontSize=10, leading=15, textColor=HexColor('#53657A'), spaceAfter=13))
styles.add(ParagraphStyle(name='H1TH', fontName='Thai-Bold', fontSize=16, leading=21, textColor=NAVY, spaceBefore=6, spaceAfter=8))
styles.add(ParagraphStyle(name='H2TH', fontName='Thai-Bold', fontSize=11, leading=15, textColor=BLUE, spaceBefore=6, spaceAfter=4))
styles.add(ParagraphStyle(name='BodyTH', fontName='Thai', fontSize=9.3, leading=14, textColor=INK, spaceAfter=5))
styles.add(ParagraphStyle(name='SmallTH', fontName='Thai', fontSize=8, leading=11, textColor=INK))
styles.add(ParagraphStyle(name='CellTH', fontName='Thai', fontSize=7.5, leading=10.2, textColor=INK))
styles.add(ParagraphStyle(name='CellHead', fontName='Thai-Bold', fontSize=7.5, leading=10, textColor=colors.white))
styles.add(ParagraphStyle(name='CodeTH', fontName='Mono', fontSize=7.5, leading=10.5, textColor=NAVY, backColor=LIGHT, borderPadding=8, leftIndent=0, rightIndent=0, spaceBefore=3, spaceAfter=7))
styles.add(ParagraphStyle(name='NoteTH', fontName='Thai', fontSize=8.4, leading=12, textColor=HexColor('#7C3E00'), backColor=HexColor('#FFF7E6'), borderColor=HexColor('#F3C969'), borderWidth=.5, borderPadding=7, spaceBefore=5, spaceAfter=8))

def P(text, style='BodyTH'):
    return Paragraph(text, styles[style])

def table(rows, widths, header=True):
    cooked=[]
    for ri,row in enumerate(rows):
        cooked.append([P(str(c), 'CellHead' if header and ri==0 else 'CellTH') for c in row])
    t=Table(cooked, colWidths=widths, repeatRows=1 if header else 0, hAlign='LEFT')
    cmds=[('GRID',(0,0),(-1,-1),.45,GRID),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]
    if header: cmds += [('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,HexColor('#F7FAFC')])]
    t.setStyle(TableStyle(cmds)); return t

def page(canvas, doc):
    canvas.saveState(); w,h=A4
    canvas.setFillColor(BLUE); canvas.rect(0,h-5*mm,w,5*mm,stroke=0,fill=1)
    canvas.setStrokeColor(GRID); canvas.line(18*mm,15*mm,w-18*mm,15*mm)
    canvas.setFont('Thai',8); canvas.setFillColor(HexColor('#607286'))
    canvas.drawString(18*mm,10*mm,'คู่มือ API ที่ Frontend ใช้งาน | Personnel Evaluation')
    canvas.drawRightString(w-18*mm,10*mm,f'{doc.page}')
    canvas.restoreState()

doc=SimpleDocTemplate(OUT,pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=17*mm,bottomMargin=21*mm,title='API ที่ Frontend ใช้งาน - ระบบประเมินผลบุคลากร',author='Codex')
story=[]
story += [P('API ที่ Frontend ใช้งาน','TitleTH'),P('ระบบประเมินผลบุคลากร • สรุป endpoint, วิธีเรียก, payload และจุดใช้งานในหน้าเว็บ จากโค้ด ccfront-main และ ccontest-main','SubTH')]
story += [P('ภาพรวมการเรียก API','H1TH'),P('Frontend เรียก API ผ่าน <b>useApi()</b> โดย base URL อ่านจาก <b>runtimeConfig.public.apiBase</b> และใช้ค่าเริ่มต้น <b>http://localhost:3333/api</b> เมื่อไม่ได้กำหนดค่าอื่น คำสั่งใน <b>useEvaluation.ts</b> เป็นตัวเรียก endpoint กลุ่มประเมิน ส่วน <b>useAuth.ts</b> เรียก auth และ profile','BodyTH')]
story += [P('รูปแบบการยืนยันตัวตน','H2TH'),P('หลัง login สำเร็จ ระบบเก็บ JWT ใน cookie ชื่อ <b>auth_token</b> และแนบ header ให้อัตโนมัติใน request ที่ต้องยืนยันตัวตน: <b>Authorization: Bearer &lt;token&gt;</b> ส่วน body JSON ส่งผ่าน option <b>body</b> ของ $fetch','BodyTH')]
story += [P('ภาพรวมการทำงาน','H2TH'),table([
['กลุ่ม','ใช้ทำอะไร','Frontend ที่เรียก'],
['Auth','สมัครสมาชิกและเข้าสู่ระบบ','หน้า login.vue / useAuth.ts'],
['Profile','อ่านและบันทึกโปรไฟล์','หน้า profile.vue, layout และ login'],
['Evaluation','รอบ เกณฑ์ การมอบหมาย และคะแนน','หน้า admin/*, evaluation/*, dashboard'],
], [27*mm,68*mm,79*mm])]
story += [Spacer(1,5),P('ตัวอย่างเรียกจาก browser code','H2TH'),Preformatted("await apiFetch('/evaluation/periods')\nawait apiFetch('/profile', { method: 'PUT', body: { full_name, email, position, avatar_url } })",styles['CodeTH']),P('กรณีเรียกตรงด้วย curl ให้เพิ่ม Authorization header สำหรับทุก endpoint ที่ระบุว่า “ต้องใช้ token”','BodyTH')]

story += [PageBreak(),P('1. Auth และ Profile','H1TH')]
story += [table([
['Method / Path','Auth','ใช้จากหน้า/ฟังก์ชัน','ข้อมูลสำคัญ'],
['POST /auth/login','ไม่ต้อง','login.vue -> useAuth.login()','Body: { username, password }<br/>ตอบ: { token, role }'],
['POST /auth/register','ไม่ต้อง','login.vue โหมดสมัคร -> useAuth.register()','Body: { username, password, role? }<br/>ตอบ: { message }'],
['GET /profile','ต้องใช้ token','useAuth.fetchProfile() หลัง login และ layout/profile','ตอบ: { full_name, email, position, avatar_url }'],
['PUT /profile','ต้องใช้ token','profile.vue -> useAuth.saveProfile()','Body: โปรไฟล์ { full_name, email, position, avatar_url }'],
], [38*mm,22*mm,48*mm,66*mm])]
story += [P('ตัวอย่าง login','H2TH'),Preformatted("POST /api/auth/login\nContent-Type: application/json\n\n{\"username\":\"staff01\",\"password\":\"your-password\"}\n\nResponse: {\"token\":\"...\",\"role\":\"user\"}",styles['CodeTH']),P('หมายเหตุ: register ส่ง role ได้ (ค่าเริ่มต้น user) และหน้าเว็บแสดงตัวเลือก user, assessor, admin.','NoteTH')]
story += [P('2. รอบประเมินและเกณฑ์ KPI','H1TH')]
story += [table([
['Method / Path','Auth','ใช้จาก','ข้อมูลที่ส่ง/คืน'],
['GET /evaluation/periods','token','Admin periods, self-eval, evaluation list','รายการ { id, name, startDate, endDate, status }'],
['POST /evaluation/periods','token','Admin periods -> createPeriod','{ name, startDate, endDate, status? }'],
['DELETE /evaluation/periods/:id','token','Admin periods -> deletePeriod','ลบตาม id; ตอบ { message }'],
['GET /evaluation/criteria','token','Admin criteria/positions, self-eval, dashboard','รายการเกณฑ์พร้อม subItems'],
['POST /evaluation/criteria','token','Admin criteria -> createCriteria','{ name, description, requiresEvidence, periodStart?, periodEnd? }'],
['PUT /evaluation/criteria/:id','token','Admin criteria -> updateCriteria','ข้อมูลเกณฑ์และ subItems ทั้งชุด'],
['DELETE /evaluation/criteria/:id','token','Admin criteria -> deleteCriteria','ลบเกณฑ์ตาม id'],
['POST /evaluation/criteria/:id/subitems','token','Admin criteria -> addSubitem','{ name, type: "score" | "document" }'],
], [43*mm,15*mm,48*mm,68*mm])]

story += [PageBreak(),P('3. การประเมินและคะแนน','H1TH')]
story += [table([
['Method / Path','Auth','ใช้จากหน้า/ฟังก์ชัน','ข้อมูลที่ส่ง/คืน'],
['GET /evaluation','token','evaluation/index, my-eval, dashboard','รายการ { id, employee, position, period, status }'],
['POST /evaluation','token','Assessor สร้างรายการ; Staff สร้างรายการตนเองอัตโนมัติ','{ employee, position, periodId } -> รายการใหม่'],
['GET /evaluation/:id/scores','token','หน้า evaluation/[id] และ my-eval','รายการคะแนนตาม criteriaId/subitemId'],
['POST /evaluation/:id/scores','token','บันทึกคะแนน Staff และ Assessor','{ scores: [{ subitemId, selfScore?, managerScore?, note? }] }'],
['PUT /evaluation/:id/submit','token','กดยืนยันส่งในหน้า self-eval/assessor detail','เปลี่ยน status เป็น completed'],
], [47*mm,15*mm,47*mm,65*mm])]
story += [P('ตัวอย่างบันทึกคะแนน','H2TH'),Preformatted("POST /api/evaluation/42/scores\nAuthorization: Bearer <JWT>\nContent-Type: application/json\n\n{\n  \"scores\": [{\n    \"subitemId\": 7, \"selfScore\": 4,\n    \"managerScore\": 3, \"note\": \"แนบหลักฐาน...\"\n  }]\n}",styles['CodeTH']),P('คะแนนถูกบันทึกแยกตาม evaluation_id + subitem_id; ส่งเฉพาะช่องที่ต้องการอัปเดตก็ได้ ค่า status จะเปลี่ยนเป็น completed เมื่อเรียก submit','BodyTH')]
story += [P('4. ตำแหน่งและการมอบหมายเกณฑ์','H1TH'),table([
['Method / Path','Auth','ใช้จาก','ข้อมูลที่ส่ง/คืน'],
['GET /evaluation/positions','token','Admin positions และสร้างรายการประเมิน','รายชื่อ { userId, employee, position } ของ role user ที่มีตำแหน่ง'],
['GET /evaluation/my-criteria','token','Staff self-eval','รายการ criteriaId สำหรับ user ปัจจุบัน'],
['GET /evaluation/employee-criteria','token','Admin positions','รายการ mapping { userId, criteriaId } ทั้งหมด'],
['POST /evaluation/position-config','token','Admin positions -> savePositionConfig','{ positionName, employeeIds: [], criteriaIds: [] }'],
], [47*mm,15*mm,43*mm,69*mm])]
story += [P('บันทึก mapping จะลบ mapping เดิมของ user ที่เลือกทั้งหมดก่อน แล้วสร้าง mapping ใหม่จาก employeeIds คูณ criteriaIds ที่ส่งมา.','NoteTH')]

story += [PageBreak(),P('5. Endpoint ที่มีใน Backend แต่ Frontend ไม่เรียก','H1TH'),table([
['Method / Path','สิทธิ์ฝั่ง backend','หมายเหตุ'],
['GET /auth/user','JWT + role user/admin/assessor','ตอบข้อความตัวอย่าง user content; ไม่พบการเรียกจาก frontend'],
['GET /auth/admin','JWT + role admin','ตอบข้อความตัวอย่าง admin content; ไม่พบการเรียกจาก frontend'],
['GET /auth/assessor','JWT + role assessor','ตอบข้อความตัวอย่าง assessor content; ไม่พบการเรียกจาก frontend'],
['POST /profile','JWT','มี route ซ้ำสำหรับบันทึกโปรไฟล์ แต่หน้าเว็บใช้ PUT /profile'],
], [38*mm,48*mm,88*mm])]
story += [P('วิธีไล่ตามในโค้ด','H2TH'),P('ดู mapping ของ method/path และ payload ใน <b>ccfront-main/composables/useEvaluation.ts</b>; วิธีแนบ token และ base URL อยู่ใน <b>ccfront-main/composables/useApi.ts</b>; login/profile อยู่ใน <b>ccfront-main/composables/useAuth.ts</b>. ฝั่ง backend กำหนด path ใน <b>ccontest-main/routes/</b> และ logic ใน <b>ccontest-main/controllers/</b>.','BodyTH')]
story += [P('สิ่งที่ควรทราบในการใช้งาน','H2TH'),P('Backend บังคับ JWT กับ API ส่วนใหญ่ แต่ route ของ evaluation ใช้ verifyToken โดยไม่มี allowRole เพิ่ม ขณะที่การซ่อนเมนู Admin เป็นการควบคุมฝั่ง frontend; หน้า register ยังเปิดให้เลือก role ได้ เอกสารนี้อธิบายการใช้งานตามโค้ดปัจจุบัน ไม่ได้ยืนยันนโยบายสิทธิ์ที่ควรใช้ใน production.','NoteTH')]
story += [P('ตารางอ้างอิง endpoint ที่ Frontend เรียกทั้งหมด','H2TH'),P('<b>Auth/Profile:</b> POST /auth/login, POST /auth/register, GET /profile, PUT /profile.<br/><b>Evaluation:</b> GET/POST /evaluation, GET/POST /evaluation/:id/scores, PUT /evaluation/:id/submit, GET/POST /evaluation/periods, DELETE /evaluation/periods/:id, GET/POST /evaluation/criteria, PUT/DELETE /evaluation/criteria/:id, POST /evaluation/criteria/:id/subitems, GET /evaluation/positions, GET /evaluation/my-criteria, GET /evaluation/employee-criteria, POST /evaluation/position-config.','BodyTH')]

doc.build(story,onFirstPage=page,onLaterPages=page)
print(OUT)
