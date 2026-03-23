import { userResolvers } from "../modules/user/user.resolver";
import { projectResolvers } from "../modules/project/project.resolver";
import { taskResolvers } from "../modules/task/task.resolver";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...taskResolvers.Query,
  },

  Mutation: {
    ...projectResolvers.Mutation,
    ...taskResolvers.Mutation,
  },

  User: {
    ...userResolvers.User,
  },

  Project: {
    ...projectResolvers.Project,
  },

  Task: {
    ...taskResolvers.Task,
  },
};