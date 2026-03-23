import { pool } from "../../config/db";
export const userResolvers = {
  Query: {
    users: async (_: any, { limit = 10, offset = 0 }: any) => {
      const result = await pool.query(
        "SELECT * FROM users LIMIT $1 OFFSET $2",
        [limit, offset],
      );
      return result.rows;
    },
  },

  User: {
    projects: async (parent: any) => {
      const result = await pool.query(
        "SELECT * FROM projects WHERE created_by = $1",
        [parent.id],
      );
      return result.rows;
    },

    tasks: async (parent: any) => {
      const result = await pool.query(
        "SELECT * FROM tasks WHERE assigned_to = $1",
        [parent.id],
      );
      return result.rows;
    },
  },
};
