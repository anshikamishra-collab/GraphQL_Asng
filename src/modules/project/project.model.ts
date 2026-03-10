import { pool } from "../../config/db";

export const ProjectModel = {

  async findAll(limit: number, offset: number) {
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  },

  async create(name: string, description: string, createdBy: string) {
    const result = await pool.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, createdBy]
    );
    return result.rows[0];
  },

};