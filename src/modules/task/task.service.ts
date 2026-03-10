import { pool } from "../../config/db";

export const createTask = async (data: any) => {
  const { title, description, status, projectId, assignedTo } = data;

  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, project_id, assigned_to)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, status, projectId, assignedTo],
  );

  return result.rows[0];
};

export const updateTaskStatus = async (id: string, status: string) => {
  const result = await pool.query(
    `UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *`,
    [status, id],
  );

  return result.rows[0];
};
