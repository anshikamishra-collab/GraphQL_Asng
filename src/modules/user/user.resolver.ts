import { pool } from "../../config/db";
import * as authService from "./auth.service";

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

  Mutation: {
    createUser: async (_: any, { name, email }: any) => {
      try {
        const result = await pool.query(
          "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
          [name, email],
        );
        return result.rows[0];
      } catch (error: any) {
        if (error.code === "23505") {
          throw new Error(
            "A user with this email already exists. Please use a different email address.",
          );
        }
        throw error;
      }
    },
    register: async (_: any, args: any) => {
      return authService.register(args.name, args.email, args.password);
    },

    login: async (_: any, { email, password }: any) => {
      return authService.login(email, password);
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
