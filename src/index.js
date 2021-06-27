const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const port = process.env.PORT || 4000;

let notes = [
  { id: '1', content: 'frst note', author: 'Mary' },
  { id: '2', content: 'second note', author: 'James' },
  { id: '3', content: 'third note', author: 'Tom' }
];

const typeDefs = gql`
  type Query {
    hello: String
    notes: [Note!]
    singleNote(id: ID!): Note!
  }

  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Mutation {
    newNote(content: String!): Note!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello there',
    notes: () => notes,
    singleNote: (parent, args) => {
      return notes.find(singleNote => singleNote.id === args.id);
    }
  },

  Mutation: {
    newNote: (parent, args) => {
      let noteValue = {
        id: String(notes.length + 1),
        content: args.content,
        author: 'Adam'
      };
      notes.push(noteValue);
      return noteValue;
    }
  }
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => {
  console.log(`GraphQL server running at port ${port}${server.graphqlPath}`);
});

app.get('/', (req, res) => res.send('hello there'));
