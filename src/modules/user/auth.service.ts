import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";

const JWT_SECRET = process.env.JWT_SECRET!;

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, hashedPassword],
    );

    const token = jwt.sign(
      { userId: result.rows[0].id, email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    return { token };
  } catch (error: any) {
    // PostgreSQL duplicate email error
    if (error.code === "23505") {
      throw new Error("Email already registered");
    }

    throw new Error("Registration failed");
  }
};

export const login = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new Error("Invalid password");

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};
