import { gql } from "apollo-server-express";

export const typeDefs = gql`

  # ---------------- ENUM ----------------
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  # ---------------- TYPES ----------------
  type User {
    id: ID!
    name: String!
    email: String!
    projects: [Project]
    tasks: [Task]
  }

  type Project {
    id: ID!
    name: String!
    description: String
    createdBy: User!
    tasks(limit: Int, offset: Int, status: TaskStatus): [Task]
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    project: Project!
    assignedTo: User
  }

  # ---------------- AUTH PAYLOAD ----------------
  type AuthPayload {
    token: String!
    user: User!
  }

  # ---------------- QUERIES ----------------
  type Query {
    users(limit: Int, offset: Int): [User]
    projects(limit: Int, offset: Int): [Project]
    tasks(
      projectId: ID
      status: TaskStatus
      limit: Int
      offset: Int
    ): [Task]
  }

  # ---------------- MUTATIONS ----------------
  type Mutation {

    # Old logic still works
    createUser(name: String!, email: String!): User!
    createProject(name: String!, description: String!): Project!
    createTask(
      title: String!,
      description: String!,
      status: TaskStatus!,
      projectId: ID!,
      assignedTo: ID!
    ): Task!
    updateTaskStatus(id: ID!, status: TaskStatus!): Task!

    # NEW AUTH LOGIC
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;