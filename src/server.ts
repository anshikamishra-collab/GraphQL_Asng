import "./config/db";
import { auth } from "express-oauth2-jwt-bearer";
import { pool } from "./config/db";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";

import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";

dotenv.config();

const checkJwt = auth({
  audience: "https://graph-api",
  issuerBaseURL: "https://dev-21v35bfkf3485r4d.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

async function startServer() {
  const app = express();

  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const authHeader = req.headers.authorization;

      if (!authHeader) return { user: null };

      try {
        await new Promise<void>((resolve, reject) => {
          checkJwt(req as any, {} as any, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });

        const payload = (req as any).auth.payload;

        const auth0Id = payload.sub;
        const email = payload.email;

        const existingUser = await pool.query(
          "SELECT * FROM users WHERE auth0_id = $1",
          [auth0Id],
        );

        let user;

        if (existingUser.rows.length === 0) {
          const result = await pool.query(
            "INSERT INTO users (email, auth0_id) VALUES ($1, $2) RETURNING *",
            [email, auth0Id],
          );
          user = result.rows[0];
        } else {
          user = existingUser.rows[0];
        }

        return { user };
      } catch (error) {
        return { user: null };
      }
    },
  });

  await server.start();

  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`,
    );
  });
}

startServer();
