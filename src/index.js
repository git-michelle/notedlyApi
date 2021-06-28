const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
require("dotenv").config();
const db = require("./db");
const models = require("./models");
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

console.log("bonk ", DB_HOST);

// let notes = [
//   { id: "1", content: "frst note", author: "Mary" },
//   { id: "2", content: "second note", author: "James" },
//   { id: "3", content: "third note", author: "Tom" },
// ];

const typeDefs = gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Query {
    hello: String
    notes: [Note]
    singleNote(id: ID!): Note
  }

  type Mutation {
    newNote(content: String!): Note!
  }
`;

const resolvers = {
  Query: {
    hello: () => "hello there",
    notes: async () => {
      return await models.Note.find();
    },
    singleNote: async (parent, args) => {
      return await models.Note.findById(args.id);
    },
  },

  Mutation: {
    newNote: async (parent, args) => {
      return await models.Note.create({
        content: args.content,
        author: "Michelle",
      });
    },
  },
};

const app = express();
db.connect(DB_HOST);

const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app, path: "/api" });

app.listen({ port }, () => {
  console.log(`GraphQL server running at port ${port}${server.graphqlPath}`);
});

// app.get("/", (req, res) => res.send("hello there"));
