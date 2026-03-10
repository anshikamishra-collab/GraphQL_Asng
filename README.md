# GraphQL Project & Task Management API

A GraphQL API built using **Node.js, Express, Apollo Server, TypeScript, and PostgreSQL**.

This project implements a Project & Task Management system with proper relational database design, pagination, filtering, and modular architecture.

---

## 🚀 Tech Stack

- Node.js
- Express
- Apollo Server (GraphQL)
- TypeScript
- PostgreSQL
- pg (node-postgres)

---

## 🗄 Database Design

### Tables:

- **users**
- **projects**
- **tasks**

### Relationships:

- User → Projects (created_by)
- Project → Tasks (project_id)
- Task → Assigned User (assigned_to)

### ENUM:

task_status = TODO | IN_PROGRESS | DONE