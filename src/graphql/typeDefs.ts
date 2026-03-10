import { gql } from "apollo-server-express";

export const typeDefs = gql`

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
    tasks(limit: Int, offset: Int, status: String): [Task]
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    project: Project!
    assignedTo: User
  }

  type Query {
    users(limit: Int, offset: Int): [User]
    projects(limit: Int, offset: Int): [Project]
    tasks(
      projectId: ID
      status: String
      limit: Int
      offset: Int
    ): [Task]
  }

  type Mutation {
  createUser(name: String!, email: String!): User!
  createProject(name: String!, description: String!, createdBy: ID!): Project!
  createTask(
    title: String!,
    description: String!,
    status: String!,
    projectId: ID!,
    assignedTo: ID!
  ): Task!
  updateTaskStatus(id: ID!, status: String!): Task!
}
`;