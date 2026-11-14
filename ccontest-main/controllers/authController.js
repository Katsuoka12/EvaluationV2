const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน" });
    }

    const cleanUsername = String(username).trim();
    if (!cleanUsername) {
      return res.status(400).json({ message: "ชื่อผู้ใช้งานไม่ถูกต้อง" });
    }

    // ตรวจสอบว่าชื่อผู้ใช้งานซ้ำหรือไม่
    const existingUser = await db("users").where({ username: cleanUsername }).first();
    if (existingUser) {
      return res.status(400).json({ message: "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [newUserId] = await db("users").insert({
      username: cleanUsername,
      password: hash,
      role: role || "user",
    });

    // สร้างโปรไฟล์เริ่มต้นให้กับผู้ใช้ใหม่
    if (newUserId) {
      try {
        await db("profiles").insert({
          user_id: newUserId,
          full_name: cleanUsername,
          email: "",
          position: "",
          avatar_url: "",
        });
      } catch (profileErr) {
        // ละเว้นหากมีโปรไฟล์อยู่แล้ว
      }
    }

    res.status(201).json({ message: "user registered" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน" });
    }

    const cleanUsername = String(username).trim();
    const user = await db("users").where({ username: cleanUsername }).first();
    if (!user) {
      return res.status(400).json({ message: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};