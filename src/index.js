const express = require("express");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();

const db = require("./db");
const models = require("./models");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Session Invalid");
    }
  }
};

// let notes = [
//   { id: "1", content: "frst note", author: "Mary" },
//   { id: "2", content: "second note", author: "James" },
//   { id: "3", content: "third note", author: "Tom" },
// ];

const app = express();
db.connect(DB_HOST);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization;

    const user = getUser(token);
    console.log(user);

    // add db models to the context
    return { models, user };
  },
});

server.applyMiddleware({ app, path: "/api" });

app.listen({ port }, () => {
  console.log(`GraphQL server running at port ${port}${server.graphqlPath}`);
});
