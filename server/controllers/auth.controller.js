import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../config/db.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Signup success",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);

  if (!user.length) {
    return res.status(404).json({ message: "Email not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const expire = new Date(Date.now() + 15 * 60 * 1000);

  await db.query(
    "UPDATE users SET reset_token=?, reset_token_expire=? WHERE email=?",
    [token, expire, email]
  );

  const resetLink = `http://localhost:3000/auth/reset-password/${token}`;

  res.json({
    message: "Reset link created",
    resetLink
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const [users] = await db.query(
    "SELECT * FROM users WHERE reset_token=? AND reset_token_expire > NOW()",
    [token]
  );

  if (!users.length) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    "UPDATE users SET password=?, reset_token=NULL, reset_token_expire=NULL WHERE id=?",
    [hashedPassword, users[0].id]
  );

  res.json({ message: "Password updated" });
};