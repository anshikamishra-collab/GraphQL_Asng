import { pool } from "../../config/db";
import * as taskService from "./task.service";

export const taskResolvers = {
  Query: {
    tasks: async (
      _: any,
      { projectId, status, limit = 10, offset = 0 }: any
    ) => {
      let query = "SELECT * FROM tasks WHERE 1=1";
      const values: any[] = [];

      if (projectId) {
        values.push(projectId);
        query += ` AND project_id = $${values.length}`;
      }

      if (status) {
        values.push(status);
        query += ` AND status = $${values.length}`;
      }

      values.push(limit, offset);
      query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

      const result = await pool.query(query, values);
      return result.rows;
    },
  },

  Mutation: {
    createTask: async (_: any, args: any) => {
      return taskService.createTask(args);
    },

    updateTaskStatus: async (_: any, { id, status }: any) => {
      return taskService.updateTaskStatus(id, status);
    },
  },

  Task: {
    project: async (parent: any) => {
      const result = await pool.query(
        "SELECT * FROM projects WHERE id = $1",
        [parent.project_id]
      );
      return result.rows[0];
    },

    assignedTo: async (parent: any) => {
      const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [parent.assigned_to]
      );
      return result.rows[0];
    },
  },
};