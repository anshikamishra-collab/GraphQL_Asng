import { pool } from "../../config/db";

export const projectResolvers = {
  Query: {
    projects: async (_: any, { limit = 10, offset = 0 }: any) => {
      const result = await pool.query(
        "SELECT * FROM projects LIMIT $1 OFFSET $2",
        [limit, offset],
      );
      return result.rows;
    },
  },

  Mutation: {
    createProject: async (_: any, { name, description }: any, context: any) => {
      // 🔐 AUTH CHECK
      if (!context.user) {
        throw new Error(
          "You must be logged in to create a project. Please sign in and try again.",
        );
      }

      const userId = context.user.userId;

      const result = await pool.query(
        `INSERT INTO projects (name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description, userId],
      );

      return result.rows[0];
    },
  },

  Project: {
    createdBy: async (parent: any) => {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        parent.created_by,
      ]);
      return result.rows[0];
    },

    tasks: async (parent: any, { limit = 10, offset = 0, status }: any) => {
      let query = "SELECT * FROM tasks WHERE project_id = $1";
      const values: any[] = [parent.id];

      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex}`;
        values.push(status);
        paramIndex++;
      }

      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      return result.rows;
    },
  },
};
